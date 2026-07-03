"""
AgriQ — Inference Engine
=========================
Production-ready predictor with:
  - Weighted Ensemble (EfficientNet 65% + MobileNet 35%)
  - Test-Time Augmentation (8 passes)
  - GradCAM explainability heatmaps
  - Structured farmer-facing output
  - Uncertainty flags for low-confidence predictions

Usage:
    predictor = AgriQPredictor(eff_path, mob_path, device)
    result = predictor.predict_image(pil_image)
    print(result['advisory'])
"""

import sys
import io
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Union

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
import albumentations as A

sys.path.append(str(Path(__file__).parent.parent))
from src.models import AgriQEfficientNet, AgriQMobileNet, AgriQEnsemble
from src.dataset import get_tta_transforms, get_val_transform, IMAGENET_MEAN, IMAGENET_STD


# ─────────────────────────────────────────────
#  Disease Advisory Database
#  (Maps PlantVillage class → farmer guidance)
# ─────────────────────────────────────────────

DISEASE_ADVISORY = {
    "healthy": {
        "severity": "none",
        "icon": "✅",
        "immediate_action": "No action needed. Your crop looks healthy!",
        "treatment": None,
        "prevention": "Continue regular monitoring every 7-10 days. Maintain proper irrigation and fertilization.",
        "organic_option": None,
        "estimated_yield_impact": "0%",
    },
    # Tomato & Potato Blights
    "late_blight": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Act within 24-48 hours. Remove and destroy infected leaves immediately. Do NOT compost them.",
        "treatment": "Chemical Pesticide: Spray Mancozeb 75% WP (2.5g/L water) or Metalaxyl 8% + Mancozeb 64% WP (2.5g/L water). Apply thoroughly covering both leaf surfaces.",
        "prevention": "Ensure good air circulation. Avoid overhead irrigation. Apply preventive copper-based sprays.",
        "organic_option": "Organic: Copper hydroxide spray (Blitox) — 3g/L water. Apply in early morning.",
        "estimated_yield_impact": "30-70% if untreated",
    },
    "early_blight": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Remove lower infected leaves. Apply fungicide within 5-7 days.",
        "treatment": "Chemical Pesticide: Chlorothalonil 75% WP (2g/L water) or Propineb 70% WP (3g/L water). Repeat after 10-14 days depending on weather.",
        "prevention": "Crop rotation every season. Remove plant debris after harvest. Avoid wetting foliage.",
        "organic_option": "Organic: Neem oil spray (5ml/L) + liquid soap (2ml/L) or Bacillus subtilis-based bio-fungicides.",
        "estimated_yield_impact": "10-30% if untreated",
    },
    # Corn Diseases
    "northern_leaf_blight": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Monitor fields, especially before tasseling. If lesions are present on upper leaves, prepare for treatment.",
        "treatment": "Chemical Pesticide: Azoxystrobin 18.2% + Difenoconazole 11.4% SC (1ml/L water) or Pyraclostrobin (1ml/L water). Apply at VT (tasseling) stage.",
        "prevention": "Use resistant hybrids. Practice crop rotation (1-2 years). Deep plowing to bury infected crop residues.",
        "organic_option": "Organic: Copper-based fungicides can provide limited preventive control. Proper crop rotation is the best organic approach.",
        "estimated_yield_impact": "15-30% if untreated",
    },
    "common_rust": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Apply fungicide immediately if pustules cover more than 5% of leaf area before the silk stage.",
        "treatment": "Chemical Pesticide: Propiconazole 25% EC (1ml/L water) or Tebuconazole 25.9% EC (1ml/L water). Apply immediately upon detection.",
        "prevention": "Plant rust-resistant corn varieties. Early sowing helps avoid peak rust season.",
        "organic_option": "Organic: Sulphur 80% WP (3g/L) applied early in the infection cycle.",
        "estimated_yield_impact": "40-80% if untreated",
    },
    "gray_leaf_spot": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Check lower leaves for rectangular brown spots. Act fast as it spreads upward quickly.",
        "treatment": "Chemical Pesticide: Trifloxystrobin 25% + Tebuconazole 50% WG (0.5g/L water). Spray thoroughly.",
        "prevention": "Resistant hybrids and managing residue (tillage) are critical.",
        "organic_option": "Organic: Limited options. Focus on residue management and resistant varieties.",
        "estimated_yield_impact": "20-50% if untreated",
    },
    # Tomato & Pepper specific
    "bacterial_spot": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Remove heavily infected plant parts. Avoid working in fields when foliage is wet.",
        "treatment": "Chemical Pesticide: Copper oxychloride 50% WP (3g/L) + Streptocycline (200ppm/0.2g/L). Apply every 10-14 days.",
        "prevention": "Use certified disease-free seeds. Avoid overhead irrigation. Balanced potassium application.",
        "organic_option": "Organic: Bordeaux mixture (1%) application every 15 days.",
        "estimated_yield_impact": "15-40% if untreated",
    },
    "septoria_leaf_spot": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Remove infected lower leaves. Do not compost them.",
        "treatment": "Chemical Pesticide: Chlorothalonil (2g/L water) or Mancozeb (2.5g/L water). Spray every 7-10 days.",
        "prevention": "Stake plants to improve air circulation. Mulch around the base to prevent soil splashing.",
        "organic_option": "Organic: Copper sprays and bio-fungicides like Trichoderma viride.",
        "estimated_yield_impact": "20-40% if untreated",
    },
    "leaf_mold": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Improve ventilation immediately if growing in a greenhouse or polyhouse.",
        "treatment": "Chemical Pesticide: Difenoconazole 25% EC (1ml/L water) or Azoxystrobin 23% SC (1ml/L water).",
        "prevention": "Maintain lower humidity (below 85%). Maximize air flow around plants.",
        "organic_option": "Organic: Potassium bicarbonate (5g/L water) can help slow the spread.",
        "estimated_yield_impact": "10-20% if untreated",
    },
    "spider_mites": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Isolate the plant. Increase humidity around the plant as mites thrive in dry conditions.",
        "treatment": "Chemical Pesticide: Spiromesifen 22.9% SC (1ml/L water) or Abamectin 1.9% EC (0.5ml/L water). Spray thoroughly, especially under leaves.",
        "prevention": "Avoid drought stress on plants. Encourage natural predators like ladybugs.",
        "organic_option": "Organic: Neem oil (5ml/L) or Horticultural oils (2%). Wash plants with a strong stream of water.",
        "estimated_yield_impact": "20-60% if untreated",
    },
    # Viruses
    "mosaic_virus": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Remove and destroy the entire infected plant immediately. DO NOT touch healthy plants after touching an infected one.",
        "treatment": "Chemical Pesticide: No chemical cure for viruses. Control insect vectors with Imidacloprid 17.8% SL (0.5ml/L water).",
        "prevention": "Use virus-free certified seeds. Disinfect tools. Control aphids and whiteflies.",
        "organic_option": "Organic: Sticky yellow traps for vector insects. Reflective mulch to repel aphids. Plant marigolds as trap crops.",
        "estimated_yield_impact": "50-100% in infected plants",
    },
    "yellow_leaf_curl_virus": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Uproot and burn infected plants. This virus spreads rapidly via whiteflies.",
        "treatment": "Chemical Pesticide: No cure. Kill whiteflies using Thiamethoxam 25% WG (0.5g/L water) or Diafenthiuron 50% WP (1g/L water).",
        "prevention": "Use fine insect mesh in nurseries. Plant resistant varieties.",
        "organic_option": "Organic: Neem-based bio-pesticides (10000 ppm) at 2ml/L to deter whiteflies.",
        "estimated_yield_impact": "70-100% in infected plants",
    },
    # Soybean specific
    "frogeye_leaf_spot": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Assess the percentage of leaf area affected. Treatment is needed if observed before the R5 (seed development) stage.",
        "treatment": "Chemical Pesticide: Pyraclostrobin (1ml/L water) or Flutriafol (1ml/L water). Apply at early pod setting.",
        "prevention": "Use resistant soybean varieties. Tillage to bury infected debris.",
        "organic_option": "Organic: Limited options. Focus strictly on crop rotation and clean seed.",
        "estimated_yield_impact": "10-30% if untreated",
    },
    "downy_mildew": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Monitor for yellow/pale green spots on upper leaf surfaces.",
        "treatment": "Chemical Pesticide: Metalaxyl 8% + Mancozeb 64% WP (2.5g/L water).",
        "prevention": "Ensure good drainage. Do not plant too densely. Rotate with non-legume crops.",
        "organic_option": "Organic: Copper fungicides applied as early preventives.",
        "estimated_yield_impact": "10-20% if untreated",
    },
    # General
    "powdery_mildew": {
        "severity": "medium",
        "icon": "🟡",
        "immediate_action": "Apply fungicide on both upper and lower leaf surfaces.",
        "treatment": "Chemical Pesticide: Hexaconazole 5% SC (2ml/L water) or Carbendazim 50% WP (1g/L water). Apply twice at 10-day intervals.",
        "prevention": "Improve air circulation by pruning. Avoid excess nitrogen. Plant resistant varieties.",
        "organic_option": "Organic: Potassium bicarbonate (5g/L water) or baking soda (5g/L) + neem oil (5ml/L).",
        "estimated_yield_impact": "10-25% if untreated",
    },
    "leaf_rust": {
        "severity": "high",
        "icon": "🔴",
        "immediate_action": "Apply fungicide immediately. Rust spreads very fast through wind.",
        "treatment": "Chemical Pesticide: Propiconazole 25% EC (1ml/L water). Or Tebuconazole 250 EC (1ml/L). Spray 2-3 times at 14-day intervals.",
        "prevention": "Plant rust-resistant varieties. Early sowing to avoid rust season. Balanced nitrogen application.",
        "organic_option": "Organic: Sulphur 80% WP (3g/L) — effective if applied early.",
        "estimated_yield_impact": "40-80% if untreated",
    },
    "default": {
        "severity": "medium",
        "icon": "🟠",
        "immediate_action": "Consult your nearest Krishi Vigyan Kendra (KVK) or agriculture officer for specific advice.",
        "treatment": "Chemical Pesticide: Identify the specific disease and apply the recommended broad-spectrum fungicide or bactericide.",
        "prevention": "Maintain crop hygiene. Ensure balanced fertilization. Regular field monitoring.",
        "organic_option": "Organic: Neem-based products (5ml/L) as a general preventive measure.",
        "estimated_yield_impact": "Varies by disease severity",
    },
}

