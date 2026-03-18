"""
Module 8 — RAG Pipeline
Orchestrates the full query flow:
  query → embed → hybrid retrieve → select best → validate confidence → respond
"""

from __future__ import annotations

import faiss
from rank_bm25 import BM25Okapi

from rag.retriever import retrieve
from rag.selector import select_best
from rag.validator import is_confident, FALLBACK_MESSAGE


def rag_pipeline(
    query: str,
    index: faiss.Index,
    bm25: BM25Okapi,
    chunks: list[str],
    top_k: int = 5,
) -> dict:
    """
    Run the full RAG pipeline and return a structured response:

    {
        "answer":     str,          # the best-matching FAQ answer (or fallback)
        "confidence": float,        # the RRF score of the best result
        "sources":    list[dict],   # all retrieved chunks with scores
        "fallback":   bool,         # True when no confident answer was found
    }
    """
    results = retrieve(query, index, bm25, chunks, top_k=top_k)
    best = select_best(results)

    if best is None:
        return {
            "answer": FALLBACK_MESSAGE,
            "confidence": 0.0,
            "sources": [],
            "fallback": True,
        }

    if not is_confident(best):
        return {
            "answer": FALLBACK_MESSAGE,
            "confidence": best.get("score", 0.0),
            "sources": results,
            "fallback": True,
        }

    answer_text = best["chunk"]
    if "\nA: " in answer_text:
        answer_text = answer_text.split("\nA: ", 1)[1]

    return {
        "answer": answer_text,
        "confidence": best["score"],
        "sources": results,
        "fallback": False,
    }
