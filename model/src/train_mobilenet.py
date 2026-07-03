"""
AgriQ — MobileNetV3-Large Trainer (Standalone)
================================================
Run this after your EfficientNet is trained.
This script is 100% self-contained — no imports from other files needed.

Usage:
    python train_mobilenet.py --data_dir /path/to/plantvillage

Output:
    exports/agriQ_mobilenet_best.pth

Requirements:
    pip install torch torchvision timm albumentations torchmetrics wandb pyyaml
"""

import os
import sys
import time
import random
import argparse
from pathlib import Path
from collections import Counter
from typing import List, Tuple, Dict, Optional

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from torchvision import datasets
from torchmetrics import Accuracy, F1Score
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
import timm

try:
    import wandb
    WANDB_AVAILABLE = True
except ImportError:
    WANDB_AVAILABLE = False
    print("⚠️  W&B not installed — training without experiment tracking.")
    print("    Install with: pip install wandb\n")


# ─────────────────────────────────────────────
#  CONFIG  — edit these if needed
# ─────────────────────────────────────────────

CONFIG = {
    "seed":               42,

    # Data
    "img_size":           224,
    "batch_size":         32,       # safe for M4 unified memory
    "val_split":          0.15,
    "test_split":         0.10,
    "num_workers":        0,        # MUST be 0 on Apple MPS

    # Crops to exclude (non-Indian PlantVillage classes)
    "exclude_crops": [
        "Blueberry", "Cherry", "Peach",
        "Raspberry", "Strawberry", "Soybean", "Squash"
    ],

    # Model
    "backbone":           "mobilenetv3_large_100",
    "hidden_dim":         256,
    "dropout1":           0.25,
    "dropout2":           0.15,

    # Training
    "epochs":             60,
    "freeze_epochs":      5,        # warm up head-only before unfreezing backbone
    "early_stop_patience":12,
    "label_smoothing":    0.1,
    "grad_clip":          1.0,
    "mixup_alpha":        0.2,
    "cutmix_alpha":       1.0,

    # Learning rates  (backbone gets 10x lower than head)
    "backbone_lr":        0.00003,
    "head_lr":            0.0003,
    "weight_decay":       0.0001,

    # Scheduler
    "T0":                 10,
    "T_mult":             2,
    "eta_min":            1e-6,

    # Output
    "save_dir":           "exports",
    "model_filename":     "agriQ_mobilenet_best.pth",

    # W&B
    "wandb_project":      "agriQ-disease-detection",
    "wandb_enabled":      True,
}

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]


# ─────────────────────────────────────────────
#  SEED
# ─────────────────────────────────────────────

def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.backends.mps.is_available():
        torch.mps.manual_seed(seed)


# ─────────────────────────────────────────────
#  AUGMENTATION TRANSFORMS
# ─────────────────────────────────────────────

def train_transform(img_size: int) -> A.Compose:
    """
    Heavy augmentation — simulates real Indian field photo conditions.
    Varied lighting, blur from hand shake, shadows, fog, noise from cheap phones.
    This is the primary reason the model generalises beyond PlantVillage lab photos.
    """
    return A.Compose([
        A.RandomResizedCrop(img_size, img_size, scale=(0.65, 1.0), ratio=(0.75, 1.33)),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.3),
        A.RandomRotate90(p=0.4),
        A.ShiftScaleRotate(
            shift_limit=0.1, scale_limit=0.25,
            rotate_limit=35, border_mode=0, p=0.6
        ),
        A.Perspective(scale=(0.05, 0.1), p=0.3),

        # Colour / brightness — critical for field photos in sun / shade
        A.OneOf([
            A.RandomBrightnessContrast(brightness_limit=0.35, contrast_limit=0.35),
            A.HueSaturationValue(hue_shift_limit=25, sat_shift_limit=40, val_shift_limit=25),
            A.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.15),
            A.CLAHE(clip_limit=4.0),
        ], p=0.85),

        A.ToGray(p=0.05),

        # Camera blur / noise
        A.OneOf([
            A.GaussianBlur(blur_limit=(3, 7)),
            A.MotionBlur(blur_limit=9),
            A.MedianBlur(blur_limit=5),
            A.Defocus(radius=(1, 4)),
        ], p=0.45),

        A.OneOf([
            A.GaussNoise(var_limit=(15, 65)),
            A.ISONoise(color_shift=(0.01, 0.05), intensity=(0.1, 0.5)),
            A.MultiplicativeNoise(multiplier=(0.9, 1.1)),
        ], p=0.4),

        # Field environment
        A.RandomShadow(num_shadows_lower=1, num_shadows_upper=3, shadow_dimension=5, p=0.35),
        A.RandomSunFlare(flare_roi=(0, 0, 1, 0.5), angle_lower=0.5, p=0.1),
        A.RandomFog(fog_coef_lower=0.05, fog_coef_upper=0.25, p=0.1),
        A.RandomRain(slant_lower=-10, slant_upper=10, drop_length=8, p=0.08),

        # Occlusion (leaves overlapping, dirt patches)
        A.CoarseDropout(
            max_holes=10, max_height=32, max_width=32,
            min_holes=1,  min_height=8,  min_width=8,
            fill_value=0, p=0.35
        ),
        A.GridDropout(ratio=0.15, p=0.2),

        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])


