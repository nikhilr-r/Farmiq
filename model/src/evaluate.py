"""
AgriQ — Evaluation & Metrics
=============================
Comprehensive evaluation pipeline for the trained ensemble.
Generates:
  - Accuracy, F1, Precision, Recall per class
  - Confusion matrix heatmap
  - Per-crop accuracy breakdown
  - GradCAM visualizations
  - Calibration curve (confidence reliability)

Usage:
    python src/evaluate.py --data_dir data/raw/plantvillage
"""

import sys
import os
import argparse
from pathlib import Path
from collections import defaultdict

import numpy as np
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from sklearn.metrics import (
    classification_report, confusion_matrix,
    accuracy_score, f1_score
)
from sklearn.calibration import calibration_curve
import yaml

sys.path.append(str(Path(__file__).parent.parent))
from src.dataset import get_dataloaders, get_tta_transforms
from src.models import AgriQEfficientNet, AgriQMobileNet, AgriQEnsemble
from src.predict import AgriQPredictor


# ─────────────────────────────────────────────
#  Evaluation Engine
# ─────────────────────────────────────────────

class AgriQEvaluator:

    def __init__(self, predictor: AgriQPredictor, classes: list, device: torch.device):
        self.predictor = predictor
        self.classes   = classes
        self.device    = device
        os.makedirs("evaluation_results", exist_ok=True)

    @torch.no_grad()
    def evaluate_loader(self, loader, use_tta: bool = True):
        """Run full evaluation on a dataloader. Returns predictions + labels."""
        all_preds   = []
        all_labels  = []
        all_confs   = []
        all_probs   = []

        total = len(loader)
        for i, (imgs, labels) in enumerate(loader):
            print(f"  Evaluating batch {i+1}/{total}", end="\r")
            imgs = imgs.to(self.device)

            if use_tta:
                probs = self.predictor.predict_tta_batch(imgs)
            else:
                probs = self.predictor.ensemble.forward(imgs)

            conf, pred = probs.max(dim=1)

            all_preds.extend(pred.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_confs.extend(conf.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

        print()
        return (
            np.array(all_preds),
            np.array(all_labels),
            np.array(all_confs),
            np.array(all_probs),
        )

    def print_report(self, preds, labels):
        """Print classification report."""
        acc = accuracy_score(labels, preds)
        f1  = f1_score(labels, preds, average="macro")

        print(f"\n{'='*65}")
        print(f"  AgriQ Evaluation Results")
        print(f"{'='*65}")
        print(f"  Overall Accuracy : {acc:.4f} ({acc*100:.2f}%)")
        print(f"  Macro F1 Score   : {f1:.4f}")
        print(f"{'='*65}\n")
        print(classification_report(labels, preds, target_names=self.classes, digits=4))

        return acc, f1

    def plot_confusion_matrix(self, preds, labels, save_path: str = "evaluation_results/confusion_matrix.png"):
        """Plot and save confusion matrix."""
        cm = confusion_matrix(labels, preds)
        cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)

        fig, ax = plt.subplots(figsize=(20, 18))
        sns.heatmap(
            cm_norm,
            annot=len(self.classes) <= 20,  # only show numbers if not too many classes
            fmt=".2f" if len(self.classes) <= 20 else "",
            cmap="YlOrRd",
            xticklabels=[c.split("___")[-1].replace("_", " ") for c in self.classes],
            yticklabels=[c.split("___")[-1].replace("_", " ") for c in self.classes],
            ax=ax,
            linewidths=0.5,
        )
        ax.set_title("AgriQ Disease Detection — Confusion Matrix (Normalized)", fontsize=16, pad=20)
        ax.set_xlabel("Predicted", fontsize=12)
        ax.set_ylabel("Actual", fontsize=12)
        plt.xticks(rotation=45, ha="right", fontsize=8)
        plt.yticks(rotation=0, fontsize=8)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"📊 Confusion matrix saved → {save_path}")

    def plot_per_crop_accuracy(self, preds, labels, save_path: str = "evaluation_results/per_crop_accuracy.png"):
        """Bar chart of accuracy per crop."""
        crop_correct = defaultdict(int)
        crop_total   = defaultdict(int)

        for pred, label in zip(preds, labels):
            crop = self.classes[label].split("___")[0]
            crop_total[crop] += 1
            if pred == label:
                crop_correct[crop] += 1

        crops = sorted(crop_total.keys())
        accs  = [crop_correct[c] / crop_total[c] for c in crops]
        colors = ["#2ecc71" if a >= 0.95 else "#f39c12" if a >= 0.90 else "#e74c3c" for a in accs]

        fig, ax = plt.subplots(figsize=(14, 6))
        bars = ax.bar(crops, accs, color=colors, edgecolor="white", linewidth=1.5)
        ax.axhline(y=0.95, color="green",  linestyle="--", alpha=0.7, label="95% target")
        ax.axhline(y=0.90, color="orange", linestyle="--", alpha=0.7, label="90% threshold")

        for bar, acc in zip(bars, accs):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.005,
                    f"{acc*100:.1f}%", ha="center", va="bottom", fontsize=9, fontweight="bold")

        ax.set_ylim(0, 1.05)
        ax.set_xlabel("Crop", fontsize=12)
        ax.set_ylabel("Accuracy", fontsize=12)
        ax.set_title("AgriQ — Per-Crop Accuracy (Ensemble + TTA)", fontsize=14)
        patches = [
            mpatches.Patch(color="#2ecc71", label="≥ 95% (Target)"),
            mpatches.Patch(color="#f39c12", label="90-95% (Acceptable)"),
            mpatches.Patch(color="#e74c3c", label="< 90% (Needs work)"),
        ]
        ax.legend(handles=patches, loc="lower right")
        plt.xticks(rotation=30, ha="right")
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"📊 Per-crop accuracy saved → {save_path}")

    def plot_calibration_curve(self, confs, labels, preds,
                               save_path: str = "evaluation_results/calibration.png"):
        """
        Calibration curve — shows if model's confidence matches actual accuracy.
        A well-calibrated model: 80% confidence → 80% correct.
        Critical for farmer trust.
        """
        correct = (preds == labels).astype(float)

        prob_true, prob_pred = calibration_curve(correct, confs, n_bins=10)

        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # Calibration curve
        axes[0].plot([0, 1], [0, 1], "k--", label="Perfect calibration", alpha=0.7)
        axes[0].plot(prob_pred, prob_true, "bo-", label="AgriQ Ensemble", linewidth=2, markersize=8)
        axes[0].fill_between(prob_pred, prob_true, prob_pred, alpha=0.15, color="blue")
        axes[0].set_xlabel("Mean Predicted Confidence", fontsize=12)
        axes[0].set_ylabel("Fraction of Correct Predictions", fontsize=12)
        axes[0].set_title("Confidence Calibration Curve", fontsize=13)
        axes[0].legend(fontsize=11)
        axes[0].grid(True, alpha=0.3)

        # Confidence distribution
        axes[1].hist(confs[preds == labels],  bins=30, alpha=0.7, color="#2ecc71", label="Correct")
        axes[1].hist(confs[preds != labels],  bins=30, alpha=0.7, color="#e74c3c", label="Wrong")
        axes[1].axvline(x=0.75, color="navy", linestyle="--", label="0.75 threshold")
        axes[1].set_xlabel("Confidence", fontsize=12)
        axes[1].set_ylabel("Count", fontsize=12)
        axes[1].set_title("Confidence Distribution", fontsize=13)
        axes[1].legend(fontsize=11)
        axes[1].grid(True, alpha=0.3)

        plt.suptitle("AgriQ — Model Calibration (Farmer Trust Analysis)", fontsize=14, y=1.02)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"📊 Calibration curve saved → {save_path}")

    def plot_model_comparison(self, results: dict, save_path: str = "evaluation_results/model_comparison.png"):
        """Compare individual models vs ensemble."""
        models = list(results.keys())
        accs   = [results[m]["accuracy"] * 100 for m in models]
        f1s    = [results[m]["f1"] * 100 for m in models]

        x = np.arange(len(models))
        width = 0.35

        fig, ax = plt.subplots(figsize=(10, 6))
        bars1 = ax.bar(x - width/2, accs, width, label="Accuracy", color="#3498db", alpha=0.85)
        bars2 = ax.bar(x + width/2, f1s,  width, label="Macro F1",  color="#9b59b6", alpha=0.85)

        for bar in bars1 + bars2:
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.2,
                    f"{bar.get_height():.2f}%", ha="center", va="bottom", fontsize=10, fontweight="bold")

        ax.axhline(y=95, color="green", linestyle="--", alpha=0.6, label="95% target")
        ax.set_ylim(85, 100)
        ax.set_ylabel("Score (%)", fontsize=12)
        ax.set_title("AgriQ — Model Comparison (Test Set)", fontsize=14)
        ax.set_xticks(x)
        ax.set_xticklabels(models, fontsize=11)
        ax.legend(fontsize=11)
        ax.grid(True, alpha=0.3, axis="y")
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"📊 Model comparison saved → {save_path}")

    def run_full_evaluation(self, test_loader):
        """Run complete evaluation suite."""
        print("\n🔍 Running full evaluation (with TTA)...")
        preds, labels, confs, probs = self.evaluate_loader(test_loader, use_tta=True)

        print("\n📋 Classification Report:")
        acc, f1 = self.print_report(preds, labels)

        print("\n📊 Generating evaluation plots...")
        self.plot_confusion_matrix(preds, labels)
        self.plot_per_crop_accuracy(preds, labels)
        self.plot_calibration_curve(confs, labels, preds)

        # Summary
        print(f"\n{'='*65}")
        print(f"  Final Results Summary")
        print(f"{'='*65}")
        print(f"  Test Accuracy (Ensemble + TTA): {acc*100:.2f}%")
        print(f"  Macro F1 Score                : {f1*100:.2f}%")

        high_conf_mask = confs >= 0.75
        if high_conf_mask.sum() > 0:
            high_conf_acc = accuracy_score(labels[high_conf_mask], preds[high_conf_mask])
            print(f"  Accuracy when conf ≥ 75%      : {high_conf_acc*100:.2f}%")
            print(f"  % predictions above 75% conf  : {high_conf_mask.mean()*100:.1f}%")

        print(f"{'='*65}")
        return {"accuracy": acc, "f1": f1}


