#!/bin/bash
# ============================================================
#  AgriQ ML — Setup & Run Script (Apple M4 Silicon)
#  Run this first: bash setup.sh
# ============================================================

set -e  # Exit on error

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║         AgriQ ML Setup — Apple M4 Silicon           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "🐍 Python: $python_version"

# ── 2. Create and activate conda env (recommended)
echo ""
echo "📦 Setting up environment..."

if command -v conda &> /dev/null; then
    echo "  Using conda..."
    conda create -n agriq-ml python=3.11 -y 2>/dev/null || true
    echo "  ✅ Run: conda activate agriq-ml"
else
    echo "  Using venv..."
    python3 -m venv .venv
    echo "  ✅ Run: source .venv/bin/activate"
fi

# ── 3. Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo "  ✅ Dependencies installed"

# ── 4. Verify MPS (Apple Silicon GPU)
echo ""
echo "🍎 Verifying Apple MPS..."
python3 -c "
import torch
mps = torch.backends.mps.is_available()
print(f'  MPS Available: {mps}')
if mps:
    x = torch.randn(100, 100).to('mps')
    y = x @ x.T
    print(f'  MPS Test: ✅ PASSED')
else:
    print(f'  MPS Test: ❌ FAILED — will fall back to CPU')
"

# ── 5. Create directories
echo ""
echo "📁 Creating directories..."
mkdir -p data/{raw,processed,field_images}
mkdir -p exports
mkdir -p evaluation_results
mkdir -p notebooks
echo "  ✅ Directories created"

# ── 6. Dataset instructions
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              Dataset Download Instructions           ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
echo "║  Option 1 (Kaggle — Recommended):                   ║"
echo "║  pip install kaggle                                  ║"
echo "║  kaggle datasets download -d abdallahalidev/         ║"
echo "║    plantvillage-dataset                              ║"
echo "║  unzip plantvillage-dataset.zip -d data/raw/        ║"
echo "║                                                      ║"
echo "║  Option 2 (Manual):                                  ║"
echo "║  Download from: github.com/spMohanty/               ║"
echo "║    PlantVillage-Dataset                              ║"
echo "║  Extract to: data/raw/plantvillage/                  ║"
echo "║                                                      ║"
echo "║  Expected folder structure:                          ║"
echo "║  data/raw/plantvillage/                              ║"
echo "║    ├── Apple___Apple_scab/                           ║"
echo "║    ├── Tomato___Late_blight/                         ║"
echo "║    ├── Wheat___healthy/                              ║"
echo "║    └── ... (38 total classes)                        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Once dataset is ready, run:"
echo ""
echo "  # Train both models (recommended)"
echo "  python src/train.py --model both --data_dir data/raw/plantvillage"
echo ""
echo "  # Train one at a time"
echo "  python src/train.py --model efficientnet --data_dir data/raw/plantvillage"
echo "  python src/train.py --model mobilenet    --data_dir data/raw/plantvillage"
echo ""
echo "  # Evaluate after training"
echo "  python src/evaluate.py --data_dir data/raw/plantvillage"
echo ""
echo "  # Test single image prediction"
echo "  python src/predict.py \\"
echo "    --eff_model exports/agriQ_efficientnetversionsvs_best.pth \\"
echo "    --mob_model exports/agriQ_mobilenetv3large_best.pth \\"
echo "    --image your_leaf_photo.jpg --gradcam"
echo ""
echo "  # Start API server"
echo "  uvicorn api.app:app --host 0.0.0.0 --port 8000"
echo ""
echo "✅ Setup complete!"
