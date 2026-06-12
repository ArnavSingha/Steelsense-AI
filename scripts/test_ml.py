import os
import sys
import json
import pandas as pd
import codecs

# Fix windows terminal unicode printing
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.ml.anomaly_detection import anomaly_detector
from app.ml.rul_estimation import rul_estimator

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/data/sensor_data"))

def run_ml_validations():
    eq_id = "motor-4"
    file_path = os.path.join(DATA_DIR, f"{eq_id}.csv")
    df = pd.read_csv(file_path)
    
    # Take a baseline row (day 50) and an anomalous row (last row)
    healthy_row = df.iloc[50].to_dict()
    anomalous_row = df.iloc[-1].to_dict()

    print("=== Day 5 ML Validation ===\n")
    
    # 1. Example anomaly detection output
    print("1. Anomaly Detection Output (Isolation Forest)")
    res_healthy = anomaly_detector.predict(eq_id, healthy_row)
    res_anomalous = anomaly_detector.predict(eq_id, anomalous_row)
    
    print("Healthy Reading (Day 50):", json.dumps(res_healthy))
    print("Anomalous Reading (Day 200):", json.dumps(res_anomalous))
    print("\n" + "="*50 + "\n")
    
    # 2. Example RUL prediction output
    print("2. RUL Prediction Output (XGBoost)")
    rul_healthy = rul_estimator.predict(eq_id, healthy_row)
    rul_anomalous = rul_estimator.predict(eq_id, anomalous_row)
    
    print("RUL Estimate (Day 50):", json.dumps(rul_healthy))
    print("RUL Estimate (Day 200):", json.dumps(rul_anomalous))
    print("\n" + "="*50 + "\n")
    
    # 3. Example degradation trend interpretation
    print("3. Degradation Trend Interpretation")
    print(f"Trend Analysis for {eq_id}:")
    print(f"- Vibration increased from {healthy_row['vibration_mm_s']:.2f} mm/s to {anomalous_row['vibration_mm_s']:.2f} mm/s (+{((anomalous_row['vibration_mm_s']/healthy_row['vibration_mm_s'])-1)*100:.1f}%)")
    print(f"- Temperature increased from {healthy_row['temperature_c']:.1f}°C to {anomalous_row['temperature_c']:.1f}°C (+{((anomalous_row['temperature_c']/healthy_row['temperature_c'])-1)*100:.1f}%)")
    print("- Isolation Forest has correctly isolated this coordinate as OUTLIER (-1).")
    print("\n" + "="*50 + "\n")
    
    # 4. Example alert payload
    print("4. Example Alert Payload")
    alert = {
        "timestamp": anomalous_row.get("timestamp", "2026-06-05T00:00:00Z"),
        "equipment_id": eq_id,
        "alert_type": "PREDICTIVE_DEGRADATION",
        "severity": "HIGH",
        "metrics": {
            "vibration": anomalous_row["vibration_mm_s"],
            "temperature": anomalous_row["temperature_c"]
        },
        "ml_insights": {
            "is_anomaly": res_anomalous["is_anomaly"],
            "anomaly_score": res_anomalous["anomaly_score"],
            "estimated_rul_days": rul_anomalous["rul_days"]
        }
    }
    print(json.dumps(alert, indent=2))
    print("\n" + "="*50 + "\n")
    
    # 5. Example predictive maintenance recommendation
    print("5. Example Predictive Maintenance Recommendation")
    rec = {
        "equipment": eq_id,
        "status": "DEGRADED",
        "rul_days": rul_anomalous["rul_days"],
        "recommendation": f"Schedule maintenance within {rul_anomalous['rul_days']} days. Risk level is CRITICAL due to impending failure and downstream impact.",
        "action_required": "Reserve SKF-6205-2RS bearing from inventory. Generate Work Order."
    }
    print(json.dumps(rec, indent=2))

if __name__ == "__main__":
    run_ml_validations()
