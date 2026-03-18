"""
Module 4 — BM25 Retrieval
Builds a BM25Okapi index over the chunk corpus and provides a
search helper that returns (indices, normalised_scores).
"""

import pickle
import os
from rank_bm25 import BM25Okapi

_BASE = os.path.dirname(__file__)
BM25_PATH = os.path.join(_BASE, "data", "bm25.pkl")


def build_and_save(chunks: list[str]) -> BM25Okapi:
    """Tokenise chunks, build BM25 index, and persist to disk."""
    os.makedirs(os.path.dirname(BM25_PATH), exist_ok=True)

    tokenised = [chunk.lower().split() for chunk in chunks]
    bm25 = BM25Okapi(tokenised)

    with open(BM25_PATH, "wb") as f:
        pickle.dump(bm25, f)

    print(f"[BM25] Index built for {len(chunks)} chunks. Saved to {BM25_PATH}")
    return bm25


def load() -> BM25Okapi:
    """Load a persisted BM25 index from disk."""
    if not os.path.exists(BM25_PATH):
        raise FileNotFoundError(
            f"BM25 index not found at {BM25_PATH}. "
            "Run `python rag/indexer.py` first."
        )
    with open(BM25_PATH, "rb") as f:
        bm25 = pickle.load(f)
    print("[BM25] Index loaded.")
    return bm25


def search(bm25: BM25Okapi, query: str, k: int = 5) -> tuple[list[int], list[float]]:
    """
    Return the top-k chunk indices ranked by BM25 score.
    Scores are normalised to [0, 1] so they can be combined with FAISS scores.
    """
    tokens = query.lower().split()
    raw_scores = bm25.get_scores(tokens)

    max_score = max(raw_scores) if max(raw_scores) > 0 else 1.0
    normalised = [s / max_score for s in raw_scores]

    # Rank descending by score, take top-k (avoid Pyre2 slice overload false-positive)
    ranked: list[tuple[int, float]] = sorted(
        enumerate(normalised), key=lambda x: x[1], reverse=True
    )
    ranked_k: list[tuple[int, float]] = [ranked[i] for i in range(min(k, len(ranked)))]

    indices = [i for i, _ in ranked_k]
    scores = [s for _, s in ranked_k]
    return indices, scores

