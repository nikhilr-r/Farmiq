"""
AgriQ — Training Pipeline
==========================
Trains EfficientNetV2-S and MobileNetV3-Large independently.
Features:
  - Phase-based training (frozen backbone → full fine-tune)
  - MixUp + CutMix augmentation
  - Cosine Annealing with Warm Restarts
  - Differential learning rates (backbone vs head)
  - Early stopping with best model checkpointing
  - W&B experiment tracking
  - Label smoothing

Usage:
    python src/train.py --model efficientnet --data_dir data/raw/plantvillage
    python src/train.py --model mobilenet    --data_dir data/raw/plantvillage
    python src/train.py --model both         --data_dir data/raw/plantvillage
"""

import os
import sys
import time
import random
import argparse
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from torchmetrics import Accuracy, F1Score
import yaml

# Local imports
sys.path.append(str(Path(__file__).parent.parent))
from src.dataset import get_dataloaders
from src.models import (
    AgriQEfficientNet, AgriQMobileNet,
    mixup_data, mixup_criterion,
    cutmix_data, build_models
)

try:
    import wandb
    WANDB_AVAILABLE = True
except ImportError:
    WANDB_AVAILABLE = False
    print("⚠️  W&B not installed. Run: pip install wandb")


# ─────────────────────────────────────────────
#  Seed Everything
# ─────────────────────────────────────────────

def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.backends.mps.is_available():
        torch.mps.manual_seed(seed)


# ─────────────────────────────────────────────
#  Trainer Class
# ─────────────────────────────────────────────

