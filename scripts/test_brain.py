import sys
import os

# Fix windows terminal unicode printing
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.brain.graph import maintenance_brain_app

def run_tests():
    queries = [
        "Why is cooling-cs01 vibrating?",
        "What happens if motor-4 fails?",
        "How much does a new seal for press-hp02 cost?",
        "Hello, what can you do?"
    ]
    
    for q in queries:
        print(f"\n--- Query: '{q}' ---")
        # Run through LangGraph with checkpointer config
        result = maintenance_brain_app.invoke(
            {"query": q}, 
            config={"configurable": {"thread_id": "test_thread"}}
        )
        print(f"Routed Intent: {result.get('intent')}")
        print(f"Extracted Equipment ID: {result.get('equipment_id')}")
        print(f"Response: {result.get('response')}")

if __name__ == "__main__":
    run_tests()
