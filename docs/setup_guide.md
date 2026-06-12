# Setup Guide

## Prerequisites
* Python 3.11+
* Node.js 20+
* `GEMINI_API_KEY` (Required for LLM synthesis)

---

## 1. Backend Setup (FastAPI + ML + LangGraph)

Navigate to the root directory and create a virtual environment:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

Install requirements:
```bash
pip install -r backend/requirements.txt
# (Hackathon Note: we used specific packages during generation, e.g. fastapi, uvicorn, langchain, langgraph, faiss-cpu, scikit-learn, networkx, pandas)
```

Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY="your-api-key-here"
```

Start the FastAPI server:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

---

## 2. Frontend Setup (Next.js + Tailwind v4)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The War Room UI will be available at `http://localhost:3000` (or `3001` if port is in use).

---

## 3. Demo Data Reset & FAISS Rebuild
If you have modified the datasets during testing, or need to rebuild the FAISS vector store from scratch on a new machine:

```bash
# 1. Reset vector stores and inventory
python scripts/reset_demo.py

# 2. Re-ingest documents into FAISS and SQLite
python scripts/ingest_data.py
```
