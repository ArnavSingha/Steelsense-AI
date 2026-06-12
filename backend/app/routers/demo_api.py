import os
import json
import random
import pandas as pd
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.ml.anomaly_detection import anomaly_detector
from app.ml.rul_estimation import rul_estimator

router = APIRouter(prefix="", tags=["Demo API"])

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
LOGBOOK_PATH = os.path.join(DATA_DIR, "logbook.json")
FEEDBACK_PATH = os.path.join(DATA_DIR, "feedback.json")
SENSORS_DIR = os.path.join(DATA_DIR, "sensor_data")

class FeedbackPostRequest(BaseModel):
    equipment_id: str
    recommendation: str
    feedback: str
    reason: Optional[str] = ""

class MLPredictRequest(BaseModel):
    equipment_id: str
    readings: Dict[str, float]

class CopilotQueryRequest(BaseModel):
    query: str
    history: List[Dict[str, str]]
    thread_id: str

@router.get("/logbook")
async def get_logbook():
    if os.path.exists(LOGBOOK_PATH):
        try:
            with open(LOGBOOK_PATH, "r") as f:
                data = json.load(f)
                return {"logbook": data}
        except Exception:
            pass
    return {"logbook": []}

@router.get("/feedback")
async def get_feedback():
    if os.path.exists(FEEDBACK_PATH):
        try:
            with open(FEEDBACK_PATH, "r") as f:
                data = json.load(f)
                return {"feedback": data}
        except Exception:
            pass
    return {"feedback": []}

@router.post("/feedback")
async def post_feedback(req: FeedbackPostRequest):
    # Load feedback
    feedbacks = []
    if os.path.exists(FEEDBACK_PATH):
        try:
            with open(FEEDBACK_PATH, "r") as f:
                feedbacks = json.load(f)
        except Exception:
            pass
            
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_fb = {
        "timestamp": timestamp,
        "equipment_id": req.equipment_id,
        "recommendation": req.recommendation,
        "feedback": req.feedback,
        "reason": req.reason
    }
    feedbacks.append(new_fb)
    
    # Save feedback
    with open(FEEDBACK_PATH, "w") as f:
        json.dump(feedbacks, f, indent=2)
        
    # Append to logbook
    logs = []
    if os.path.exists(LOGBOOK_PATH):
        try:
            with open(LOGBOOK_PATH, "r") as f:
                logs = json.load(f)
        except Exception:
            pass
            
    time_str = datetime.now().strftime("%H:%M")
    new_log = {
        "time": time_str,
        "asset": req.equipment_id,
        "action": f"Feedback: {req.feedback.capitalize()}",
        "status": "Completed"
    }
    logs.insert(0, new_log) # Prepend to show most recent log first
    
    # Save logbook
    with open(LOGBOOK_PATH, "w") as f:
        json.dump(logs, f, indent=2)
        
    return {"status": "success", "message": "Feedback recorded and logbook updated."}

@router.get("/sensors/{equipment_id}")
async def get_sensors(equipment_id: str):
    csv_path = os.path.join(SENSORS_DIR, f"{equipment_id.lower()}.csv")
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            df = df.fillna(0.0)
            
            # trend is the last 30 rows
            trend_df = df.tail(30)
            trend = trend_df.to_dict(orient="records")
            latest = df.iloc[-1].to_dict()
            return {"latest": latest, "trend": trend}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading CSV data: {str(e)}")
            
    # Mock fallback if CSV does not exist
    mock_trend = []
    for i in range(30):
        mock_trend.append({
            "timestamp": f"2026-06-{i+1:02d}",
            "vibration_mm_s": round(1.5 + random.uniform(0.1, 0.4), 2),
            "temperature_c": round(45.0 + random.uniform(1.0, 3.0), 2),
            "anomaly_flag": 0
        })
    return {"latest": mock_trend[-1], "trend": mock_trend}

@router.post("/ml/predict")
async def ml_predict(req: MLPredictRequest):
    try:
        anomaly_res = anomaly_detector.predict(req.equipment_id, req.readings)
        rul_res = rul_estimator.predict(req.equipment_id, req.readings)
        return {
            "is_anomaly": anomaly_res.get("is_anomaly", False),
            "anomaly_score": anomaly_res.get("anomaly_score", 0.0),
            "rul_days": rul_res.get("rul_days", -1),
            "rul_confidence": rul_res.get("confidence", "MEDIUM")
        }
    except Exception as e:
        # Fallback prediction if ML fails
        return {
            "is_anomaly": req.equipment_id.upper() in ["MOTOR-4", "COOLING-CS01"],
            "anomaly_score": -0.15 if req.equipment_id.upper() in ["MOTOR-4", "COOLING-CS01"] else 0.05,
            "rul_days": 2 if req.equipment_id.upper() in ["MOTOR-4", "COOLING-CS01"] else 25,
            "rul_confidence": "HIGH"
        }

