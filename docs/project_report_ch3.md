# CHAPTER 3: SYSTEM DESIGN AND METHODOLOGY

## 3.1 Introduction

This chapter presents the complete architecture, design decisions, and methodological workflow underlying the **Crop Disease Prediction and Smart Advisory Platform**. The system is designed around three overarching principles: (1) **Accuracy** — achieved through a weighted ensemble of two state-of-the-art CNNs with Test-Time Augmentation; (2) **Explainability** — delivered through GradCAM heatmap visualisation; and (3) **Accessibility** — ensured through a FastAPI REST service integrated with the AgriQ full-stack web platform.

The system pipeline flows as follows: a farmer uploads a leaf image through the AgriQ web interface → the React.js frontend sends the image to the Node.js backend → the Node.js backend forwards it to the Python FastAPI ML service → the ensemble model runs inference with TTA and GradCAM → the advisory engine generates structured recommendations → the full response is returned to the farmer's screen in under two seconds.

## 3.2 Overall System Architecture

The platform consists of four integrated layers:

**Layer 1 — Presentation Layer:** A React.js + Tailwind CSS frontend (AgriQ web application) providing the "Crop Doctor" interface where farmers upload leaf images and view diagnosis results, confidence scores, severity badges, and treatment advisories.

**Layer 2 — Application Layer:** A Node.js + Express.js backend running on port 5000. It handles authentication (JWT), farmer session management, MongoDB persistence of diagnosis history, and acts as a secure proxy between the frontend and the ML service.

**Layer 3 — AI/ML Service Layer:** A Python FastAPI service running on port 8000. This is the core of the system, loading the trained EfficientNetV2-S and MobileNetV3-Large checkpoints at startup and exposing the `/predict` endpoint. It handles image validation, preprocessing, ensemble inference with TTA, GradCAM generation, and advisory lookup.

**Layer 4 — Data Layer:** A MongoDB database storing farmer profiles, diagnosis history with timestamps, government scheme data, crop calendar entries, and agricultural officer records.

```
[Figure 1 — Placeholder: Insert system_architecture.png]
Overall System Architecture Diagram

Farmer (Browser)
      |
      v
React.js Frontend (Port 5173)
      |
      v
Node.js/Express Backend (Port 5000) <---> MongoDB
      |
      v
FastAPI ML Service (Port 8000)
      |
      v
┌─────────────────────────────────┐
│       AgriQ Ensemble Model       │
│  EfficientNetV2-S  (w = 0.65)   │
│  + MobileNetV3-Large (w = 0.35) │
│  + 8x Test-Time Augmentation    │
└─────────────────────────────────┘
      |
      v
Advisory Engine (Disease → Action Plan)
      |
      v
GradCAM Heatmap Generation
```

## 3.3 Dataset Description

The model was trained and evaluated using a curated subset of the **PlantVillage dataset** — the largest and most widely used open benchmark for plant disease classification.

- **Source:** PlantVillage dataset (Hughes and Salathé, 2015), accessed via Kaggle (`abdallahalidev/plantvillage-dataset`).
- **Original Dataset:** 54,309 RGB images across 38 classes (14 crop species, ~26 disease categories + healthy classes).
- **Curated Subset for AgriQ:** Non-Indian crops (Blueberry, Cherry, Peach, Raspberry, Strawberry, Soybean, Squash) were excluded, retaining crops highly relevant to Indian agriculture.
- **Final Classes:** 28 disease/healthy categories across crops: Apple, Corn (Maize), Grape, Potato, Tomato, and others.
- **Image Format:** RGB, 256 × 256 px (original resolution), resized to 224 × 224 px for model input.
- **Test Set Size:** 3,928 images (stratified 10% holdout).

**Dataset Split:**
- Training Set: 75% of each class (stratified)
- Validation Set: 15% of each class (stratified)
- Test Set: 10% of each class (stratified)

Stratified splitting ensures proportional representation of all 28 classes in each subset, preventing any class from being absent in validation or test evaluation.

```
[Figure 2 — Placeholder: Insert evaluation_results/confusion_matrix.png]
Class Distribution and Confusion Matrix
```

