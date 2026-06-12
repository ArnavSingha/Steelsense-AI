import os
import sys
import json
import pandas as pd
from fastapi.testclient import TestClient

# Fix windows terminal unicode printing
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.main import app

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/data/sensor_data"))

def run_integration_tests():
    print("=== Day 8 End-to-End Integration Validation ===\n")
    
    client = TestClient(app)
    
    # 1. Cooling-cs01 Cascade Scenario (Copilot API)
    print("1. Cooling-cs01 Cascade Scenario (Copilot API via /api/copilot/stream)")
    payload_query = {
        "query": "Pressure Drop + Fluid Contamination in cooling-cs01. What is the risk and impact?",
        "history": [],
        "thread_id": "test_thread"
    }
    print(f"Request: POST /api/copilot/stream -> {json.dumps(payload_query)}")
    
    response = client.post("/api/copilot/stream", json=payload_query)
    
    print(f"Status: {response.status_code} OK")
    print("Streaming Response Steps:")
    
    # Parse SSE stream
    final_payload = {}
    for line in response.text.split("\n"):
        if line.startswith("data: "):
            data_str = line[6:]
            try:
                data_json = json.loads(data_str)
                if data_json.get("is_final"):
                    final_payload = data_json
                else:
                    print(f"  Step: {data_json.get('step')}")
            except Exception:
                pass
                
    print("Full API Response Payload:")
    print(json.dumps(final_payload, indent=2))
    print("\n" + "="*60 + "\n")
    
    # 2. Motor-4 Predictive Maintenance Scenario (ML API)
    print("2. Motor-4 Predictive Maintenance Scenario (ML Endpoint)")
    
    # Grab the anomalous row from motor-4.csv
    file_path = os.path.join(DATA_DIR, "motor-4.csv")
    df = pd.read_csv(file_path)
    # Convert dataframe row types to standard python types for JSON serialization, excluding non-numeric keys
    anomalous_row = {k: float(v) for k, v in df.iloc[-1].to_dict().items() if k != "timestamp"}
    
    payload_ml = {
        "equipment_id": "motor-4",
        "readings": anomalous_row
    }
    print("Request: POST /api/ml/predict -> Simulating incoming sensor stream")
    
    response_ml = client.post("/api/ml/predict", json=payload_ml)
    
    print(f"Status: {response_ml.status_code} OK")
    print("Full API Response Payload:")
    print(json.dumps(response_ml.json(), indent=2))

if __name__ == "__main__":
    run_integration_tests()

