import os

# Qdrant configuration
QDRANT_URL = os.environ["QDRANT_URL"]
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY", None)
QDRANT_COLLECTION = os.environ["QDRANT_COLLECTION"]

# Search configuration
MAX_SEARCH_LIMIT = 100
DEFAULT_LIMIT = 12