def get_disease_advisory(disease_name: str) -> dict:
    """Match disease name to advisory using keyword matching."""
    disease_lower = disease_name.lower().replace(" ", "_")
    for key in DISEASE_ADVISORY:
        if key in disease_lower or disease_lower in key:
            return DISEASE_ADVISORY[key]
    return DISEASE_ADVISORY["default"]


# ─────────────────────────────────────────────
#  Main Predictor
# ─────────────────────────────────────────────

class AgriQPredictor:
    """
    Production inference engine for AgriQ.
    Wraps the trained ensemble + TTA for farmer-facing predictions.
    """

    def __init__(
        self,
        efficientnet_path: str,
        mobilenet_path: str,
        device: Optional[torch.device] = None,
        tta_n: int = 8,
        eff_weight: float = 0.65,
        mob_weight: float = 0.35,
        target_classes: list = None,
        temperature: float = 0.5,
    ):
        # Temperature Scaling: T < 1 sharpens confidence (counteracts label smoothing & TTA dilution)
        # T = 0.5 is calibrated for label_smoothing=0.1 on 28-class PlantVillage
        # Increase T toward 1.0 if scores seem overconfident; decrease toward 0.3 to sharpen more
        self.temperature = temperature
        self.device = device or (
            torch.device("mps") if torch.backends.mps.is_available()
            else torch.device("cuda") if torch.cuda.is_available()
            else torch.device("cpu")
        )
        self.tta_n = tta_n
        self.img_size = 224

        print(f"🔧 Loading AgriQ Ensemble on {self.device}...")

        # Load EfficientNet
        eff_ckpt = torch.load(efficientnet_path, map_location=self.device)
        self.eff_classes = eff_ckpt["class_names"]
        eff_num_classes  = len(self.eff_classes)
        self.classes = target_classes or self.eff_classes
        num_classes  = len(self.classes)

        eff_model = AgriQEfficientNet(eff_num_classes, pretrained=False)
        eff_model.load_state_dict(eff_ckpt["model_state"])
        eff_model.to(self.device).eval()

        # Load MobileNet
        mob_ckpt  = torch.load(mobilenet_path, map_location=self.device)
        self.mob_classes = mob_ckpt["class_names"]
        mob_num_classes  = len(self.mob_classes)
        mob_model = AgriQMobileNet(mob_num_classes, pretrained=False)
        mob_model.load_state_dict(mob_ckpt["model_state"])
        mob_model.to(self.device).eval()

        # Build ensemble
        self.ensemble = AgriQEnsemble(
            eff_model, mob_model, eff_weight, mob_weight, self.device,
            eff_classes=self.eff_classes,
            mob_classes=self.mob_classes,
            target_classes=self.classes
        )

        # TTA transforms
        self.tta_transforms = get_tta_transforms(self.img_size)[:tta_n]
        self.val_transform  = get_val_transform(self.img_size)

        print(f"✅ Ensemble loaded: EfficientNet ({eff_num_classes}), MobileNet ({mob_num_classes}) mapped to {num_classes} output classes, TTA={tta_n}")

    def _preprocess(self, image_np: np.ndarray, transform=None) -> torch.Tensor:
        """Preprocess numpy image to tensor."""
        if transform is None:
            transform = self.val_transform
        tensor = transform(image=image_np)["image"]
        return tensor.unsqueeze(0)  # Add batch dim

    @torch.no_grad()
    def predict_tta_batch(self, batch: torch.Tensor) -> torch.Tensor:
        """Apply TTA to a batch of pre-processed tensors."""
        # Can't apply spatial TTA to batches easily — use ensemble only for batch eval
        return self.ensemble(batch)

    @torch.no_grad()
    def predict_image(
        self,
        image: Union[np.ndarray, Image.Image, bytes],
        return_gradcam: bool = False,
    ) -> Dict:
        """
        Main inference method — processes one image end-to-end.
        
        Args:
            image: PIL Image, numpy array (H,W,3), or raw bytes
            return_gradcam: If True, compute GradCAM heatmap overlay
        
        Returns:
            Structured result dict with prediction + farmer advisory
        """
        # Convert to numpy
        if isinstance(image, bytes):
            image = np.array(Image.open(io.BytesIO(image)).convert("RGB"))
        elif isinstance(image, Image.Image):
            image = np.array(image.convert("RGB"))
        image_np = image.copy()

        # ── TTA: Run through all N transforms and collect RAW LOGITS (not softmax yet)
        all_logits = []
        for tta_transform in self.tta_transforms:
            tensor = self._preprocess(image_np, tta_transform).to(self.device)
            # Get raw logits from each model before softmax
            with torch.no_grad():
                eff_logits = self.ensemble.efficientnet(tensor)  # (1, eff_classes)
                mob_logits = self.ensemble.mobilenet(tensor)     # (1, mob_classes)

            # Map to shared target class space
            shared_logits = torch.zeros(1, len(self.classes), device=self.device)
            for tgt_idx, src_idx in enumerate(self.ensemble.eff_idx_map):
                if src_idx != -1:
                    shared_logits[0, tgt_idx] += 0.65 * eff_logits[0, src_idx]
            for tgt_idx, src_idx in enumerate(self.ensemble.mob_idx_map):
                if src_idx != -1:
                    shared_logits[0, tgt_idx] += 0.35 * mob_logits[0, src_idx]

            all_logits.append(shared_logits)

        # Average logits across TTA passes, then apply Temperature Scaling before softmax
        avg_logits = torch.stack(all_logits).mean(0)         # (1, num_classes)
        scaled_logits = avg_logits / self.temperature        # sharpen with T < 1
        avg_probs = F.softmax(scaled_logits, dim=1)          # now softmax on sharpened logits
        top2_probs, top2_idx = avg_probs[0].topk(2)

        pred_idx    = top2_idx[0].item()
        confidence  = top2_probs[0].item()
        pred_class  = self.classes[pred_idx]

        # Parse class name
        crop, disease = self._parse_class_name(pred_class)

        # Get advisory
        advisory = get_disease_advisory(disease)

        # Uncertainty flag — important for farmer trust
        is_uncertain  = confidence < 0.75
        is_healthy    = "healthy" in disease.lower()

        # Build top-2 predictions
        top2 = [
            {
                "rank": i + 1,
                "class": self.classes[top2_idx[i].item()],
                "crop": self._parse_class_name(self.classes[top2_idx[i].item()])[0],
                "disease": self._parse_class_name(self.classes[top2_idx[i].item()])[1],
                "confidence": round(top2_probs[i].item() * 100, 2),
            }
            for i in range(2)
        ]

        result = {
            # Core prediction
            "crop":            crop,
            "disease":         disease,
            "is_healthy":      is_healthy,
            "confidence":      round(confidence * 100, 2),
            "confidence_raw":  confidence,
            "is_uncertain":    is_uncertain,

            # Farmer-facing advisory
            "severity":        advisory["severity"],
            "severity_icon":   advisory["icon"],
            "immediate_action": advisory["immediate_action"],
            "treatment":       advisory["treatment"],
            "prevention":      advisory["prevention"],
            "organic_option":  advisory["organic_option"],
            "yield_impact":    advisory["estimated_yield_impact"],

            # Top 2 predictions
            "top2":            top2,

            # Farmer message (formatted)
            "farmer_message":  self._build_farmer_message(crop, disease, confidence, advisory, is_uncertain),
        }

        # GradCAM (optional — for explainability UI)
        if return_gradcam:
            result["gradcam_overlay"] = self._compute_gradcam(image_np)

        return result

    def _parse_class_name(self, raw_name: str) -> Tuple[str, str]:
        """'Tomato___Late_blight' → ('Tomato', 'Late Blight')"""
        parts   = raw_name.split("___")
        crop    = parts[0].strip()
        disease = parts[1].replace("_", " ").title() if len(parts) > 1 else "Healthy"
        return crop, disease

    def _build_farmer_message(self, crop: str, disease: str, confidence: float,
                              advisory: dict, is_uncertain: bool) -> str:
        """Build a clear, actionable message for the farmer."""
        if "healthy" in disease.lower():
            return "✅ Good news! Your crop appears HEALTHY. Maintain regular monitoring."

        uncertain_note = (
            "⚠️ NOTE: Our confidence is below 75%. We recommend confirming "
            "with your local agriculture officer (KVK)."
        ) if is_uncertain else ""
        return uncertain_note
    def _compute_gradcam(self, image_np: np.ndarray) -> Optional[np.ndarray]:
        """
        Generate GradCAM heatmap overlay.
        Shows WHICH part of the leaf the model focused on.
        Builds farmer trust — "see, these are the spots the AI detected."
        """
        try:
            from pytorch_grad_cam import GradCAM
            from pytorch_grad_cam.utils.image import show_cam_on_image

            target_layer = [self.ensemble.efficientnet.backbone.blocks[-1]]
            cam = GradCAM(model=self.ensemble.efficientnet, target_layers=target_layer)

            tensor     = self._preprocess(image_np).to(self.device)
            grayscale  = cam(input_tensor=tensor)

            img_float  = image_np.astype(np.float32) / 255.0
            img_resized = np.array(Image.fromarray(image_np).resize((224, 224))).astype(np.float32) / 255.0
            overlay    = show_cam_on_image(img_resized, grayscale[0], use_rgb=True)
            return overlay
        except Exception as e:
            print(f"⚠️ GradCAM failed: {e}. Install pytorch-grad-cam.")
            return None

    def predict_batch_images(self, images: List[Union[np.ndarray, Image.Image]]) -> List[Dict]:
        """Process multiple images — for batch processing farmer submissions."""
        return [self.predict_image(img) for img in images]

    def export_to_coreml(self, save_path: str = "exports/agriQ_mobilenet.mlpackage"):
        """
        Export MobileNet to CoreML for on-device iOS prediction.
        MobileNet used because EfficientNet is too large for on-device inference.
        """
        try:
            import coremltools as ct

            dummy_input = torch.randn(1, 3, self.img_size, self.img_size)
            traced = torch.jit.trace(self.ensemble.mobilenet.cpu(), dummy_input)

            coreml_model = ct.convert(
                traced,
                inputs=[ct.ImageType(
                    name="input_image",
                    shape=dummy_input.shape,
                    scale=1 / (255.0 * 0.226),
                    bias=[-0.485/0.229, -0.456/0.224, -0.406/0.225],
                )],
                classifier_config=ct.ClassifierConfig(self.classes),
                minimum_deployment_target=ct.target.iOS16,
            )
            coreml_model.short_description = "AgriQ Crop Disease Detector"
            coreml_model.save(save_path)
            print(f"✅ CoreML model saved → {save_path}")
        except ImportError:
            print("⚠️ coremltools not installed. Run: pip install coremltools")


