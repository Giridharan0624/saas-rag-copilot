"""
Module 7 — Hallucination / Confidence Control
Validates answer confidence using the RRF score and FAISS L2 distance.
Falls back gracefully when confidence is too low or no result was found.
"""

# Minimum RRF score to accept a result.
# RRF scores are small (e.g. 0.007–0.03 for top results with k=60).
# Tune this to trade precision vs recall.
MIN_RRF_SCORE: float = 0.007

# Maximum FAISS L2 distance to consider a semantic match acceptable.
# all-MiniLM-L6-v2 embeddings are unit-normed; L2 ≈ 2*(1-cosine),
# so 1.0 ≈ cosine similarity of 0.5 (a mediocre match).
MAX_FAISS_DIST: float = 1.0

FALLBACK_MESSAGE = (
    "I don't have enough information to answer that question reliably. "
    "Please try rephrasing your query or contact our support team."
)


def is_confident(result: dict) -> bool:
    """
    Return True when both the RRF score is high enough AND the
    FAISS semantic distance is close enough.
    """
    rrf_ok = result.get("score", 0.0) >= MIN_RRF_SCORE
    dist_ok = result.get("faiss_dist", float("inf")) <= MAX_FAISS_DIST
    return rrf_ok and dist_ok