@router.get("/knowledge-graph/impact/{asset}")
async def get_knowledge_graph_impact(asset: str):
    asset_upper = asset.upper()
    impacts = {
        "COOLING-CS01": {
            "root_node": "COOLING-CS01",
            "affected_count": 3,
            "total_downtime_cost_per_hr": 3300000,
            "affected_assets": [
                { "id": "COOLING-CS01", "name": "Cooling Water Pump System", "criticality": "CRITICAL", "downtime_cost_per_hr": 2300000 },
                { "id": "MOTOR-4", "name": "Rolling Mill Main Motor", "criticality": "HIGH", "downtime_cost_per_hr": 500000 },
                { "id": "GEARBOX-GB02", "name": "Rolling Mill Gearbox", "criticality": "HIGH", "downtime_cost_per_hr": 500000 }
            ]
        },
        "MOTOR-4": {
            "root_node": "MOTOR-4",
            "affected_count": 2,
            "total_downtime_cost_per_hr": 1000000,
            "affected_assets": [
                { "id": "MOTOR-4", "name": "Rolling Mill Main Motor", "criticality": "HIGH", "downtime_cost_per_hr": 500000 },
                { "id": "GEARBOX-GB02", "name": "Rolling Mill Gearbox", "criticality": "HIGH", "downtime_cost_per_hr": 500000 }
            ]
        },
        "GEARBOX-GB02": {
            "root_node": "GEARBOX-GB02",
            "affected_count": 1,
            "total_downtime_cost_per_hr": 500000,
            "affected_assets": [
                { "id": "GEARBOX-GB02", "name": "Rolling Mill Gearbox", "criticality": "HIGH", "downtime_cost_per_hr": 500000 }
            ]
        },
        "PRESS-HP02": {
            "root_node": "PRESS-HP02",
            "affected_count": 2,
            "total_downtime_cost_per_hr": 600000,
            "affected_assets": [
                { "id": "PRESS-HP02", "name": "Hydraulic Squeeze Press", "criticality": "MEDIUM", "downtime_cost_per_hr": 400000 },
                { "id": "CONVEYOR-C01", "name": "Output Slag Conveyor", "criticality": "LOW", "downtime_cost_per_hr": 200000 }
            ]
        },
        "CONVEYOR-C01": {
            "root_node": "CONVEYOR-C01",
            "affected_count": 1,
            "total_downtime_cost_per_hr": 200000,
            "affected_assets": [
                { "id": "CONVEYOR-C01", "name": "Output Slag Conveyor", "criticality": "LOW", "downtime_cost_per_hr": 200000 }
            ]
        }
    }
    return impacts.get(asset_upper, {
        "root_node": asset_upper,
        "affected_count": 1,
        "total_downtime_cost_per_hr": 0,
        "affected_assets": []
    })

@router.get("/analytics/risk-summary")
async def get_risk_summary():
    return {
        "critical_count": 1,
        "high_count": 2,
        "medium_count": 1,
        "low_count": 1,
        "total_cost_at_risk": 5400000
    }

@router.post("/copilot/stream")
async def copilot_stream(req: CopilotQueryRequest):
    def event_stream():
        yield "data: " + json.dumps({"step": "Analyzing plant sensor signals..."}) + "\n\n"
        import time
        time.sleep(0.3)
        yield "data: " + json.dumps({"step": "Correlating with historical failure logs..."}) + "\n\n"
        time.sleep(0.3)
        yield "data: " + json.dumps({"step": "Formulating predictive mitigation strategy..."}) + "\n\n"
        time.sleep(0.3)
        
        query_lower = req.query.lower()
        if "motor" in query_lower:
            response = "Based on current sensor readings, MOTOR-4 is displaying high vibration (6.85 mm/s) which is correlated with a coolant flow reduction in COOLING-CS01. I recommend inspecting the MOTOR-4 bearing and checking COOLING-CS01 flow valves immediately."
            intent = "inspect_motor"
            risk_level = "HIGH"
            equipment_id = "MOTOR-4"
        elif "cooling" in query_lower:
            response = "COOLING-CS01 fluid pressure is at 1.8 Bar, which is well below the threshold. This is propagating a thermal load warning to MOTOR-4. Recommend flushing the lines and replacing the filter element (SKU-4412)."
            intent = "inspect_cooling"
            risk_level = "CRITICAL"
            equipment_id = "COOLING-CS01"
        else:
            response = "I've analyzed all active systems. COOLING-CS01 and MOTOR-4 require immediate attention due to low fluid pressure and elevated vibration. Other systems like PRESS-HP02 and CONVEYOR-C01 are operating within nominal parameters."
            intent = "general_audit"
            risk_level = "MEDIUM"
            equipment_id = "MOTOR-4"
            
        final_payload = {
            "is_final": True,
            "response": response,
            "intent": intent,
            "risk_level": risk_level,
            "equipment_id": equipment_id,
            "confidence": "HIGH"
        }
        yield "data: " + json.dumps(final_payload) + "\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
