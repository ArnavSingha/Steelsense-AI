import os
import sys
import time
import json
import sqlite3
import pprint

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.knowledge.graph import knowledge_graph
from app.knowledge.vector_store import vector_store
from app.knowledge.rag import ask_maintenance_question

def run_validations():
    print("=== 1. Knowledge Graph Validation ===")
    t0 = time.time()
    # graph load time (already loaded during import, but we can measure access)
    t_load = time.time() - t0
    
    print(f"Graph load time: {t_load:.4f} seconds (pre-loaded)")
    print(f"Node count: {knowledge_graph.graph.number_of_nodes()}")
    print(f"Edge count: {knowledge_graph.graph.number_of_edges()}")
    
    print("\nFailure propagation output for 'cooling-cs01':")
    impact = knowledge_graph.get_downstream_impact("cooling-cs01")
    print(json.dumps(impact, indent=2))

    print("\n=== 2. Vector Store Validation ===")
    # Assume data is already ingested via ingest_data.py
    # Let's check SQLite
    conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "../backend/data/metadata.db"))
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), COUNT(DISTINCT uuid_str) FROM chunks")
    row = cursor.fetchone()
    chunk_count = row[0] if row else 0
    print(f"Total chunks created (SQLite): {chunk_count}")
    
    if hasattr(vector_store, 'index'):
        print(f"Total chunks in FAISS: {vector_store.index.ntotal}")
    
    print("\nExample chunk metadata stored in SQLite:")
    cursor.execute("SELECT id, equipment_id, doc_type, substr(text, 1, 50) as text_preview FROM chunks LIMIT 2")
    for r in cursor.fetchall():
        print(r)

    print("\n=== 3. Retrieval Validation ===")
    queries = [
        "Motor-4 vibration increasing and temperature rising",
        "Cooling system flow rate drop",
        "SKF 6205-2RS bearing replacement"
    ]
    
    for q in queries:
        print(f"\nQuery: '{q}'")
        t0 = time.time()
        results = vector_store.retrieve(query=q, top_k=2)
        t_ret = time.time() - t0
        print(f"Retrieval latency: {t_ret:.4f}s")
        for i, res in enumerate(results):
            print(f"  [Match {i+1}] eq_id: {res['equipment_id']}, type: {res['doc_type']}, dist: {res['distance']:.2f}")
            print(f"  Preview: {res['text'][:80]}...")

    print("\n=== 4. End-to-End RAG Validation ===")
    q_rag = "Why is Motor-4 at risk of lubrication failure?"
    print(f"Query: '{q_rag}'")
    t0 = time.time()
    resp = ask_maintenance_question(q_rag)
    t_rag = time.time() - t0
    print(f"\nRAG Latency: {t_rag:.4f}s")
    print("Answer:")
    print(resp.answer)
    print("\nSources:")
    for s in resp.sources:
        print(f" - eq: {s['equipment_id']}, type: {s['doc_type']}")

if __name__ == "__main__":
    run_validations()
