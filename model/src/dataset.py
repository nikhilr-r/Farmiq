"""
AgriQ — Dataset Pipeline
========================
PlantVillage dataset loading with heavy augmentation strategy.
Filters to Indian-relevant crops and applies field-condition simulation.

Usage:
    from src.dataset import get_dataloaders, download_plantvillage
"""

import os
import shutil
import random
from pathlib import Path
from typing import List, Tuple, Dict, Optional

import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
import torchvision.transforms as T
from torchvision import datasets
import albumentations as A
from albumentations.pytorch import ToTensorV2
from PIL import Image
import yaml
from collections import Counter


# ─────────────────────────────────────────────
#  Constants
# ─────────────────────────────────────────────

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

# PlantVillage → Indian crop names mapping
INDIAN_CROP_MAP = {
    "Apple":      "Apple (Seb)",
    "Corn":       "Maize (Makka)",
    "Grape":      "Grape (Angoor)",
    "Potato":     "Potato (Aalu)",
    "Tomato":     "Tomato (Tamatar)",
    "Pepper":     "Chilli/Pepper (Mirch)",
    "Rice":       "Rice (Dhan)",
    "Wheat":      "Wheat (Gehun)",
    "Cotton":     "Cotton (Kapas)",
    "Sugarcane":  "Sugarcane (Ganna)",
}

EXCLUDE_CROPS = [
    "Blueberry", "Cherry", "Peach", "Raspberry",
    "Strawberry", "Soybean", "Squash"
]


# ─────────────────────────────────────────────
#  Transforms
# ─────────────────────────────────────────────

def get_train_transform(img_size: int = 224) -> A.Compose:
    """
    Heavy augmentation pipeline.
    Simulates real Indian field conditions: varied lighting, blur, shadows, fog.
    This is the primary driver of generalization to real-world farmer photos.
    """
    return A.Compose([
        # Spatial transforms
        A.RandomResizedCrop(size=(img_size, img_size), scale=(0.65, 1.0), ratio=(0.75, 1.33)),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.3),
        A.RandomRotate90(p=0.4),
        A.Affine(
            translate_percent=(-0.1, 0.1), scale=(0.75, 1.25),
            rotate=(-35, 35), p=0.6, mode=0
        ),
        A.Perspective(scale=(0.05, 0.1), p=0.3),   # phone camera angle variation

        # Color & brightness — critical for field photos under sun/shade
        A.OneOf([
            A.RandomBrightnessContrast(brightness_limit=0.35, contrast_limit=0.35, p=1.0),
            A.HueSaturationValue(hue_shift_limit=25, sat_shift_limit=40, val_shift_limit=25, p=1.0),
            A.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.15, p=1.0),
            A.CLAHE(clip_limit=4.0, p=1.0),
        ], p=0.85),

        A.ToGray(p=0.05),  # rare grayscale — robustness

        # Simulate real-world photo artifacts
        A.OneOf([
            A.GaussianBlur(blur_limit=(3, 7), p=1.0),       # hand shake
            A.MotionBlur(blur_limit=9, p=1.0),               # movement
            A.MedianBlur(blur_limit=5, p=1.0),               # low quality camera
            A.Defocus(radius=(1, 4), p=1.0),                 # out of focus
        ], p=0.45),

        # Noise — cheap phones, compressed images
        A.OneOf([
            A.GaussNoise(p=1.0),
            A.ISONoise(color_shift=(0.01, 0.05), intensity=(0.1, 0.5), p=1.0),
            A.MultiplicativeNoise(multiplier=(0.9, 1.1), p=1.0),
        ], p=0.4),

        # Weather & environment simulation
        A.RandomShadow(num_shadows=(1, 3), shadow_dimension=5, p=0.35),
        A.RandomSunFlare(flare_roi=(0, 0, 1, 0.5), p=0.1),
        A.RandomFog(fog_coef_range=(0.05, 0.25), alpha_coef=0.08, p=0.1),
        A.RandomRain(slant_range=(-10, 10), drop_length=8, p=0.08),

        # Occlusion simulation (part of leaf hidden by other leaves, dirt)
        A.CoarseDropout(
            num_holes_range=(1, 10), hole_height_range=(8, 32), hole_width_range=(8, 32),
            fill=0, p=0.35
        ),
        A.GridDropout(ratio=0.15, p=0.2),

        # Final normalization
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])