class AgriQTrainer:

    def __init__(self, model, num_classes: int, device: torch.device, config: dict):
        self.model = model.to(device)
        self.device = device
        self.config = config
        self.num_classes = num_classes
        self.model_name = model.model_name

        # Loss — label smoothing prevents overconfident predictions
        self.criterion = nn.CrossEntropyLoss(
            label_smoothing=config["training"]["label_smoothing"]
        )

        # Metrics
        self.train_acc = Accuracy(task="multiclass", num_classes=num_classes).to(device)
        self.val_acc   = Accuracy(task="multiclass", num_classes=num_classes).to(device)
        self.val_f1    = F1Score(task="multiclass", num_classes=num_classes, average="macro").to(device)

        self.best_val_acc = 0.0
        self.patience_counter = 0

    def _build_optimizer(self, phase: str = "full"):
        """
        Differential learning rates:
        - Backbone gets 10x lower LR (preserve pretrained features)
        - Head gets full LR (learn new task)
        """
        cfg = self.config["training"]

        if phase == "warmup":
            # Head only during warmup
            params = [{"params": self.model.classifier.parameters(), "lr": cfg["head_lr"]}]
        else:
            params = [
                {"params": self.model.backbone.parameters(),   "lr": cfg["backbone_lr"]},
                {"params": self.model.classifier.parameters(), "lr": cfg["head_lr"]},
            ]

        optimizer = AdamW(params, weight_decay=cfg["weight_decay"])
        scheduler = CosineAnnealingWarmRestarts(
            optimizer,
            T_0=cfg["scheduler_T0"],
            T_mult=cfg["scheduler_T_mult"],
            eta_min=cfg["eta_min"],
        )
        return optimizer, scheduler

    def _apply_mixup_or_cutmix(self, imgs, labels):
        """
        Randomly apply MixUp or CutMix with 50/50 chance.
        These are the most impactful regularization techniques for this task.
        """
        cfg = self.config["training"]
        r = random.random()

        if r < 0.33:
            # MixUp
            mixed, y_a, y_b, lam = mixup_data(imgs, labels, cfg["mixup_alpha"])
            return mixed, y_a, y_b, lam, "mixup"
        elif r < 0.66:
            # CutMix
            mixed, y_a, y_b, lam = cutmix_data(imgs, labels, cfg["cutmix_alpha"])
            return mixed, y_a, y_b, lam, "cutmix"
        else:
            # Normal (no mixing)
            return imgs, labels, labels, 1.0, "none"

    def train_epoch(self, loader, optimizer, scheduler, epoch: int):
        self.model.train()
        total_loss = 0.0
        self.train_acc.reset()
        n_batches = len(loader)

        for batch_idx, (imgs, labels) in enumerate(loader):
            imgs   = imgs.to(self.device)
            labels = labels.to(self.device)

            # Apply MixUp / CutMix
            mixed_imgs, y_a, y_b, lam, aug_type = self._apply_mixup_or_cutmix(imgs, labels)

            optimizer.zero_grad()
            logits = self.model(mixed_imgs)

            # Compute loss
            if aug_type in ("mixup", "cutmix"):
                loss = mixup_criterion(self.criterion, logits, y_a, y_b, lam)
            else:
                loss = self.criterion(logits, labels)

            loss.backward()

            # Gradient clipping — training stability
            torch.nn.utils.clip_grad_norm_(
                self.model.parameters(),
                max_norm=self.config["training"]["grad_clip"]
            )

            optimizer.step()
            total_loss += loss.item()

            # Track accuracy on clean labels only
            with torch.no_grad():
                self.train_acc.update(logits, labels)

            # Progress print every 50 batches
            if (batch_idx + 1) % 50 == 0:
                print(f"    Batch {batch_idx+1}/{n_batches} | Loss: {loss.item():.4f}", end="\r")

        scheduler.step(epoch)
        return total_loss / n_batches, self.train_acc.compute().item()

    @torch.no_grad()
    def validate(self, loader):
        self.model.eval()
        total_loss = 0.0
        self.val_acc.reset()
        self.val_f1.reset()

        for imgs, labels in loader:
            imgs   = imgs.to(self.device)
            labels = labels.to(self.device)

            logits = self.model(imgs)
            loss   = self.criterion(logits, labels)

            total_loss += loss.item()
            self.val_acc.update(logits, labels)
            self.val_f1.update(logits, labels)

        return (
            total_loss / len(loader),
            self.val_acc.compute().item(),
            self.val_f1.compute().item(),
        )

    def save_checkpoint(self, epoch: int, val_acc: float, val_f1: float,
                        classes: list, save_dir: str, tag: str = "best"):
        os.makedirs(save_dir, exist_ok=True)
        model_key = self.model_name.lower().replace(" ", "_").replace("-", "")
        path = os.path.join(save_dir, f"agriQ_{model_key}_{tag}.pth")

        torch.save({
            "epoch":        epoch,
            "model_name":   self.model_name,
            "model_state":  self.model.state_dict(),
            "val_acc":      val_acc,
            "val_f1":       val_f1,
            "class_names":  classes,
            "num_classes":  self.num_classes,
            "config":       self.config,
        }, path)
        return path

    def fit(self, train_loader, val_loader, classes: list, save_dir: str):
        cfg = self.config["training"]
        patience_limit = cfg["early_stopping_patience"]
        freeze_epochs  = cfg.get("freeze_backbone_epochs", 5)

        print(f"\n{'='*60}")
        print(f"  Training: {self.model_name}")
        print(f"  Device:   {self.device}")
        print(f"  Classes:  {self.num_classes}")
        print(f"  Epochs:   {cfg['epochs']} (patience={patience_limit})")
        print(f"{'='*60}\n")

        # ── Phase 1: Warmup — train head only (frozen backbone)
        print(f"📌 Phase 1: Warmup ({freeze_epochs} epochs, backbone frozen)")
        self.model.freeze_backbone()
        optimizer, scheduler = self._build_optimizer(phase="warmup")

        for epoch in range(1, freeze_epochs + 1):
            t0 = time.time()
            tr_loss, tr_acc = self.train_epoch(train_loader, optimizer, scheduler, epoch)
            vl_loss, vl_acc, vl_f1 = self.validate(val_loader)
            elapsed = time.time() - t0

            print(f"  WarmUp {epoch:2d}/{freeze_epochs} | "
                  f"Loss {tr_loss:.4f} Acc {tr_acc:.4f} | "
                  f"Val Loss {vl_loss:.4f} Acc {vl_acc:.4f} F1 {vl_f1:.4f} | "
                  f"{elapsed:.1f}s")

        # ── Phase 2: Full fine-tuning (backbone unfrozen)
        print(f"\n📌 Phase 2: Full fine-tuning (backbone unfrozen)")
        self.model.unfreeze_backbone()
        optimizer, scheduler = self._build_optimizer(phase="full")

        for epoch in range(1, cfg["epochs"] + 1):
            t0 = time.time()
            tr_loss, tr_acc = self.train_epoch(train_loader, optimizer, scheduler, epoch)
            vl_loss, vl_acc, vl_f1 = self.validate(val_loader)
            elapsed = time.time() - t0

            is_best = vl_acc > self.best_val_acc
            marker  = "✅" if is_best else "  "

            print(f"  {marker} Epoch {epoch:3d}/{cfg['epochs']} | "
                  f"Train Loss {tr_loss:.4f} Acc {tr_acc:.4f} | "
                  f"Val Loss {vl_loss:.4f} Acc {vl_acc:.4f} F1 {vl_f1:.4f} | "
                  f"LR {optimizer.param_groups[-1]['lr']:.6f} | {elapsed:.1f}s")

            if WANDB_AVAILABLE:
                wandb.log({
                    f"{self.model_name}/train_loss": tr_loss,
                    f"{self.model_name}/train_acc":  tr_acc,
                    f"{self.model_name}/val_loss":   vl_loss,
                    f"{self.model_name}/val_acc":    vl_acc,
                    f"{self.model_name}/val_f1":     vl_f1,
                    f"{self.model_name}/lr":         optimizer.param_groups[-1]["lr"],
                    "epoch": epoch + freeze_epochs,
                })

            if is_best:
                self.best_val_acc = vl_acc
                path = self.save_checkpoint(epoch, vl_acc, vl_f1, classes, save_dir)
                print(f"       💾 Saved → {path}")
                self.patience_counter = 0
            else:
                self.patience_counter += 1
                if self.patience_counter >= patience_limit:
                    print(f"\n⏹️  Early stopping at epoch {epoch} (no improvement for {patience_limit} epochs)")
                    break

        print(f"\n🏆 {self.model_name} — Best Val Accuracy: {self.best_val_acc:.4f}")
        return self.best_val_acc


