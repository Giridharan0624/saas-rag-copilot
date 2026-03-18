from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.config import settings
from auth.routes import router as auth_router
from auth.dependencies import get_current_user
from rag import faiss_store, bm25_store
from rag.pipeline import rag_pipeline

# ── Shared index state loaded once at startup ──────────────────────────────
_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load FAISS and BM25 indexes into memory when the server starts."""
    try:
        index, chunks = faiss_store.load()
        bm25 = bm25_store.load()
        _state["index"] = index
        _state["bm25"] = bm25
        _state["chunks"] = chunks
        print("[Startup] RAG indexes loaded successfully.")
    except FileNotFoundError as e:
        print(f"[Startup] WARNING: {e}")
        print("[Startup] Run `python rag/indexer.py` to build the indexes.")
        _state["index"] = None
        _state["bm25"] = None
        _state["chunks"] = []
    yield
    # Cleanup on shutdown (nothing to do for in-memory structures)
    _state.clear()


# ── App Instance ───────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="RAG-based SaaS Support Copilot API — No LLM, pure retrieval",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth_router)


# ── Request / Response Schemas ─────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str


class SourceItem(BaseModel):
    chunk: str
    score: float
    faiss_dist: float
    bm25_score: float


class QueryResponse(BaseModel):
    answer: str
    confidence: float
    sources: list[SourceItem]
    fallback: bool


# ── Module 9 — Query Endpoint (JWT protected) ──────────────────────────────
@app.post(
    "/api/query/",
    response_model=QueryResponse,
    tags=["RAG"],
    summary="Submit a support query and get the best matching answer",
)
def query_endpoint(
    body: QueryRequest,
    current_user: str = Depends(get_current_user),
):
    if _state.get("index") is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG index not loaded. Run `python rag/indexer.py` first.",
        )

    result = rag_pipeline(
        query=body.query,
        index=_state["index"],
        bm25=_state["bm25"],
        chunks=_state["chunks"],
    )
    return result


# ── Health Check ───────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    index_ready = _state.get("index") is not None
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "index_loaded": index_ready,
    }