# ─────────────────────────────────────────────
#  Quick Test
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    import tkinter as tk
    from tkinter import filedialog

    parser = argparse.ArgumentParser()
    parser.add_argument("--eff_model",  required=True, help="EfficientNet checkpoint path")
    parser.add_argument("--mob_model",  required=True, help="MobileNet checkpoint path")
    parser.add_argument("--image",      required=False, help="Test image path")
    parser.add_argument("--gradcam",    action="store_true", help="Generate GradCAM")
    args = parser.parse_args()

    if not args.image:
        print("📂 No image specified via command line. Opening file selector...")
        root = tk.Tk()
        root.withdraw()
        # Ensure dialog appears on top
        root.attributes('-topmost', True)
        args.image = filedialog.askopenfilename(
            title="Select an image to analyze",
            filetypes=[("Image files", "*.jpg *.jpeg *.png *.bmp")]
        )
        if not args.image:
            print("❌ No image selected. Exiting.")
            sys.exit(0)

    try:
        predictor = AgriQPredictor(args.eff_model, args.mob_model)
    except Exception as e:
        print(f"Error loading models: {e}")
        sys.exit(1)
    image     = Image.open(args.image).convert("RGB")
    result    = predictor.predict_image(image, return_gradcam=args.gradcam)

    print("\n" + "="*60)
    print("  AgriQ Prediction Result")
    print("="*60)
    print(result["farmer_message"])
    print(f"\nTop-2 Predictions:")
    for p in result["top2"]:
        print(f"  {p['rank']}. {p['disease']} ({p['crop']}) — {p['confidence']}%")

    if args.gradcam and result.get("gradcam_overlay") is not None:
        overlay_path = "gradcam_output.png"
        Image.fromarray(result["gradcam_overlay"]).save(overlay_path)
        print(f"\n🔬 GradCAM saved → {overlay_path}")