def main(args):
    with open(args.config) as f:
        config = yaml.safe_load(f)

    device = (torch.device("mps") if torch.backends.mps.is_available()
              else torch.device("cuda") if torch.cuda.is_available()
              else torch.device("cpu"))

    print(f"🔧 Device: {device}")

    # Load data
    _, _, test_loader, classes, class_to_idx = get_dataloaders(
        data_dir=args.data_dir or config["data"]["raw_dir"],
        batch_size=config["data"]["batch_size"],
        img_size=config["data"]["img_size"],
    )

    # Load predictor (ensemble)
    predictor = AgriQPredictor(
        efficientnet_path=os.path.join(config["export"]["save_dir"], config["export"]["efficientnet_name"]),
        mobilenet_path=os.path.join(config["export"]["save_dir"], config["export"]["mobilenet_name"]),
        device=device,
        tta_n=config["inference"]["tta_augments"],
        target_classes=classes,
    )

    evaluator = AgriQEvaluator(predictor, classes, device)
    results   = evaluator.run_full_evaluation(test_loader)

    print("\n✅ Evaluation complete. Check evaluation_results/ folder.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriQ Evaluator")
    parser.add_argument("--data_dir", type=str, default=None)
    parser.add_argument("--config",   type=str, default="configs/config.yaml")
    args = parser.parse_args()
    main(args)