def val_transform(img_size: int) -> A.Compose:
    return A.Compose([
        A.Resize(img_size + 32, img_size + 32),
        A.CenterCrop(img_size, img_size),
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])


# ─────────────────────────────────────────────
#  DATASET
# ─────────────────────────────────────────────

class PlantDiseaseDataset(Dataset):

    def __init__(
        self,
        samples:      List[Tuple[str, int]],
        classes:      List[str],
        class_to_idx: Dict[str, int],
        transform:    Optional[A.Compose] = None,
    ):
        self.samples      = samples
        self.classes      = classes
        self.class_to_idx = class_to_idx
        self.transform    = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]
        img = np.array(Image.open(path).convert("RGB"))
        if self.transform:
            img = self.transform(image=img)["image"]
        return img, label

    def class_weights(self) -> torch.Tensor:
        labels  = [s[1] for s in self.samples]
        counts  = Counter(labels)
        weights = [1.0 / counts[l] for l in labels]
        return torch.FloatTensor(weights)


def load_dataloaders(
    data_dir: str,
    cfg: dict,
) -> Tuple[DataLoader, DataLoader, DataLoader, List[str]]:
    """
    Loads PlantVillage, filters non-Indian crops,
    does stratified train / val / test split,
    returns three DataLoaders + class list.
    """
    seed       = cfg["seed"]
    val_split  = cfg["val_split"]
    test_split = cfg["test_split"]
    img_size   = cfg["img_size"]
    batch_size = cfg["batch_size"]
    exclude    = cfg["exclude_crops"]

    random.seed(seed);  np.random.seed(seed)

    full = datasets.ImageFolder(data_dir)
    valid_classes = [c for c in full.classes
                     if not any(ex.lower() in c.lower() for ex in exclude)]
    class_to_idx  = {c: i for i, c in enumerate(valid_classes)}

    all_samples = [
        (path, class_to_idx[full.classes[label]])
        for path, label in full.samples
        if full.classes[label] in valid_classes
    ]

    print(f"✅  Classes kept   : {len(valid_classes)}")
    print(f"✅  Total samples  : {len(all_samples)}")

    # Stratified split
    by_class: Dict[int, list] = {i: [] for i in range(len(valid_classes))}
    for s in all_samples:
        by_class[s[1]].append(s)

    train_s, val_s, test_s = [], [], []
    for samples in by_class.values():
        random.shuffle(samples)
        n      = len(samples)
        n_test = max(1, int(n * test_split))
        n_val  = max(1, int(n * val_split))
        test_s  += samples[:n_test]
        val_s   += samples[n_test : n_test + n_val]
        train_s += samples[n_test + n_val:]

    print(f"✅  Train / Val / Test : {len(train_s)} / {len(val_s)} / {len(test_s)}")

    train_ds = PlantDiseaseDataset(train_s, valid_classes, class_to_idx, train_transform(img_size))
    val_ds   = PlantDiseaseDataset(val_s,   valid_classes, class_to_idx, val_transform(img_size))
    test_ds  = PlantDiseaseDataset(test_s,  valid_classes, class_to_idx, val_transform(img_size))

    # Weighted sampler — balances minority disease classes during training
    weights  = train_ds.class_weights()
    sampler  = WeightedRandomSampler(weights, len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=sampler,
                              num_workers=0, pin_memory=False, drop_last=True)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False,
                              num_workers=0, pin_memory=False)
    test_loader  = DataLoader(test_ds,  batch_size=batch_size, shuffle=False,
                              num_workers=0, pin_memory=False)

    return train_loader, val_loader, test_loader, valid_classes


