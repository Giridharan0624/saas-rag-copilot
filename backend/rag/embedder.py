"""
Module 3 — Embeddings
Loads a lightweight SentenceTransformer model and provides a single
`embed()` helper that accepts a list of strings and returns numpy vectors.
"""

from sentence_transformers import SentenceTransformer
import numpy as np

# Using all-MiniLM-L6-v2: fast, small, surprisingly accurate
MODEL_NAME = "all-MiniLM-L6-v2"

# Loaded once at import time so every module shares the same instance
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """Return (and lazily initialise) the shared embedding model."""
    global _model
    if _model is None:
        print(f"[Embedder] Loading model '{MODEL_NAME}' …")
        _model = SentenceTransformer(MODEL_NAME)
        print("[Embedder] Model loaded.")
    return _model


def embed(texts: list[str]) -> np.ndarray:
    """
    Encode a list of strings into a 2-D float32 numpy array.
    Shape: (len(texts), embedding_dim)
    """
    model = get_model()
    vectors = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return vectors.astype("float32")
