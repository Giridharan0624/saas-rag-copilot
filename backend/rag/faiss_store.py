"""
Module 3 — FAISS Vector Store
Builds, saves, and loads a FAISS flat L2 index alongside the
corresponding chunk list, so the index can survive server restarts.
"""

import os
import json
import faiss
import numpy as np

# Paths for persisted index data (relative to this file's directory)
_BASE = os.path.dirname(__file__)
FAISS_INDEX_PATH = os.path.join(_BASE, "data", "faiss.index")
CHUNKS_PATH = os.path.join(_BASE, "data", "chunks.json")


def build_and_save(chunks: list[str], embeddings: np.ndarray) -> faiss.Index:
    """
    Create a flat L2 FAISS index from the given embeddings, persist it to
    disk alongside the chunk texts, and return the index.
    """
    os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    faiss.write_index(index, FAISS_INDEX_PATH)

    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"[FAISS] Saved index ({index.ntotal} vectors) to {FAISS_INDEX_PATH}")
    return index


def load() -> tuple[faiss.Index, list[str]]:
    """
    Load a previously persisted FAISS index and its chunk list from disk.
    Raises FileNotFoundError if the index has not been built yet.
    """
    if not os.path.exists(FAISS_INDEX_PATH):
        raise FileNotFoundError(
            f"FAISS index not found at {FAISS_INDEX_PATH}. "
            "Run `python rag/indexer.py` first."
        )

    index = faiss.read_index(FAISS_INDEX_PATH)

    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"[FAISS] Loaded index ({index.ntotal} vectors).")
    return index, chunks


def search(
    index: faiss.Index,
    query_vector: np.ndarray,
    k: int = 5,
) -> tuple[list[int], list[float]]:
    """
    Search the FAISS index for the k nearest neighbours of query_vector.
    Returns (list_of_indices, list_of_l2_distances).
    Lower L2 distance  = more similar.
    """
    D, I = index.search(query_vector, k)
    return I[0].tolist(), D[0].tolist()