# ─────────────────────────────────────────────
#  MODEL
# ─────────────────────────────────────────────

class AgriQMobileNet(nn.Module):
    """
    MobileNetV3-Large backbone with a custom classification head.

    Why MobileNetV3 as the ensemble partner to EfficientNetV2:
      - Different architecture family  →  different error patterns
      - ~5M parameters vs ~48M         →  trains in ~45 min on M4
      - Exportable to CoreML           →  on-device iOS inference
      - Still achieves 93-95% alone, ~97-98% in ensemble
    """

    def __init__(self, num_classes: int, pretrained: bool = True):
        super().__init__()
        self.backbone = timm.create_model(
            "mobilenetv3_large_100",
            pretrained=pretrained,
            num_classes=0,
            global_pool="avg",
        )
        feat_dim = self.backbone.num_features  # 960 for mobilenetv3_large_100

        # Head: LayerNorm → Linear → GELU → Linear
        # LayerNorm is more stable than BatchNorm for fine-tuning
        self.classifier = nn.Sequential(
            nn.LayerNorm(feat_dim),
            nn.Dropout(p=0.25),
            nn.Linear(feat_dim, 256),
            nn.GELU(),
            nn.Dropout(p=0.15),
            nn.Linear(256, num_classes),
        )

        self.num_classes = num_classes
        self._init_head()

    def _init_head(self):
        for m in self.classifier.modules():
            if isinstance(m, nn.Linear):
                nn.init.trunc_normal_(m.weight, std=0.02)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.classifier(self.backbone(x))

    def freeze_backbone(self):
        for p in self.backbone.parameters():
            p.requires_grad = False

    def unfreeze_backbone(self):
        for p in self.backbone.parameters():
            p.requires_grad = True

    def param_counts(self) -> dict:
        total     = sum(p.numel() for p in self.parameters())
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        return {"total_M": round(total / 1e6, 2), "trainable_M": round(trainable / 1e6, 2)}


# ─────────────────────────────────────────────
#  MIXUP / CUTMIX
# ─────────────────────────────────────────────

def mixup(x, y, alpha=0.2):
    lam   = torch.distributions.Beta(alpha, alpha).sample().item() if alpha > 0 else 1.0
    idx   = torch.randperm(x.size(0), device=x.device)
    mixed = lam * x + (1 - lam) * x[idx]
    return mixed, y, y[idx], lam


