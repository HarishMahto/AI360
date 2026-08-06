import sys
from pathlib import Path

# Ensure root backend path is in sys.path
sys.path.append(str(Path(__file__).parent.parent))

from main import app

# Export FastAPI app for Vercel Serverless Function entrypoint
app = app
