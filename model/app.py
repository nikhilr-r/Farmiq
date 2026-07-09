import os
import sys
from pathlib import Path
import uvicorn

# Add current directory to path so imports work correctly
sys.path.append(str(Path(__file__).parent))

# Import the FastAPI app
from api.app import app

if __name__ == "__main__":
    # Hugging Face runs Gradio spaces on port 7860 by default
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("api.app:app", host="0.0.0.0", port=port)