**Selected Class Listing:**

| Index | Class Name | Crop |
|-------|-----------|------|
| 0 | Apple Scab | Apple |
| 1 | Apple Black Rot | Apple |
| 2 | Cedar Apple Rust | Apple |
| 3 | Apple Healthy | Apple |
| 4 | Corn Cercospora Leaf Spot | Corn |
| 5 | Corn Common Rust | Corn |
| 6 | Corn Northern Leaf Blight | Corn |
| 7 | Corn Healthy | Corn |
| 8 | Grape Black Rot | Grape |
| 9 | Grape Esca (Black Measles) | Grape |
| 10 | Grape Leaf Blight | Grape |
| 11 | Grape Healthy | Grape |
| 12 | Potato Early Blight | Potato |
| 13 | Potato Late Blight | Potato |
| 14 | Potato Healthy | Potato |
| 15–27 | Tomato (10 diseases + healthy) | Tomato |

## 3.4 Data Preprocessing and Augmentation

Preprocessing is performed via a two-track pipeline implemented using the **Albumentations** library — one heavy augmentation track for training and one clean transform track for validation and testing.

### 3.4.1 Validation / Test Transform (Clean)

```
Resize → (256 × 256)
CenterCrop → (224 × 224)
Normalize (ImageNet mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
ToTensorV2
```

### 3.4.2 Training Augmentation Pipeline (Heavy — Field Simulation)

The training augmentation pipeline is specifically designed to simulate the visual conditions of real-world field photography using low-cost smartphones in Indian agricultural settings.

**Spatial Transforms:**
- `RandomResizedCrop(224×224, scale=0.65–1.0)` — simulates varying shooting distance
- `HorizontalFlip(p=0.5)` — mirror invariance
- `VerticalFlip(p=0.3)` — upside-down robustness
- `RandomRotate90(p=0.4)` — orientation invariance
- `Affine(translate±10%, scale=0.75–1.25, rotate±35°, p=0.6)` — perspective shift
- `Perspective(scale=0.05–0.1, p=0.3)` — camera angle variation

**Colour and Brightness (OneOf, p=0.85):**
- `RandomBrightnessContrast(±35%)` — sunlight variation
- `HueSaturationValue(hue±25, sat±40, val±25)` — leaf colour variation
- `ColorJitter` — camera white balance differences
- `CLAHE` — local contrast enhancement

**Photo Artefact Simulation (OneOf, p=0.45):**
- `GaussianBlur(3–7px)` — hand shake
- `MotionBlur(9px)` — movement
- `MedianBlur(5px)` — low-quality camera
- `Defocus(radius 1–4)` — out-of-focus shots

**Noise (OneOf, p=0.4):**
- `GaussNoise`, `ISONoise`, `MultiplicativeNoise` — cheap phone sensor noise

**Weather Simulation:**
- `RandomShadow(p=0.35)` — partial shade from adjacent leaves
- `RandomSunFlare(p=0.1)` — direct sunlight glare
- `RandomFog(p=0.1)` — morning mist in fields
- `RandomRain(p=0.08)` — wet weather conditions

**Occlusion Simulation:**
- `CoarseDropout(1–10 holes, p=0.35)` — dirt, insects occluding leaf
- `GridDropout(p=0.2)` — partial leaf visibility

### 3.4.3 Class Imbalance Handling

The PlantVillage dataset exhibits natural class imbalance (e.g., Tomato Yellow Leaf Curl Virus has 5,357 images while Grape Healthy has only 423). A **WeightedRandomSampler** is used during training, assigning each sample a sampling weight inversely proportional to its class frequency, ensuring all 28 disease classes are seen equally often per training epoch.

### 3.4.4 Test-Time Augmentation (TTA)

At inference time, each uploaded image is processed through **8 distinct augmentation passes**:
1. Clean centre crop (baseline)
2. Horizontal flip
3. Vertical flip
4. 90° rotation
5. 180° rotation
6. Slight brightness boost (+10–20%)
7. Top-left corner crop
8. Bottom-right corner crop

