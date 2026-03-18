"""
Indexer Script — Run this once (and whenever faqs.json changes) to build
and persist the FAISS and BM25 indexes used by the RAG pipeline.

Usage (from the backend/ directory):
    python rag/indexer.py
"""

import json
import os
import sys

# Ensure backend/ is on the path so imports work when run directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from rag import embedder, faiss_store, bm25_store

DATA_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "faqs.json"
)


def load_faqs(path: str) -> list[str]:
    """Load FAQs from JSON and convert each entry to a single chunk string."""
    with open(path, "r", encoding="utf-8") as f:
        faqs = json.load(f)

    chunks = [
        f"Q: {item['question']}\nA: {item['answer']}" for item in faqs
    ]
    print(f"[Indexer] Loaded {len(chunks)} FAQ chunks from {path}")
    return chunks


def main():
    # Resolve the data file path
    data_path = os.path.abspath(DATA_FILE)
    if not os.path.exists(data_path):
        print(f"[Indexer] ERROR: FAQ file not found at {data_path}")
        sys.exit(1)

    # Step 1 — Load FAQ chunks
    chunks = load_faqs(data_path)

    # Step 2 — Generate embeddings (Module 3)
    print("[Indexer] Generating embeddings …")
    embeddings = embedder.embed(chunks)
    print(f"[Indexer] Embeddings shape: {embeddings.shape}")

    # Step 3 — Build & save FAISS index (Module 3)
    faiss_store.build_and_save(chunks, embeddings)

    # Step 4 — Build & save BM25 index (Module 4)
    bm25_store.build_and_save(chunks)

    print("\n✅ Indexing complete. Indexes saved to backend/rag/data/")


if __name__ == "__main__":
    main()
