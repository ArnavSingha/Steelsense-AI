import os
import sys

# Append path so we can import our backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.knowledge.rag import ask_maintenance_question

def test_retrieval():
    print("=== Real Gemini Retrieval Pipeline Verification ===")
    
    # We will test the FAISS + SQLite pipeline. 
    # If GEMINI_API_KEY is not valid, it uses deterministic mock embeddings mapped exactly to FAISS.
    
    query = "Why is Motor-4 at risk of lubrication failure?"
    print(f"\nQuery: {query}\n")
    
    response = ask_maintenance_question(query=query, equipment_id="motor-4")
    
    print("Expected retrieval sources:")
    print("- SOP-LUB-001")
    print("- WO-2025-1001")
    print("- Motor-4 Manual")
    
    print("\nActual Retrieved Chunks:")
    for i, source in enumerate(response.sources):
        print(f"[{i+1}] ID: {source['id']} | Type: {source['doc_type']} | Equip: {source['equipment_id']} | FAISS Dist: {source['distance']:.4f}")
        
    print(f"\nAnswer:\n{response.answer}")

if __name__ == "__main__":
    test_retrieval()
