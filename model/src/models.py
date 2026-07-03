"""
AgriQ — Model Architectures
============================
Two models trained independently and ensembled at inference:

1. AgriQEfficientNet  — EfficientNetV2-S backbone  (accuracy-focused)
2. AgriQMobileNet     — MobileNetV3-Large backbone (speed-focused + diverse ensemble)

Both use:
- Custom classification head with LayerNorm + GELU
- Dropout for regularization
- Feature extraction method for GradCAM
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import timm
from typing import Tuple, Optional


# ─────────────────────────────────────────────
#  Base Architecture
# ─────────────────────────────────────────────

class AgriQBaseModel(nn.Module):
    """
    Base class for all AgriQ disease detection models.
    Provides common interface: forward, get_features, predict_proba.
    """

    def __init__(self, backbone_name: str, num_classes: int,
                 hidden_dim: int, dropout1: float, dropout2: float,
                 pretrained: bool = True):
        super().__init__()

        # Load pretrained backbone (ImageNet weights)
        self.backbone = timm.create_model(
            backbone_name,
            pretrained=pretrained,
            num_classes=0,       # Remove original classifier head
            global_pool="avg",
        )
        # Extract feat_dim robustly (timm mobilenetv3 reports 960 but outputs 1280)
        with torch.no_grad():
            feat_dim = self.backbone(torch.zeros(1, 3, 224, 224)).shape[1]

        # Custom head: LayerNorm → FC → GELU → FC
        # LayerNorm stabilizes training better than BatchNorm for fine-tuning
        self.classifier = nn.Sequential(
            nn.LayerNorm(feat_dim),
            nn.Dropout(p=dropout1),
            nn.Linear(feat_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(p=dropout2),
            nn.Linear(hidden_dim, num_classes),
        )

        self.num_classes = num_classes
        self.feat_dim = feat_dim

        # Initialize custom head weights properly
        self._init_head()

    def _init_head(self):
        for m in self.classifier.modules():
            if isinstance(m, nn.Linear):
                nn.init.trunc_normal_(m.weight, std=0.02)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        return self.classifier(features)

    def get_features(self, x: torch.Tensor) -> torch.Tensor:
        """Return backbone features (used by GradCAM)."""
        return self.backbone(x)

    def predict_proba(self, x: torch.Tensor) -> torch.Tensor:
        """Return softmax probabilities."""
        with torch.no_grad():
            logits = self.forward(x)
            return F.softmax(logits, dim=1)

    def freeze_backbone(self):
        """Freeze backbone — train head only (warm-up phase)."""
        for param in self.backbone.parameters():
            param.requires_grad = False
        print(f"🔒 Backbone frozen — training head only")

    def unfreeze_backbone(self):
        """Unfreeze backbone for full fine-tuning."""
        for param in self.backbone.parameters():
            param.requires_grad = True
        print(f"🔓 Backbone unfrozen — full model training")

    def count_parameters(self) -> dict:
        total = sum(p.numel() for p in self.parameters())
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        return {
            "total": total,
            "trainable": trainable,
            "frozen": total - trainable,
            "total_M": round(total / 1e6, 2),
        }


# ─────────────────────────────────────────────
#  EfficientNetV2-S Model (Primary)
# ─────────────────────────────────────────────

class AgriQEfficientNet(AgriQBaseModel):
    """
    Primary model — EfficientNetV2-S backbone.
    
    Why EfficientNetV2-S:
    - Consistently 97-98% on PlantVillage in literature
    - Good speed/accuracy tradeoff
    - Progressive learning (built-in during ImageNet pretraining)
    - ~48M parameters — trainable on M4 in reasonable time
    
    Expected training time on M4: ~2-3 hrs for 50 epochs
    """

    def __init__(self, num_classes: int, pretrained: bool = True):
        super().__init__(
            backbone_name="efficientnetv2_s",
            num_classes=num_classes,
            hidden_dim=512,
            dropout1=0.30,
            dropout2=0.20,
            pretrained=pretrained,
        )
        self.model_name = "EfficientNetV2-S"

    def get_gradcam_target_layer(self):
        """Return the target layer for GradCAM visualization."""
        # Last conv block of EfficientNetV2
        return self.backbone.blocks[-1]


# ─────────────────────────────────────────────
#  MobileNetV2 Model (Ensemble Partner)
# ─────────────────────────────────────────────

class AgriQMobileNet(AgriQBaseModel):
    """
    Secondary model — MobileNetV2 backbone.
    
    Why MobileNetV2 as ensemble partner:
    - Different architecture → different error patterns → better ensemble
    - Much lighter (~5M params) → fast inference on mobile/edge
    - Can be exported to CoreML for on-device iOS prediction
    - Trains faster → good for iterative experiments
    
    Expected training time on M4: ~45 min for 50 epochs
    """

    def __init__(self, num_classes: int, pretrained: bool = True):
        super().__init__(
            backbone_name="mobilenetv3_large_100",
            num_classes=num_classes,
            hidden_dim=256,
            dropout1=0.25,
            dropout2=0.15,
            pretrained=pretrained,
        )
        self.model_name = "MobileNetV3-Large"

    def get_gradcam_target_layer(self):
        """Return the target layer for GradCAM visualization."""
        return self.backbone.blocks[-1]


# ─────────────────────────────────────────────
#  Ensemble Model
# ─────────────────────────────────────────────

class AgriQEnsemble(nn.Module):
    """
    Weighted ensemble of EfficientNet + MobileNet.
    
    Ensemble strategy: Weighted average of softmax probabilities
    - EfficientNet weight: 0.65 (higher accuracy)
    - MobileNet weight:   0.35 (diverse errors)
    
    This consistently gives +0.5-1.5% over best single model.
    """

    def __init__(
        self,
        efficientnet: AgriQEfficientNet,
        mobilenet: AgriQMobileNet,
        efficientnet_weight: float = 0.65,
        mobilenet_weight: float = 0.35,
        device: torch.device = None,
        eff_classes: list = None,
        mob_classes: list = None,
        target_classes: list = None,
    ):
        super().__init__()
        self.efficientnet = efficientnet
        self.mobilenet = mobilenet
        self.eff_w = efficientnet_weight
        self.mob_w = mobilenet_weight
        self.device = device or torch.device("cpu")
        self.target_classes = target_classes or eff_classes
        
        self.eff_idx_map = None
        if self.target_classes is not None and eff_classes is not None:
            self.eff_idx_map = [eff_classes.index(c) if c in eff_classes else -1 for c in self.target_classes]
            
        self.mob_idx_map = None
        if self.target_classes is not None and mob_classes is not None:
            self.mob_idx_map = [mob_classes.index(c) if c in mob_classes else -1 for c in self.target_classes]

        # Set both to eval mode
        self.efficientnet.eval()
        self.mobilenet.eval()

    @torch.no_grad()
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Weighted ensemble prediction mapped to target classes."""
        eff_probs_raw = F.softmax(self.efficientnet(x), dim=1)
        mob_probs_raw = F.softmax(self.mobilenet(x), dim=1)
        
        if self.target_classes is None:
            return self.eff_w * eff_probs_raw + self.mob_w * mob_probs_raw
            
        eff_probs = torch.zeros(x.size(0), len(self.target_classes), device=self.device)
        mob_probs = torch.zeros(x.size(0), len(self.target_classes), device=self.device)
        
        for tgt_idx, src_idx in enumerate(self.eff_idx_map):
            if src_idx != -1:
                eff_probs[:, tgt_idx] = eff_probs_raw[:, src_idx]
                
        for tgt_idx, src_idx in enumerate(self.mob_idx_map):
            if src_idx != -1:
                mob_probs[:, tgt_idx] = mob_probs_raw[:, src_idx]

        return self.eff_w * eff_probs + self.mob_w * mob_probs

    @torch.no_grad()
    def predict(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Returns (class_indices, confidences)."""
        probs = self.forward(x)
        confidence, pred = probs.max(dim=1)
        return pred, confidence

    def to(self, device):
        self.device = device
        self.efficientnet = self.efficientnet.to(device)
        self.mobilenet = self.mobilenet.to(device)
        return self


# ─────────────────────────────────────────────
#  MixUp & CutMix Augmentation (training-time)
# ─────────────────────────────────────────────

def mixup_data(x: torch.Tensor, y: torch.Tensor, alpha: float = 0.2):
    """
    MixUp augmentation — blends two training samples.
    Improves calibration and reduces overconfidence.
    """
    if alpha > 0:
        lam = torch.distributions.Beta(alpha, alpha).sample().item()
    else:
        lam = 1.0

    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)

    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam


def mixup_criterion(criterion, pred, y_a, y_b, lam):
    """Loss for MixUp-augmented batch."""
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)


def cutmix_data(x: torch.Tensor, y: torch.Tensor, alpha: float = 1.0):
    """
    CutMix augmentation — pastes a patch from one image into another.
    Better than MixUp for fine-grained visual tasks like disease detection.
    """
    if alpha > 0:
        lam = torch.distributions.Beta(alpha, alpha).sample().item()
    else:
        lam = 1.0

    batch_size, _, H, W = x.size()
    index = torch.randperm(batch_size, device=x.device)

    # Random box
    cut_ratio = (1.0 - lam) ** 0.5
    cut_h = int(H * cut_ratio)
    cut_w = int(W * cut_ratio)

    cx = torch.randint(W, (1,)).item()
    cy = torch.randint(H, (1,)).item()

    x1 = max(cx - cut_w // 2, 0)
    y1 = max(cy - cut_h // 2, 0)
    x2 = min(cx + cut_w // 2, W)
    y2 = min(cy + cut_h // 2, H)

    mixed_x = x.clone()
    mixed_x[:, :, y1:y2, x1:x2] = x[index, :, y1:y2, x1:x2]

    # Adjust lambda based on actual patch size
    lam = 1 - (x2 - x1) * (y2 - y1) / (H * W)
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam


def build_models(num_classes: int, pretrained: bool = True) -> Tuple[AgriQEfficientNet, AgriQMobileNet]:
    """Convenience function — returns both models ready to train."""
    eff = AgriQEfficientNet(num_classes, pretrained)
    mob = AgriQMobileNet(num_classes, pretrained)

    print(f"\n🏗️  Models Built:")
    eff_params = eff.count_parameters()
    mob_params = mob.count_parameters()
    print(f"   EfficientNetV2-S : {eff_params['total_M']}M params")
    print(f"   MobileNetV3-Large: {mob_params['total_M']}M params")

    return eff, mob
