"""
AgriQ — FastAPI Disease Detection API
======================================
Production REST API integrating with the AgriQ platform backend.
Exposes:
  POST /predict          — single image prediction
  POST /predict/batch    — multiple images
  GET  /health           — health check
  GET  /classes          — list all detectable diseases

Usage:
    uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload

Then call from Node.js backend:
    POST http://localhost:8000/predict
    Content-Type: multipart/form-data
    Body: image file
"""

import os
import io
import sys
import time
import base64
from pathlib import Path
from typing import Optional, List

import numpy as np
from PIL import Image

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import yaml

sys.path.append(str(Path(__file__).parent.parent))
from src.predict import AgriQPredictor


# ─────────────────────────────────────────────
#  App Setup
# ─────────────────────────────────────────────

app = FastAPI(
    title="AgriQ Disease Detection API",
    description="Deep Learning crop disease prediction for Indian farmers",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor (loaded once at startup)
predictor: Optional[AgriQPredictor] = None


# ─────────────────────────────────────────────
#  Response Models
# ─────────────────────────────────────────────

class PredictionTop2(BaseModel):
    rank: int
    crop: str
    disease: str
    confidence: float

class PredictionResponse(BaseModel):
    success: bool
    crop: str
    disease: str
    is_healthy: bool
    confidence: float
    is_uncertain: bool
    severity: str
    severity_icon: str
    immediate_action: str
    treatment: Optional[str]
    prevention: str
    organic_option: Optional[str]
    yield_impact: str
    farmer_message: str
    top2: List[PredictionTop2]
    gradcam_base64: Optional[str] = None
    processing_time_ms: float

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    num_classes: int
    device: str


# ─────────────────────────────────────────────
#  Startup / Shutdown
# ─────────────────────────────────────────────

@app.on_event("startup")
async def load_models():
    global predictor

    try:
        with open("configs/config.yaml") as f:
            config = yaml.safe_load(f)

        import torch
        device = (
            torch.device("mps") if torch.backends.mps.is_available()
            else torch.device("cuda") if torch.cuda.is_available()
            else torch.device("cpu")
        )

        eff_path = os.path.join(config["export"]["save_dir"], config["export"]["efficientnet_name"])
        mob_path = os.path.join(config["export"]["save_dir"], config["export"]["mobilenet_name"])

        if not os.path.exists(eff_path) or not os.path.exists(mob_path):
            print(f"⚠️  Model files not found. Train models first:")
            print(f"   python src/train.py --model both --data_dir <path>")
            return

        predictor = AgriQPredictor(
            efficientnet_path=eff_path,
            mobilenet_path=mob_path,
            device=device,
            tta_n=config["inference"]["tta_augments"],
            eff_weight=config["inference"]["ensemble_weights"]["efficientnet"],
            mob_weight=config["inference"]["ensemble_weights"]["mobilenet"],
        )
        print(f"✅ AgriQ API ready on {device}")

    except Exception as e:
        print(f"❌ Model loading failed: {e}")


# ─────────────────────────────────────────────
#  Endpoints
# ─────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "ok" if predictor else "models_not_loaded",
        "model_loaded": predictor is not None,
        "num_classes": len(predictor.classes) if predictor else 0,
        "device": str(predictor.device) if predictor else "none",
    }


@app.get("/classes")
async def get_classes():
    """Returns all detectable diseases grouped by crop."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Models not loaded")

    crops = {}
    for cls in predictor.classes:
        parts   = cls.split("___")
        crop    = parts[0]
        disease = parts[1].replace("_", " ").title() if len(parts) > 1 else "Healthy"
        crops.setdefault(crop, []).append(disease)

    return {"total_classes": len(predictor.classes), "crops": crops}


@app.post("/predict", response_model=PredictionResponse)
async def predict_disease(
    file: UploadFile = File(...),
    return_gradcam: bool = False,
):
    """
    Predict crop disease from an uploaded image.
    
    - **file**: Image file (JPG, PNG, WEBP)
    - **return_gradcam**: If true, returns base64 GradCAM heatmap overlay
    
    Returns structured prediction with farmer advisory.
    """
    if not predictor:
        raise HTTPException(status_code=503, detail="Models not loaded. Train models first.")

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Use JPG/PNG/WEBP."
        )

    # Read and validate image
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)

        # Validate dimensions
        h, w = image_np.shape[:2]
        if h < 50 or w < 50:
            raise HTTPException(status_code=400, detail="Image too small. Min 50x50 pixels.")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    # Run prediction
    t0 = time.time()
    try:
        result = predictor.predict_image(image_np, return_gradcam=return_gradcam)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    processing_ms = (time.time() - t0) * 1000

    # Handle GradCAM
    gradcam_b64 = None
    if return_gradcam and result.get("gradcam_overlay") is not None:
        overlay_img = Image.fromarray(result["gradcam_overlay"])
        buf = io.BytesIO()
        overlay_img.save(buf, format="PNG")
        gradcam_b64 = base64.b64encode(buf.getvalue()).decode()

    # ----------------------------------------------------
    #  Print evaluation metrics to command line
    # ----------------------------------------------------
    print("\n" + "="*60)
    print(" 📊 AGRIQ MODEL EVALUATION & INFERENCE MATRIX ")
    print("="*60)
    print(f" Timestamp      : {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f" Processing Time: {processing_ms:.1f} ms")
    print(f" Primary Crop   : {result['crop']}")
    print(f" Diagnosis      : {result['disease']}")
    print(f" Healthy Flag   : {'Yes' if result['is_healthy'] else 'No'}")
    print(f" Severity       : {result['severity'].upper()}")
    print("-" * 60)
    print(f" {'Rank':<5} | {'Crop':<15} | {'Disease':<20} | {'Confidence'}")
    print("-" * 60)
    for p in result['top2']:
        print(f" {p['rank']:<5} | {p['crop']:<15} | {p['disease']:<20} | {p['confidence']}%")
    print("="*60 + "\n")

    return {
        "success":          True,
        "crop":             result["crop"],
        "disease":          result["disease"],
        "is_healthy":       result["is_healthy"],
        "confidence":       result["confidence"],
        "is_uncertain":     result["is_uncertain"],
        "severity":         result["severity"],
        "severity_icon":    result["severity_icon"],
        "immediate_action": result["immediate_action"],
        "treatment":        result["treatment"],
        "prevention":       result["prevention"],
        "organic_option":   result["organic_option"],
        "yield_impact":     result["yield_impact"],
        "farmer_message":   result["farmer_message"],
        "top2":             result["top2"],
        "gradcam_base64":   gradcam_b64,
        "processing_time_ms": round(processing_ms, 1),
    }


@app.post("/predict/batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """Batch prediction for multiple images."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Models not loaded")
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Max 10 images per batch")

    results = []
    for file in files:
        contents = await file.read()
        try:
            image    = np.array(Image.open(io.BytesIO(contents)).convert("RGB"))
            result   = predictor.predict_image(image)
            results.append({"filename": file.filename, "success": True, **result})
        except Exception as e:
            results.append({"filename": file.filename, "success": False, "error": str(e)})

    return {"count": len(results), "results": results}


# ─────────────────────────────────────────────
#  Run
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=False)
