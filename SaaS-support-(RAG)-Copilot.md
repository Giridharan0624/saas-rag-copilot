# 🧠 SaaS RAG Copilot — Full Stack Build Guide (FastAPI + Next.js, No LLM, JWT Auth)

---

# 🎯 Overview

This guide provides a **complete, production-ready architecture** to build a **RAG-based SaaS Support Copilot** using:

* **Backend:** FastAPI
* **Frontend:** Next.js
* **Authentication:** JWT (production-grade with access + refresh tokens)
* **LLM:** ❌ None (pure retrieval system)
* **Retrieval:** FAISS + BM25 (Hybrid Search)

---

# 🏗️ System Architecture

```
Next.js Frontend
      ↓
FastAPI (JWT Protected API)
      ↓
RAG Pipeline
      ↓
FAISS + BM25
      ↓
Dataset (FAQs)
```

---

# 📦 MODULE 0 — PROJECT INITIALIZATION

## Backend Setup

Install dependencies:

```
fastapi
uvicorn
python-multipart
pydantic
python-jose[cryptography]
passlib[bcrypt]
sentence-transformers
faiss-cpu
rank-bm25
python-dotenv
```

Create project:

```
backend/
├── main.py
├── auth/
├── rag/
├── core/
```

Run server:

```
uvicorn main:app --reload
```

---

## Frontend Setup

```
npx create-next-app@latest frontend
cd frontend
npm install axios tailwindcss
```

---

## Project Structure

```
project/
├── backend/
│   ├── main.py
│   ├── auth/
│   ├── rag/
├── frontend/
├── data/
```

---

# 🔐 MODULE 1 — JWT AUTHENTICATION (PRODUCTION-GRADE)

## JWT Flow

```
Login → Access Token (short-lived)
      → Refresh Token (long-lived)
```

---

## Core Config (auth/config.py)

```python
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 1

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

---

## Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)
```

---

## Auth Routes (auth/routes.py)

```python
from fastapi import APIRouter, HTTPException
from auth.config import create_access_token, create_refresh_token
from auth.utils import hash_password, verify_password

router = APIRouter()

fake_db = {}

@router.post("/signup")
def signup(username: str, password: str):
    if username in fake_db:
        raise HTTPException(status_code=400, detail="User exists")
    fake_db[username] = hash_password(password)
    return {"message": "User created"}

@router.post("/login")
def login(username: str, password: str):
    if username not in fake_db or not verify_password(password, fake_db[username]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token({"sub": username})
    refresh = create_refresh_token({"sub": username})

    return {"access_token": access, "refresh_token": refresh}
```

---

## JWT Dependency (Protected Routes)

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt

security = HTTPBearer()

def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Frontend Token Usage

```javascript
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

---

# 📊 MODULE 2 — DATASET CREATION

## Requirements

* 50 FAQ entries

## Format

```json
[
  {
    "question": "How do I reset my password?",
    "answer": "Go to settings and click reset password."
  }
]
```

---

# 🔍 MODULE 3 — EMBEDDINGS & FAISS

## Steps

1. Convert data into chunks:

```
Q: question
A: answer
```

2. Generate embeddings:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunks)
```

3. Store in FAISS:

```python
import faiss
import numpy as np

index = faiss.IndexFlatL2(len(embeddings[0]))
index.add(np.array(embeddings))
```

---

# 🔎 MODULE 4 — BM25 RETRIEVAL

```python
from rank_bm25 import BM25Okapi

tokenized = [doc.split() for doc in chunks]
bm25 = BM25Okapi(tokenized)
```

---

# ⚡ MODULE 5 — HYBRID RETRIEVAL

```python
def hybrid_search(query):
    query_vec = model.encode([query])
    D, I = index.search(query_vec, k=5)

    scores = bm25.get_scores(query.split())
    top_bm25 = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:5]

    combined = list(set(I[0]) | set(top_bm25))
    return [(chunks[i], float(D[0][0])) for i in combined]
```

---

# 🧠 MODULE 6 — ANSWER SELECTION (NO LLM)

```python
def select_answer(results):
    best = sorted(results, key=lambda x: x[1])[0]
    return best
```

---

# 🛡️ MODULE 7 — HALLUCINATION CONTROL

```python
def is_valid(score, threshold=0.6):
    return score >= threshold
```

Fallback:

```
"I don't have enough information. Please rephrase your query."
```

---

# 🔄 MODULE 8 — RAG PIPELINE

```python
def rag_pipeline(query):
    results = hybrid_search(query)

    if not results:
        return {"answer": "No results", "sources": [], "confidence": 0}

    best_text, score = select_answer(results)

    if not is_valid(score):
        return {"answer": "Low confidence", "sources": [], "confidence": 0}

    return {
        "answer": best_text,
        "sources": [{"text": r[0], "score": r[1]} for r in results],
        "confidence": score
    }
```

---

# 🌐 MODULE 9 — FASTAPI API

```python
from fastapi import FastAPI, Depends
from auth.dependencies import get_current_user

app = FastAPI()

@app.post("/api/query/")
def query_api(query: str, user=Depends(get_current_user)):
    return rag_pipeline(query)
```

---

# 🎨 MODULE 10 — NEXT.JS FRONTEND

## Features

* Login / Signup
* Chat UI
* Display:

  * Answer
  * Scores

---

## Example API Call

```javascript
const res = await axios.post("/api/query/", { query });
```

---

# 🔗 MODULE 11 — INTEGRATION

* Attach JWT token
* Handle loading & errors
* Render results

---

# 📊 MODULE 12 — EXPLAINABILITY

Show:

* Retrieved chunks
* Similarity scores
* Confidence score

---

# 🚀 MODULE 13 — DEPLOYMENT

## Backend

* Hugging Face Spaces (FastAPI)

## Frontend

* Netlify

---

# 🧪 MODULE 14 — TESTING

## Test Cases

* Valid query → correct result
* Unknown query → fallback
* Unauthorized → blocked
* Token validation works

---

# 🏁 FINAL CHECKLIST

* ✅ JWT authentication working
* ✅ FAISS implemented
* ✅ BM25 implemented
* ✅ Hybrid retrieval working
* ✅ No LLM used
* ✅ API secured
* ✅ UI complete
* ✅ Deployment done

---