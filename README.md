# SaaS Support RAG Copilot

A robust AI-powered Support Copilot that uses **Retrieval-Augmented Generation (RAG)** architecture with a pure retrieval approach (no hallucinations). Built with a modern **Next.js** frontend and a highly efficient **FastAPI** backend featuring hybrid semantic search.

![App Screenshot](./frontend/public/screenshot.png) *(Illustrative)*

## Features

- **Pure Retrieval Engine**: Relies entirely on verified internal knowledge (FAQs)—eliminating generative AI hallucinations.
- **Hybrid Search Architecture**: Combines **FAISS** (semantic similarity) and **BM25** (keyword matching) using **Reciprocal Rank Fusion (RRF)** for optimal document retrieval.
- **Explainability**: A dedicated right sidebar provides users with the exact sources extracted and confidence scores, providing transparency to the support responses.
- **Modern UI/UX**: Built with Next.js App Router, Tailwind CSS, providing a glassmorphism dark-mode aesthetic with framer-motion micro-animations.
- **Robust Authentication**: Fully integrated JWT authentication flow (Access & Refresh tokens) with protected routes.
- **Independent Scrolling**: Thoughtfully designed chat and questions sections that scroll independently to keep the user experience seamless.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, clsx, tailwind-merge
- **UI & Animations**: Framer Motion, Lucide React icons
- **State & Data**: React Context API, Axios (with interceptors)
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI, Uvicorn
- **AI/ML**: `sentence-transformers` (all-MiniLM-L6-v2), `faiss-cpu`, `rank-bm25`
- **Security & Auth**: `python-jose` (JWT), `passlib` (Bcrypt password hashing)
- **Architecture**: In-memory vector index loaded via Lifespan context managers.

## Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **Python** (v3.9+) installed on your machine.

### 1. Starting the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the data ingestion script to build the FAISS and BM25 indexes:
   ```bash
   python scripts/ingest_data.py
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be available at http://localhost:8000. You can view the API documentation at http://localhost:8000/docs.*

### 2. Starting the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the frontend root and add your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at http://localhost:3000.*

## Project Structure

```
SaaS-rag-copilot/
├── backend/
│   ├── auth/              # JWT Auth routes and security
│   ├── core/              # Configs and global settings
│   ├── rag/               # Retrieval pipeline (FAISS, BM25, RRF)
│   ├── scripts/           # Ingestion and indexing scripts
│   ├── main.py            # FastAPI entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router (Layout, Pages)
│   │   ├── context/       # React Context (AuthContext)
│   │   └── lib/           # Utility functions, Axios instances, FAQ dataset
│   ├── tailwind.config.ts
│   └── package.json
└── data/                  # Source knowledge base (faqs.json)
```

## How It Works

1. **Query**: The user types a support question in the chat UI.
2. **Hybrid Search**: The backend instantly searches the `FAISS` semantic index and the `BM25` keyword index.
3. **Fusion**: Results are combined and ranked using `Reciprocal Rank Fusion` to ensure accuracy.
4. **Validation**: If the confidence score drops below a certain threshold, the system triggers a "Low confidence fallback" message to prevent spreading incorrect information.
5. **Transparency**: The frontend immediately displays the answer and reveals the retrieved source documents and calculated scores in the explainability sidebar.

## License
MIT License
