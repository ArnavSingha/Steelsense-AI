import os
from typing import List, Dict, Optional
from google import genai
from pydantic import BaseModel
from app.config import settings
from .vector_store import vector_store


# Assumes GEMINI_API_KEY is in environment variables
if os.environ.get("GEMINI_API_KEY") and os.environ.get("GEMINI_API_KEY") != "your_api_key_here":
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
else:
    client = None
GENERATION_MODEL = "gemini-2.5-flash"

class RAGResponse(BaseModel):
    answer: str
    sources: List[Dict]

def synthesize_answer(query: str, retrieved_chunks: List[Dict]) -> str:
    if not retrieved_chunks:
        return "No relevant information found in the knowledge base."

    # Format the retrieved context
    context_str = ""
    for i, chunk in enumerate(retrieved_chunks):
        doc_type = chunk.get("doc_type", "Unknown")
        eq_id = chunk.get("equipment_id", "Unknown")
        text = chunk.get("text", "")
        context_str += f"[Source {i+1} - Type: {doc_type}, Equipment: {eq_id}]\n{text}\n\n"

    prompt = f"""
You are an expert industrial maintenance AI assistant.
Answer the user's query based ONLY on the provided context. If the context does not contain the answer, say so. Do not invent information.

<context>
{context_str}
</context>

Query: {query}

Answer:
"""
    try:
        if os.environ.get("GEMINI_API_KEY") and os.environ.get("GEMINI_API_KEY") != "your_api_key_here":
            response = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
            )
            return response.text
        else:
            return "[MOCK LLM] Based on the context provided, Motor-4 is at risk of lubrication failure. SOP-LUB-001 states a 30-day interval, and WO-2025-1001 shows it was last performed on 2026-04-22. With the current date being ~14 days past due, it is overdue for maintenance."
    except Exception as e:
        print(f"Error during LLM generation: {e}")
        return f"Error synthesizing answer: {str(e)}"

def ask_maintenance_question(query: str, equipment_id: Optional[str] = None, doc_type: Optional[str] = None) -> RAGResponse:
    """
    1. Retrieves relevant chunks via metadata-filtered FAISS search.
    2. Uses LLM to synthesize the answer.
    """
    # Retrieve top 5 chunks
    retrieved = vector_store.retrieve(query=query, equipment_id=equipment_id, doc_type=doc_type, top_k=5)
    
    # Generate answer
    answer = synthesize_answer(query, retrieved)
    
    # Return answer and source citations
    sources = []
    for chunk in retrieved:
        sources.append({
            "id": chunk.get("id"),
            "equipment_id": chunk.get("equipment_id"),
            "doc_type": chunk.get("doc_type"),
            "distance": chunk.get("distance")
        })
        
    return RAGResponse(answer=answer, sources=sources)
