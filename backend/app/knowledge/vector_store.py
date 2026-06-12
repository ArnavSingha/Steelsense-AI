import os
import sqlite3
import faiss
import numpy as np
import uuid
from typing import List, Dict, Optional
from google import genai
from app.config import settings


# Setup paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend"))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "metadata.db")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss.index")

# Initialize Gemini Client if key exists
if os.environ.get("GEMINI_API_KEY") and os.environ.get("GEMINI_API_KEY") != "your_api_key_here":
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
else:
    client = None

EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIM = 3072

class VectorStore:
    def __init__(self):
        self._init_sqlite()
        self._init_faiss()

    def _init_sqlite(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid_str TEXT UNIQUE,
                equipment_id TEXT,
                doc_type TEXT,
                text TEXT
            )
        ''')
        self.conn.commit()

    def _init_faiss(self):
        if os.path.exists(FAISS_INDEX_PATH):
            self.index = faiss.read_index(FAISS_INDEX_PATH)
        else:
            # We use an IDMap to map FAISS internal IDs to our SQLite integer IDs
            self.index = faiss.IndexIDMap(faiss.IndexFlatL2(EMBEDDING_DIM))

    def _get_embedding(self, text: str) -> np.ndarray:
        if os.environ.get("GEMINI_API_KEY") and os.environ.get("GEMINI_API_KEY") != "your_api_key_here":
            import time
            for attempt in range(3):
                try:
                    response = client.models.embed_content(
                        model=EMBEDDING_MODEL,
                        contents=text
                    )
                    return np.array(response.embeddings[0].values, dtype='float32')
                except Exception as e:
                    err_msg = str(e)
                    if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
                        sleep_time = (attempt + 1) * 5
                        print(f"Rate limit (429) hit. Sleeping {sleep_time}s before retry (Attempt {attempt+1}/3)...")
                        time.sleep(sleep_time)
                    else:
                        print(f"Embedding failed: {e}")
                        break
            print("Warning: Gemini embedding failed after retries. Falling back to deterministic mock embedding.")
        
        # Deterministic mock embedding based on text hash for local testing
        import hashlib
        h = hashlib.sha256(text.encode()).digest()
        np.random.seed(int.from_bytes(h[:4], 'little'))
        return np.random.rand(EMBEDDING_DIM).astype('float32')

    def add_document(self, text: str, equipment_id: str, doc_type: str):
        """Chunks, embeds, and adds a document to both SQLite and FAISS."""
        # Simple chunking (for demo: split by paragraphs or double newlines)
        chunks = [c.strip() for c in text.split('\n\n') if len(c.strip()) > 50]
        
        for chunk_text in chunks:
            # 1. Insert into SQLite to get an ID
            uuid_str = str(uuid.uuid4())
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO chunks (uuid_str, equipment_id, doc_type, text)
                VALUES (?, ?, ?, ?)
            ''', (uuid_str, equipment_id, doc_type, chunk_text))
            self.conn.commit()
            
            chunk_id = cursor.lastrowid
            
            # 2. Get Embedding and Add to FAISS
            emb = self._get_embedding(chunk_text)
            # FAISS expects 2D array and numpy int64 for IDs
            self.index.add_with_ids(
                np.array([emb]), 
                np.array([chunk_id], dtype=np.int64)
            )

        # Save index after adding
        faiss.write_index(self.index, FAISS_INDEX_PATH)

    def retrieve(self, query: str, equipment_id: Optional[str] = None, doc_type: Optional[str] = None, top_k: int = 5) -> List[Dict]:
        """
        Retrieves top_k chunks. 
        Pre-filters using SQLite if metadata is provided, then searches FAISS.
        """
        # 1. Pre-filter in SQLite
        query_sql = "SELECT id, equipment_id, doc_type, text FROM chunks WHERE 1=1"
        params = []
        if equipment_id:
            query_sql += " AND equipment_id = ?"
            params.append(equipment_id)
        if doc_type:
            query_sql += " AND doc_type = ?"
            params.append(doc_type)

        cursor = self.conn.cursor()
        cursor.execute(query_sql, params)
        candidate_rows = cursor.fetchall()
        
        if not candidate_rows:
            return []

        # Create a mapping of id -> row data for the candidates
        candidate_map = {row[0]: {"id": row[0], "equipment_id": row[1], "doc_type": row[2], "text": row[3]} for row in candidate_rows}
        valid_ids = list(candidate_map.keys())

        # 2. Embed the query
        query_emb = self._get_embedding(query)

        # 3. Search in FAISS
        # To filter in FAISS, we use a custom IDSelector
        id_selector = faiss.IDSelectorBatch(valid_ids)
        
        # Search params with selector
        search_params = faiss.SearchParametersIVF(sel=id_selector) if hasattr(faiss, 'SearchParametersIVF') else None
        
        # If IDSelector is tricky with FlatL2 in standard faiss, an alternative is to search more and filter post-search,
        # but for hackathon scale (few hundred chunks), retrieving top K from all and filtering, OR calculating distances manually on valid_ids is fine.
        # Let's do a post-filter approach which is safe and easy for a prototype.
        
        # We will retrieve top K * 10 to ensure we find valid matches
        distances, indices = self.index.search(np.array([query_emb]), min(top_k * 10, self.index.ntotal))
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx in candidate_map:
                res = candidate_map[idx]
                res["distance"] = float(dist)
                results.append(res)
            if len(results) >= top_k:
                break
                
        return results

# Singleton
vector_store = VectorStore()