# ─────────────────────────────────────────────
#  Main Training Entry Point
# ─────────────────────────────────────────────

def train(args):
    # Load config
    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    set_seed(config["project"]["seed"])

    # Device — M4 Apple Silicon
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print(f"🍎 Using Apple MPS (M4 GPU)")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"🟢 Using CUDA GPU: {torch.cuda.get_device_name()}")
    else:
        device = torch.device("cpu")
        print(f"🔵 Using CPU (training will be slow)")

    # Data
    data_dir = args.data_dir or config["data"]["raw_dir"]
    print(f"\n📂 Loading data from: {data_dir}")

    train_loader, val_loader, test_loader, classes, class_to_idx = get_dataloaders(
        data_dir=data_dir,
        batch_size=config["data"]["batch_size"],
        img_size=config["data"]["img_size"],
        val_split=config["data"]["val_split"],
        test_split=config["data"]["test_split"],
    )
    num_classes = len(classes)

    # W&B
    if WANDB_AVAILABLE and config["wandb"]["enabled"]:
        wandb.init(
            project=config["wandb"]["project"],
            name=f"AgriQ-{args.model}-{time.strftime('%m%d-%H%M')}",
            config=config,
        )

    save_dir = config["export"]["save_dir"]
    results  = {}

    # ── Train EfficientNet
    if args.model in ("efficientnet", "both"):
        print(f"\n{'='*60}")
        print(f"  Model 1/2: EfficientNetV2-S")
        print(f"{'='*60}")
        eff_model   = AgriQEfficientNet(num_classes).to(device)
        eff_trainer = AgriQTrainer(eff_model, num_classes, device, config)
        results["efficientnet"] = eff_trainer.fit(train_loader, val_loader, classes, save_dir)

    # ── Train MobileNet
    if args.model in ("mobilenet", "both"):
        print(f"\n{'='*60}")
        print(f"  Model 2/2: MobileNetV3-Large")
        print(f"{'='*60}")
        mob_model   = AgriQMobileNet(num_classes).to(device)
        mob_trainer = AgriQTrainer(mob_model, num_classes, device, config)
        results["mobilenet"] = mob_trainer.fit(train_loader, val_loader, classes, save_dir)

    # ── Final Summary
    print(f"\n{'='*60}")
    print(f"  Training Complete — Summary")
    print(f"{'='*60}")
    for model_name, acc in results.items():
        print(f"  {model_name:20s}: {acc:.4f} val accuracy ({acc*100:.2f}%)")

    if WANDB_AVAILABLE and config["wandb"]["enabled"]:
        wandb.finish()

    print(f"\n✅ Models saved to: {save_dir}")
    print(f"🚀 Next: Run evaluation with: python src/evaluate.py")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriQ Disease Detection Trainer")
    parser.add_argument(
        "--model",
        choices=["efficientnet", "mobilenet", "both"],
        default="both",
        help="Which model(s) to train"
    )
    parser.add_argument(
        "--data_dir",
        type=str,
        default=None,
        help="Path to PlantVillage dataset (overrides config)"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="configs/config.yaml",
        help="Path to config file"
    )
    args = parser.parse_args()
    train(args)