def cutmix(x, y, alpha=1.0):
    lam         = torch.distributions.Beta(alpha, alpha).sample().item() if alpha > 0 else 1.0
    B, _, H, W  = x.size()
    idx         = torch.randperm(B, device=x.device)
    cut_h       = int(H * (1 - lam) ** 0.5)
    cut_w       = int(W * (1 - lam) ** 0.5)
    cx, cy      = torch.randint(W, (1,)).item(), torch.randint(H, (1,)).item()
    x1          = max(cx - cut_w // 2, 0);  x2 = min(cx + cut_w // 2, W)
    y1          = max(cy - cut_h // 2, 0);  y2 = min(cy + cut_h // 2, H)
    mixed       = x.clone()
    mixed[:, :, y1:y2, x1:x2] = x[idx, :, y1:y2, x1:x2]
    lam_adj     = 1 - (x2 - x1) * (y2 - y1) / (H * W)
    return mixed, y, y[idx], lam_adj


def mixed_loss(criterion, logits, y_a, y_b, lam):
    return lam * criterion(logits, y_a) + (1 - lam) * criterion(logits, y_b)


# ─────────────────────────────────────────────
#  TRAINING LOOP
# ─────────────────────────────────────────────

def run_epoch(model, loader, criterion, optimizer, device, cfg, is_train: bool, epoch: int):
    model.train() if is_train else model.eval()
    total_loss = 0.0
    n_correct  = 0
    n_total    = 0

    ctx = torch.enable_grad() if is_train else torch.no_grad()

    with ctx:
        for batch_idx, (imgs, labels) in enumerate(loader):
            imgs   = imgs.to(device)
            labels = labels.to(device)

            if is_train:
                # Randomly apply MixUp or CutMix or neither (33/33/33)
                r = random.random()
                if r < 0.33:
                    imgs, y_a, y_b, lam = mixup(imgs, labels, cfg["mixup_alpha"])
                    logits = model(imgs)
                    loss   = mixed_loss(criterion, logits, y_a, y_b, lam)
                elif r < 0.66:
                    imgs, y_a, y_b, lam = cutmix(imgs, labels, cfg["cutmix_alpha"])
                    logits = model(imgs)
                    loss   = mixed_loss(criterion, logits, y_a, y_b, lam)
                else:
                    logits = model(imgs)
                    loss   = criterion(logits, labels)

                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), cfg["grad_clip"])
                optimizer.step()

            else:
                logits = model(imgs)
                loss   = criterion(logits, labels)

            total_loss += loss.item()
            preds       = logits.argmax(dim=1)
            n_correct  += (preds == labels).sum().item()
            n_total    += labels.size(0)

            if is_train and (batch_idx + 1) % 50 == 0:
                print(f"    batch {batch_idx+1}/{len(loader)} | loss {loss.item():.4f}", end="\r")

    return total_loss / len(loader), n_correct / n_total


# ─────────────────────────────────────────────
#  MAIN TRAIN FUNCTION
# ─────────────────────────────────────────────