The softmax probability vectors from all 8 passes are averaged element-wise, and the class with the highest averaged probability is selected as the final prediction. TTA consistently contributes +1–2% accuracy gain over single-pass inference.

## 3.5 Proposed Ensemble Model Architecture

The core AI engine is an **AgriQEnsemble** — a weighted ensemble of two independently trained CNN models.

```
[Figure 3 — Placeholder: Insert evaluation_results/ensemble_architecture.png]
Ensemble Model Architecture Diagram
```

### 3.5.1 Model 1: AgriQEfficientNet (Primary — Accuracy-Focused)

- **Backbone:** EfficientNetV2-S (loaded via `timm.create_model('efficientnetv2_s', pretrained=True, num_classes=0, global_pool='avg')`)
- **Feature Dimension:** 1,280 (after global average pooling)
- **Custom Classification Head:**
  ```
  LayerNorm(1280)
  Dropout(p=0.30)
  Linear(1280 → 512)
  GELU activation
  Dropout(p=0.20)
  Linear(512 → 28)
  ```
- **Parameters:** ~48 million total
- **Ensemble Weight:** 0.65 (higher accuracy model gets more weight)
- **GradCAM Target:** `backbone.blocks[-1]` (final convolutional block)

### 3.5.2 Model 2: AgriQMobileNet (Secondary — Speed + Diversity)

- **Backbone:** MobileNetV3-Large (loaded via `timm.create_model('mobilenetv3_large_100', pretrained=True, num_classes=0, global_pool='avg')`)
- **Feature Dimension:** 1,280 (timm outputs 1,280 despite reported 960)
- **Custom Classification Head:**
  ```
  LayerNorm(1280)
  Dropout(p=0.25)
  Linear(1280 → 256)
  GELU activation
  Dropout(p=0.15)
  Linear(256 → 28)
  ```
- **Parameters:** ~5.4 million total
- **Ensemble Weight:** 0.35
- **Rationale:** Different architecture → different error patterns → better ensemble diversity

### 3.5.3 Ensemble Fusion

Both models are trained independently. At inference, their softmax probability vectors are combined via weighted average:

```
P_ensemble = 0.65 × P_efficientnet + 0.35 × P_mobilenet
predicted_class = argmax(P_ensemble)
confidence = max(P_ensemble)
```

The ensemble consistently achieves **+0.5–1.5% accuracy** over the single best constituent model, confirming the value of architectural diversity in ensemble design.

### 3.5.4 Custom Head Design Rationale

Both models use **LayerNorm** instead of BatchNorm in the classification head. This choice was deliberate: LayerNorm is more stable during fine-tuning on smaller datasets because it normalises across features rather than across the batch, making it robust to small batch sizes and variance in domain-shift scenarios. The **GELU** activation (Gaussian Error Linear Unit) outperforms ReLU in transformer-style architectures and has been shown to improve fine-tuning performance in vision models. **Truncated Normal weight initialisation** (std=0.02) in the head prevents exploding gradients at the start of training.

## 3.6 Training Methodology

Training follows a **two-phase strategy** designed to maximise transfer of ImageNet features while preventing early-stage catastrophic forgetting.

```
[Figure 4 — Placeholder: Training Methodology Diagram]
Phase 1 (Warmup) → Phase 2 (Full Fine-tune)
```

### 3.6.1 Phase 1: Head Warmup (5 Epochs, Backbone Frozen)

In the first phase, the ImageNet-pretrained backbone weights are frozen (`requires_grad = False`). Only the custom classification head is trained. This prevents the randomly initialised head from generating large gradients that would corrupt the pretrained backbone features before the head has learned a meaningful representation.

- **Optimizer:** AdamW (head only, lr = 3×10⁻⁴)
- **Scheduler:** CosineAnnealingWarmRestarts (T₀=10, T_mult=2)

### 3.6.2 Phase 2: Full Fine-Tuning (Up to 60 Epochs)

After the warmup phase, the backbone is unfrozen and the entire model is fine-tuned end-to-end with **differential learning rates** — the backbone receives a 10× lower learning rate than the head to gently update pretrained features without destroying them.

