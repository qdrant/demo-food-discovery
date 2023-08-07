import os
from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)

dotenv_path = os.path.join(ROOT_DIR, ".env")

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Qdrant configuration
QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY", None)
QDRANT_COLLECTION = os.environ.get("QDRANT_COLLECTION", "products")

# Search configuration
MAX_SEARCH_LIMIT = 100
DEFAULT_LIMIT = 12