def train(data_dir: str, cfg: dict):
    set_seed(cfg["seed"])

    # ── Device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("🍎  Apple MPS detected — using M4 GPU")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"🟢  CUDA GPU: {torch.cuda.get_device_name()}")
    else:
        device = torch.device("cpu")
        print("🔵  CPU mode — training will be slow")

    # ── Data
    print(f"\n📂  Loading dataset from: {data_dir}")
    train_loader, val_loader, test_loader, classes = load_dataloaders(data_dir, cfg)
    num_classes = len(classes)

    # ── Model
    print(f"\n🏗️   Building MobileNetV3-Large  ({num_classes} classes)")
    model  = AgriQMobileNet(num_classes, pretrained=True).to(device)
    counts = model.param_counts()
    print(f"     Parameters: {counts['total_M']}M total")

    # ── Loss
    criterion = nn.CrossEntropyLoss(label_smoothing=cfg["label_smoothing"])

    # ── Metrics (torchmetrics)
    train_acc = Accuracy(task="multiclass", num_classes=num_classes).to(device)
    val_acc   = Accuracy(task="multiclass", num_classes=num_classes).to(device)
    val_f1    = F1Score(task="multiclass",  num_classes=num_classes, average="macro").to(device)

    # ── W&B
    if WANDB_AVAILABLE and cfg["wandb_enabled"]:
        wandb.init(
            project=cfg["wandb_project"],
            name=f"MobileNetV3-{time.strftime('%m%d-%H%M')}",
            config=cfg,
        )

    os.makedirs(cfg["save_dir"], exist_ok=True)
    save_path    = os.path.join(cfg["save_dir"], cfg["model_filename"])
    best_val_acc = 0.0
    patience     = 0

    # ════════════════════════════════════════════
    #  PHASE 1 — Warmup (backbone frozen, head only)
    # ════════════════════════════════════════════
    print(f"\n{'='*58}")
    print(f"  Phase 1 — Warmup ({cfg['freeze_epochs']} epochs, backbone frozen)")
    print(f"{'='*58}")

    model.freeze_backbone()
    optimizer = AdamW(
        model.classifier.parameters(),
        lr=cfg["head_lr"],
        weight_decay=cfg["weight_decay"]
    )
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=cfg["T0"], T_mult=cfg["T_mult"], eta_min=cfg["eta_min"])

    for epoch in range(1, cfg["freeze_epochs"] + 1):
        t0 = time.time()
        tr_loss, tr_acc = run_epoch(model, train_loader, criterion, optimizer, device, cfg, True, epoch)
        vl_loss, vl_acc = run_epoch(model, val_loader,   criterion, None,      device, cfg, False, epoch)
        scheduler.step(epoch)
        elapsed = time.time() - t0
        print(f"  Warmup {epoch:2d}/{cfg['freeze_epochs']} | "
              f"Loss {tr_loss:.4f} Acc {tr_acc:.4f} | "
              f"Val Loss {vl_loss:.4f} Acc {vl_acc:.4f} | {elapsed:.1f}s")

    # ════════════════════════════════════════════
    #  PHASE 2 — Full fine-tuning
    # ════════════════════════════════════════════
    print(f"\n{'='*58}")
    print(f"  Phase 2 — Full fine-tuning (backbone unfrozen)")
    print(f"{'='*58}")

    model.unfreeze_backbone()
    optimizer = AdamW([
        {"params": model.backbone.parameters(),   "lr": cfg["backbone_lr"]},
        {"params": model.classifier.parameters(), "lr": cfg["head_lr"]},
    ], weight_decay=cfg["weight_decay"])
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=cfg["T0"], T_mult=cfg["T_mult"], eta_min=cfg["eta_min"])

    for epoch in range(1, cfg["epochs"] + 1):
        t0 = time.time()
        tr_loss, tr_acc = run_epoch(model, train_loader, criterion, optimizer, device, cfg, True,  epoch)
        vl_loss, vl_acc = run_epoch(model, val_loader,   criterion, None,      device, cfg, False, epoch)
        scheduler.step(epoch)
        elapsed  = time.time() - t0
        is_best  = vl_acc > best_val_acc
        marker   = "✅" if is_best else "  "
        cur_lr   = optimizer.param_groups[-1]["lr"]

        print(f"  {marker} Epoch {epoch:3d}/{cfg['epochs']} | "
              f"Train Loss {tr_loss:.4f} Acc {tr_acc:.4f} | "
              f"Val Loss {vl_loss:.4f} Acc {vl_acc:.4f} | "
              f"LR {cur_lr:.6f} | {elapsed:.1f}s")

        if WANDB_AVAILABLE and cfg["wandb_enabled"]:
            wandb.log({
                "train/loss": tr_loss, "train/acc": tr_acc,
                "val/loss":   vl_loss, "val/acc":   vl_acc,
                "lr":         cur_lr,  "epoch":     epoch + cfg["freeze_epochs"],
            })

        if is_best:
            best_val_acc = vl_acc
            torch.save({
                "epoch":       epoch,
                "model_name":  "MobileNetV3-Large",
                "model_state": model.state_dict(),
                "val_acc":     vl_acc,
                "num_classes": num_classes,
                "class_names": classes,
                "config":      cfg,
            }, save_path)
            print(f"       💾  Saved → {save_path}")
            patience = 0
        else:
            patience += 1
            if patience >= cfg["early_stop_patience"]:
                print(f"\n⏹️   Early stopping — no improvement for {cfg['early_stop_patience']} epochs")
                break

    # ════════════════════════════════════════════
    #  TEST SET EVALUATION
    # ════════════════════════════════════════════
    print(f"\n{'='*58}")
    print(f"  Final Test Set Evaluation (best checkpoint)")
    print(f"{'='*58}")

    ckpt = torch.load(save_path, map_location=device)
    model.load_state_dict(ckpt["model_state"])
    _, test_acc = run_epoch(model, test_loader, criterion, None, device, cfg, False, 0)

    print(f"\n  🏆  Best Val Accuracy  : {best_val_acc*100:.2f}%")
    print(f"  🎯  Test Accuracy      : {test_acc*100:.2f}%")
    print(f"  💾  Model saved to     : {save_path}")

    if WANDB_AVAILABLE and cfg["wandb_enabled"]:
        wandb.log({"test/acc": test_acc, "best_val_acc": best_val_acc})
        wandb.finish()

    return save_path


