"""
Module 5 — Hybrid Retrieval
Combines FAISS (semantic) and BM25 (keyword) results using a
Reciprocal Rank Fusion (RRF) score so both signals are fairly weighted
regardless of their native scale.
"""

from __future__ import annotations

import numpy as np
import faiss
from rank_bm25 import BM25Okapi

from rag import embedder, faiss_store, bm25_store

# RRF constant — standard value from the original paper
RRF_K = 60


def _rrf_score(rank: int) -> float:
    return 1.0 / (RRF_K + rank + 1)


def retrieve(
    query: str,
    index: faiss.Index,
    bm25: BM25Okapi,
    chunks: list[str],
    top_k: int = 5,
) -> list[dict]:
    """
    Run hybrid search and return a list of result dicts, each with:
        { "chunk": str, "score": float, "faiss_dist": float, "bm25_score": float }
    Results are sorted by descending RRF score (higher = better).
    """
    # --- FAISS semantic search -----------
    query_vec = embedder.embed([query])
    faiss_indices, faiss_dists = faiss_store.search(index, query_vec, k=top_k)

    # --- BM25 keyword search ---------------
    bm25_indices, bm25_scores = bm25_store.search(bm25, query, k=top_k)

    # --- Reciprocal Rank Fusion ------------
    rrf: dict[int, float] = {}

    for rank, idx in enumerate(faiss_indices):
        if idx < 0:
            continue
        rrf[idx] = rrf.get(idx, 0.0) + _rrf_score(rank)

    for rank, idx in enumerate(bm25_indices):
        rrf[idx] = rrf.get(idx, 0.0) + _rrf_score(rank)

    # Build per-index lookup helpers with explicit casts to satisfy type checker
    faiss_dist_map: dict[int, float] = {int(i): float(d) for i, d in zip(faiss_indices, faiss_dists)}
    bm25_score_map: dict[int, float] = {int(i): float(s) for i, s in zip(bm25_indices, bm25_scores)}

    # Assemble results sorted by combined RRF score
    sorted_rrf: list[tuple[int, float]] = sorted(
        rrf.items(), key=lambda x: x[1], reverse=True
    )
    results: list[dict] = [
        {
            "chunk": chunks[idx],
            "score": rrf_score,
            "faiss_dist": faiss_dist_map.get(idx, float("inf")),
            "bm25_score": bm25_score_map.get(idx, 0.0),
        }
        for idx, rrf_score in sorted_rrf
        if idx < len(chunks)
    ]

    # Return top_k without slice (use range comprehension to avoid Pyre2 false-positive)
    return [results[i] for i in range(min(top_k, len(results)))]