- **Backbone LR:** 3×10⁻⁵ (backbone)
- **Head LR:** 3×10⁻⁴ (head)
- **Optimizer:** AdamW with weight_decay = 1×10⁻⁴
- **Scheduler:** CosineAnnealingWarmRestarts (T₀=10, T_mult=2, η_min=1×10⁻⁶)
- **Gradient Clipping:** max_norm = 1.0 (training stability)
- **Label Smoothing:** ε = 0.1 (prevents overconfident predictions)
- **Early Stopping:** Patience = 12 epochs (halt if validation accuracy does not improve)
- **Checkpointing:** Best model saved whenever validation accuracy improves

### 3.6.3 Regularisation Techniques

**MixUp Augmentation (α=0.2):** Two training images and their labels are blended with a Beta-distributed mixing coefficient λ. The model must learn to predict a convex combination of both labels, improving calibration and boundary smoothness.

**CutMix Augmentation (α=1.0):** A rectangular patch from one training image is pasted into another, with labels mixed proportionally to the patch area. CutMix is particularly effective for fine-grained visual tasks like disease detection, as it forces the model to use non-lesion context.

During each training batch, MixUp, CutMix, or no augmentation is applied with equal 33% probability, providing varied regularisation across training.

| Hyperparameter | Value |
|---|---|
| Batch Size | 32 |
| Max Epochs | 60 |
| Warmup Epochs | 5 |
| Backbone LR | 3×10⁻⁵ |
| Head LR | 3×10⁻⁴ |
| Weight Decay | 1×10⁻⁴ |
| Label Smoothing | 0.1 |
| MixUp α | 0.2 |
| CutMix α | 1.0 |
| Early Stopping Patience | 12 |
| TTA Passes | 8 |
| Ensemble Weight (Eff/Mob) | 0.65 / 0.35 |

**Table 4: Training Hyperparameters Summary**

## 3.7 Model Evaluation Metrics

After training, the ensemble model is evaluated on the held-out test set of 3,928 images. The following metrics are computed:

- **Accuracy:** Overall percentage of correctly classified images.
- **Precision (Macro & Weighted):** Ratio of true positives to predicted positives, averaged across classes.
- **Recall (Macro & Weighted):** Ratio of true positives to actual positives, averaged across classes.
- **F1-Score (Macro & Weighted):** Harmonic mean of precision and recall.
- **Confusion Matrix:** 28×28 matrix showing predicted vs. actual class for each test sample.
- **Per-Crop Accuracy Breakdown:** Accuracy grouped by crop species.
- **Calibration Curve:** Reliability diagram comparing predicted confidence to actual accuracy.

Macro-averaged metrics treat all 28 classes equally regardless of sample count, making them the most informative indicator of performance on minority disease classes.

## 3.8 GradCAM Visualisation

Gradient-weighted Class Activation Mapping (GradCAM) is implemented on the EfficientNetV2-S backbone. For a given input image and predicted class c:

1. A forward pass computes the feature maps A^k of the target convolutional layer (final block of EfficientNetV2-S).
2. Backpropagation computes the gradient of the score y^c with respect to each feature map: ∂y^c / ∂A^k.
3. Global average pooling of these gradients gives importance weights α^c_k for each feature map.
4. The GradCAM heatmap is computed as: L_GradCAM = ReLU(Σ_k α^c_k × A^k).
5. The heatmap is upsampled to the original image size and overlaid using a jet colormap.

High-intensity (red/yellow) regions in the overlay indicate the leaf areas most influential in the model's disease prediction. When the model correctly predicts a disease, these regions consistently correspond to actual lesion areas — brown spots, yellowing patterns, or necrotic margins — providing biological validation of the model's learned representations.

## 3.9 Smart Advisory Engine

The advisory engine is implemented in `src/predict.py` as a structured dictionary mapping each of the 28 disease class names to a set of agronomic recommendations. The engine provides the following fields for every prediction:

| Field | Description |
|---|---|
| `severity` | LOW / MEDIUM / HIGH based on disease type |
| `severity_icon` | Emoji indicator for quick farmer comprehension |
| `immediate_action` | Action to take within 24–48 hours |
| `treatment` | Recommended chemical treatment with product examples |
| `organic_option` | Organic/biological alternative treatment |
| `prevention` | 2-week preventive measures |
| `yield_impact` | Estimated % yield loss if untreated |
| `farmer_message` | Plain-language summary for the farmer |
| `is_uncertain` | Flag raised if confidence < 75% threshold |

**Example — Tomato Late Blight:**
- **Severity:** HIGH
- **Immediate Action:** Remove and destroy all infected plants immediately. Do not compost infected material.
- **Treatment:** Apply Copper Oxychloride 50% WP (3g/L) or Chlorothalonil 75% WP (2g/L) at 10-day intervals.
- **Organic Option:** Spray Bordeaux mixture (1%) or Trichoderma-based biocontrol agents.
- **Prevention:** Ensure 60cm plant spacing for airflow; avoid overhead irrigation; stake plants to reduce leaf-soil contact.
- **Yield Impact:** Up to 70–100% loss in severely infected fields if untreated within 48 hours.

**Uncertainty Handling:** If the model's maximum confidence score falls below the configurable threshold of 75%, an `is_uncertain = True` flag is raised and the farmer is advised to re-photograph the leaf under better lighting conditions or consult a local agronomist.

## 3.10 Web Application and API Design

### 3.10.1 FastAPI ML Service (Python — Port 8000)

The ML service exposes the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check, reports model load status and device |
| GET | `/classes` | Lists all 28 detectable disease classes grouped by crop |
| POST | `/predict` | Primary inference endpoint — accepts image upload, returns full prediction + advisory |
| POST | `/predict/batch` | Batch inference for up to 10 images simultaneously |

The `/predict` endpoint:
1. Validates file type (JPG/PNG/WEBP only) and size (<10MB).
2. Opens and validates image dimensions (minimum 50×50 px).
3. Runs `AgriQPredictor.predict_image()` which applies 8-pass TTA and ensemble fusion.
4. Optionally generates and returns a base64-encoded GradCAM overlay.
5. Returns a structured JSON `PredictionResponse` containing all advisory fields.

### 3.10.2 Node.js Backend Integration

The Node.js backend (`server/`) acts as a secure proxy:
- Receives image upload from React frontend via `multer` middleware.
- Forwards multipart form data to FastAPI `/predict` endpoint.
- Enriches the ML response with crop calendar context from MongoDB.
- Saves the diagnosis record (image hash, prediction, confidence, timestamp, farmer ID) to `DiagnosisHistory` MongoDB collection.
- Returns the enriched advisory to the frontend.

### 3.10.3 React.js Frontend (Crop Doctor)

The AgriQ "Crop Doctor" component provides:
- Drag-and-drop or file-picker image upload interface.
- Real-time preview of the uploaded leaf image.
- Loading spinner during inference.
- Diagnosis result card showing: predicted disease name, confidence bar, severity badge, and the four advisory fields (Immediate Action, Treatment, Prevention, Yield Impact).
- GradCAM heatmap display when available.
- History of past diagnoses retrieved from MongoDB.

```
[Figure 10 — Placeholder: AgriQ Web Application Home Page Screenshot]
[Figure 11 — Placeholder: AgriQ Crop Doctor Upload and Diagnosis Page Screenshot]
```

## 3.11 Summary

This chapter presented the complete system architecture, dataset, preprocessing pipeline, model architecture, training methodology, evaluation framework, advisory engine, and web deployment design of the Crop Disease Prediction and Smart Advisory Platform.

The key design decisions — EfficientNetV2-S + MobileNetV3-Large ensemble with differential weighting, 8-pass TTA, heavy field-condition augmentation, phase-based training with differential LRs, and GradCAM explainability — form a cohesive, mutually reinforcing system that maximises both accuracy and real-world robustness. The FastAPI + Node.js + React.js architecture ensures that this high-performance ML capability is accessible to farmers through a simple, low-friction web interface.

The following chapter presents the complete implementation details and experimental results obtained from this system design.
