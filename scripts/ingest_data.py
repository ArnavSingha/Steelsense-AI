import os
import glob
from dotenv import load_dotenv

# Load environment variables (must have GEMINI_API_KEY)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../backend/.env"))

# We need to import the vector store.
# Adjusting python path to import from backend
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.knowledge.vector_store import vector_store

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/data"))

def ingest_directory(sub_dir: str, doc_type: str):
    dir_path = os.path.join(DATA_DIR, sub_dir)
    files = glob.glob(os.path.join(dir_path, "*.md"))
    
    for filepath in files:
        filename = os.path.basename(filepath)
        # Try to infer equipment_id from filename or content
        equipment_id = "general"
        
        # Simple heuristic for equipment_id based on known IDs
        eq_ids = ["motor-4", "gearbox-gb02", "conveyor-c01", "press-hp02", "cooling-cs01"]
        lower_name = filename.lower()
        for eq in eq_ids:
            if eq in lower_name:
                equipment_id = eq
                break
        
        with open(filepath, 'r') as f:
            text = f.read()
            
        print(f"Ingesting [{doc_type}] {filename} -> eq_id: {equipment_id}")
        vector_store.add_document(text=text, equipment_id=equipment_id, doc_type=doc_type)

if __name__ == "__main__":
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_api_key_here":
        print("WARNING: GEMINI_API_KEY not set. Using deterministic MOCK embeddings for local testing.")
        
    print("Starting data ingestion into FAISS + SQLite...")
    
    ingest_directory("manuals", "manual")
    ingest_directory("sops", "sop")
    ingest_directory("failure_reports", "failure_report")
    ingest_directory("maintenance_logs", "maintenance_log")
    
    print(f"Total FAISS index size: {vector_store.index.ntotal} chunks.")
    print("Ingestion complete.")