def get_val_transform(img_size: int = 224) -> A.Compose:
    """Clean validation transform — no augmentation."""
    return A.Compose([
        A.Resize(height=img_size + 32, width=img_size + 32),
        A.CenterCrop(img_size, img_size),
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])


def get_tta_transforms(img_size: int = 224) -> List[A.Compose]:
    """
    Test-Time Augmentation transforms.
    Each image is passed through N different transforms at inference.
    Predictions are averaged → +1-2% accuracy boost.
    """
    base = [
       A.Resize(height=img_size + 32, width=img_size + 32),
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ]

    return [
        # 1. Center crop (clean)
        A.Compose([A.Resize(height=img_size + 32, width=img_size + 32),
                   A.CenterCrop(img_size, img_size),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 2. Horizontal flip
        A.Compose([A.Resize(height=img_size + 32, width=img_size + 32),
                   A.CenterCrop(img_size, img_size),
                   A.HorizontalFlip(p=1.0),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 3. Vertical flip
        A.Compose([A.Resize(height=img_size + 32, width=img_size + 32),
                   A.CenterCrop(img_size, img_size),
                   A.VerticalFlip(p=1.0),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 4. Rotate 90
        A.Compose([A.Resize(height=img_size + 32, width=img_size + 32),
                   A.CenterCrop(img_size, img_size),
                   A.RandomRotate90(p=1.0),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 5. Rotate 180
        A.Compose([A.Resize(height=img_size + 32, width=img_size + 32),
                   A.CenterCrop(img_size, img_size),
                   A.Rotate(limit=(180, 180), p=1.0),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 6. Slight brightness boost
        A.Compose([A.Resize(height=img_size + 32, width=img_size + 32),
                   A.CenterCrop(img_size, img_size),
                   A.RandomBrightnessContrast(brightness_limit=(0.1, 0.2), contrast_limit=0, p=1.0),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 7. Top-left crop
        A.Compose([A.Resize(height=img_size + 64, width=img_size + 64),
                   A.Crop(x_min=0, y_min=0, x_max=img_size, y_max=img_size),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
        # 8. Bottom-right crop
        A.Compose([A.Resize(height=img_size + 64, width=img_size + 64),
                   A.Crop(x_min=64, y_min=64, x_max=img_size + 64, y_max=img_size + 64),
                   A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD), ToTensorV2()]),
    ]


# ─────────────────────────────────────────────
#  Dataset Class
# ─────────────────────────────────────────────

class PlantDiseaseDataset(Dataset):
    """
    Custom dataset for PlantVillage with Indian crop filtering.
    Supports train/val/test splits with appropriate transforms.
    """

    def __init__(
        self,
        samples: List[Tuple[str, int]],
        classes: List[str],
        class_to_idx: Dict[str, int],
        transform: Optional[A.Compose] = None,
    ):
        self.samples = samples
        self.classes = classes
        self.class_to_idx = class_to_idx
        self.idx_to_class = {v: k for k, v in class_to_idx.items()}
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]
        image = np.array(Image.open(path).convert("RGB"))

        if self.transform:
            image = self.transform(image=image)["image"]

        return image, label

    def get_class_weights(self) -> torch.Tensor:
        """Compute inverse frequency weights for class-balanced sampling."""
        labels = [s[1] for s in self.samples]
        counts = Counter(labels)
        weights = [1.0 / counts[label] for label in labels]
        return torch.FloatTensor(weights)

    def parse_class_name(self, raw_name: str) -> Tuple[str, str]:
        """
        'Tomato___Late_blight' → ('Tomato', 'Late Blight')
        'Wheat___healthy'      → ('Wheat', 'Healthy')
        """
        parts = raw_name.split("___")
        crop = parts[0]
        disease = parts[1].replace("_", " ").title() if len(parts) > 1 else "Healthy"
        return crop, disease


# ─────────────────────────────────────────────
#  Data Loading
# ─────────────────────────────────────────────

def load_and_split_dataset(
    data_dir: str,
    val_split: float = 0.15,
    test_split: float = 0.10,
    seed: int = 42,
    exclude_crops: List[str] = EXCLUDE_CROPS,
) -> Tuple[List, List, List, List[str], Dict[str, int]]:
    """
    Loads PlantVillage, filters non-Indian crops, splits into train/val/test.
    Returns: train_samples, val_samples, test_samples, classes, class_to_idx
    """
    random.seed(seed)
    np.random.seed(seed)

    # Load via ImageFolder to get class structure
    full_dataset = datasets.ImageFolder(data_dir)
    all_classes = full_dataset.classes

    # Filter to Indian-relevant crops
    valid_classes = [
        c for c in all_classes
        if not any(ex.lower() in c.lower() for ex in exclude_crops)
    ]
    print(f"Kept {len(valid_classes)} classes (removed {len(all_classes) - len(valid_classes)} non-Indian crops)")

    # Re-index classes
    class_to_idx = {c: i for i, c in enumerate(valid_classes)}

    # Filter samples
    all_samples = [
        (path, class_to_idx[full_dataset.classes[label]])
        for path, label in full_dataset.samples
        if full_dataset.classes[label] in valid_classes
    ]
    print(f"Total samples: {len(all_samples)}")

    # Stratified split per class
    class_samples = {c: [] for c in range(len(valid_classes))}
    for path, label in all_samples:
        class_samples[label].append((path, label))

    train_samples, val_samples, test_samples = [], [], []

    for label, samples in class_samples.items():
        random.shuffle(samples)
        n = len(samples)
        n_test = max(1, int(n * test_split))
        n_val  = max(1, int(n * val_split))
        n_train = n - n_test - n_val

        train_samples.extend(samples[:n_train])
        val_samples.extend(samples[n_train:n_train + n_val])
        test_samples.extend(samples[n_train + n_val:])

    print(f"  Train: {len(train_samples)} | Val: {len(val_samples)} | Test: {len(test_samples)}")

    return train_samples, val_samples, test_samples, valid_classes, class_to_idx


def get_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    img_size: int = 224,
    val_split: float = 0.15,
    test_split: float = 0.10,
    use_weighted_sampler: bool = True,
    seed: int = 42,
) -> Tuple[DataLoader, DataLoader, DataLoader, List[str], Dict[str, int]]:
    """
    Main entry point — returns train/val/test DataLoaders.

    Args:
        data_dir: Path to PlantVillage dataset root
        batch_size: Samples per batch (32 optimal for M4)
        img_size: Input image size (224 for EfficientNetV2/MobileNetV3)
        use_weighted_sampler: Balance classes during training
    """
    train_s, val_s, test_s, classes, class_to_idx = load_and_split_dataset(
        data_dir, val_split, test_split, seed
    )

    train_ds = PlantDiseaseDataset(train_s, classes, class_to_idx, get_train_transform(img_size))
    val_ds   = PlantDiseaseDataset(val_s,   classes, class_to_idx, get_val_transform(img_size))
    test_ds  = PlantDiseaseDataset(test_s,  classes, class_to_idx, get_val_transform(img_size))

    # Weighted sampler → prevents model from ignoring minority disease classes
    if use_weighted_sampler:
        weights = train_ds.get_class_weights()
        sampler = WeightedRandomSampler(weights, len(weights), replacement=True)
        train_loader = DataLoader(
            train_ds, batch_size=batch_size, sampler=sampler,
            num_workers=0, pin_memory=False, drop_last=True
        )
    else:
        train_loader = DataLoader(
            train_ds, batch_size=batch_size, shuffle=True,
            num_workers=0, pin_memory=False, drop_last=True
        )

    val_loader = DataLoader(
        val_ds, batch_size=batch_size, shuffle=False,
        num_workers=0, pin_memory=False
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size, shuffle=False,
        num_workers=0, pin_memory=False
    )

    print(f"\nDataLoaders ready:")
    print(f"   Classes: {len(classes)}")
    print(f"   Batch size: {batch_size}")
    print(f"   Train batches: {len(train_loader)}")

    return train_loader, val_loader, test_loader, classes, class_to_idx


# ─────────────────────────────────────────────
#  Dataset Download Helper
# ─────────────────────────────────────────────

def print_dataset_instructions():
    print("""
╔══════════════════════════════════════════════════════════╗
║          PlantVillage Dataset Download Guide             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Option 1 — Kaggle (Recommended, fastest):               ║
║  kaggle datasets download -d abdallahalidev/plantvillage ║
║                                                          ║
║  Option 2 — Direct from GitHub:                          ║
║  git clone https://github.com/spMohanty/PlantVillage-   ║
║  Dataset data/raw/plantvillage                           ║
║                                                          ║
║  Option 3 — TensorFlow Datasets:                         ║
║  import tensorflow_datasets as tfds                      ║
║  ds = tfds.load('plant_village')                         ║
║                                                          ║
║  After download, set data_dir in configs/config.yaml     ║
╚══════════════════════════════════════════════════════════╝
""")