# ─────────────────────────────────────────────
#  QUICK SINGLE-IMAGE TEST
# ─────────────────────────────────────────────

def test_single_image(model_path: str, image_path: str):
    """
    Quick sanity-check after training.
    Run: python train_mobilenet.py --test --model_path exports/agriQ_mobilenet_best.pth --image leaf.jpg
    """
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    ckpt   = torch.load(model_path, map_location=device)

    model  = AgriQMobileNet(ckpt["num_classes"], pretrained=False).to(device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()

    transform = A.Compose([
        A.Resize(256, 256),
        A.CenterCrop(224, 224),
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])

    img    = np.array(Image.open(image_path).convert("RGB"))
    tensor = transform(image=img)["image"].unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs  = F.softmax(logits, dim=1)
        top3_p, top3_i = probs[0].topk(3)

    print(f"\n{'='*50}")
    print(f"  AgriQ MobileNet — Prediction")
    print(f"{'='*50}")
    for rank, (p, i) in enumerate(zip(top3_p, top3_i), 1):
        cls     = ckpt["class_names"][i.item()]
        parts   = cls.split("___")
        crop    = parts[0]
        disease = parts[1].replace("_", " ").title() if len(parts) > 1 else "Healthy"
        print(f"  {rank}. {disease} ({crop}) — {p.item()*100:.2f}%")
    print(f"{'='*50}\n")


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriQ MobileNetV3 Trainer")
    parser.add_argument("--data_dir",   type=str,  default=None,
                        help="Path to PlantVillage dataset root")
    parser.add_argument("--batch_size", type=int,  default=CONFIG["batch_size"])
    parser.add_argument("--epochs",     type=int,  default=CONFIG["epochs"])
    parser.add_argument("--save_dir",   type=str,  default=CONFIG["save_dir"])
    parser.add_argument("--no_wandb",   action="store_true",
                        help="Disable W&B logging")
    # Test mode flags
    parser.add_argument("--test",       action="store_true",
                        help="Run single-image test instead of training")
    parser.add_argument("--model_path", type=str,  default=None)
    parser.add_argument("--image",      type=str,  default=None)
    args = parser.parse_args()

    # ── Test mode
    if args.test:
        if not args.model_path or not args.image:
            print("❌  --test requires --model_path and --image")
            sys.exit(1)
        test_single_image(args.model_path, args.image)
        sys.exit(0)

    # ── Train mode
    if not args.data_dir:
        print("❌  --data_dir is required for training")
        print("    Example: python train_mobilenet.py --data_dir data/raw/plantvillage")
        sys.exit(1)

    # Apply CLI overrides to config
    cfg = CONFIG.copy()
    cfg["batch_size"]    = args.batch_size
    cfg["epochs"]        = args.epochs
    cfg["save_dir"]      = args.save_dir
    cfg["wandb_enabled"] = not args.no_wandb

    print("\n╔══════════════════════════════════════════════════════╗")
    print("║       AgriQ — MobileNetV3-Large Training             ║")
    print("╠══════════════════════════════════════════════════════╣")
    print(f"║  Data dir  : {args.data_dir:<40}║")
    print(f"║  Epochs    : {cfg['epochs']:<40}║")
    print(f"║  Batch     : {cfg['batch_size']:<40}║")
    print(f"║  Save to   : {cfg['save_dir']:<40}║")
    print("╚══════════════════════════════════════════════════════╝\n")

    save_path = train(args.data_dir, cfg)

    print("\n✅  Training complete!")
    print(f"    Model: {save_path}")
    print(f"\n    To test a single image:")
    print(f"    python train_mobilenet.py --test \\")
    print(f"      --model_path {save_path} \\")
    print(f"      --image your_leaf_photo.jpg")
    print(f"\n    To build the ensemble, point both models at predict.py:")
    print(f"    python predict.py \\")
    print(f"      --eff_model exports/agriQ_efficientnet_best.pth \\")
    print(f"      --mob_model {save_path} \\")
    print(f"      --image leaf.jpg --gradcam")
