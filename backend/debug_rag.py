import sys
import os

# Add current directory to path
sys.path.append(r"d:\PROJECTS\SaaS-rag-copilot\backend")

import faiss
import pickle
import json
from rag.retriever import retrieve
from rag.selector import select_best
from rag.validator import is_confident

def main():
    base_dir = r"d:\PROJECTS\SaaS-rag-copilot\backend\rag\data"
    faiss_path = os.path.join(base_dir, "faiss.index")
    bm25_path = os.path.join(base_dir, "bm25.pkl")
    chunks_path = os.path.join(base_dir, "chunks.json")

    output_lines = []
    output_lines.append(f"Loading FAISS from {faiss_path}...")
    index = faiss.read_index(faiss_path)

    output_lines.append(f"Loading BM25 from {bm25_path}...")
    with open(bm25_path, "rb") as f:
        bm25 = pickle.load(f)

    output_lines.append(f"Loading Chunks from {chunks_path}...")
    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    query = "hi"
    output_lines.append(f"\n--- Testing Query: '{query}' ---")
    try:
        results = retrieve(query, index, bm25, chunks, top_k=5)
    except Exception as e:
        output_lines.append(f"Error in retrieve: {e}")
        return

    for i, res in enumerate(results):
        output_lines.append(f"\n[{i+1}] Result:")
        output_lines.append(f"  Chunk: {res['chunk'][:100]}...")
        output_lines.append(f"  FAISS L2: {res.get('faiss_dist', 'N/A')}")
        output_lines.append(f"  BM25 Score: {res.get('bm25_score', 'N/A')}")
        output_lines.append(f"  RFF Score: {res.get('score', 'N/A')}")

    best = select_best(results)
    if best:
        output_lines.append(f"\n🎯 Best Match:")
        output_lines.append(f"  Chunk: {best['chunk']}")
        output_lines.append(f"  RFF Score: {best['score']}")
        output_lines.append(f"  FAISS L2: {best.get('faiss_dist', 'N/A')}")
        output_lines.append(f"  Confident? {is_confident(best)}")
    else:
        output_lines.append("\n❌ No best match found.")

    with open("debug_output.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    print("Scores written to debug_output.txt")

if __name__ == "__main__":
    main()
