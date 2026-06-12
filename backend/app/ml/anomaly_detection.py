import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend/data/sensor_data"))

class AnomalyDetector:
    def __init__(self):
        self.models = {}  # Store a model per equipment

    def train_or_load(self, equipment_id: str):
        """
        Trains an Isolation Forest on the healthy baseline of the equipment's data.
        """
        if equipment_id in self.models:
            return

        file_path = os.path.join(DATA_DIR, f"{equipment_id.lower()}.csv")
        if not os.path.exists(file_path):
            print(f"Warning: Sensor data not found for {equipment_id}")
            return

        df = pd.read_csv(file_path)
        
        # Train on the "healthy" baseline (where anomaly == 0)
        # Using vibration, temperature, pressure_drop, rpm as features depending on what's available
        features = [col for col in df.columns if col not in ["timestamp", "anomaly_flag", "RUL_target"]]
        
        healthy_data = df[df["anomaly_flag"] == 0][features]
        if len(healthy_data) == 0:
            # Fallback if no clean label, just use first 180 days
            healthy_data = df.head(180)[features]

        # Train Isolation Forest
        model = IsolationForest(contamination=0.01, random_state=42)
        model.fit(healthy_data)
        
        self.models[equipment_id] = {
            "model": model,
            "features": features
        }

    def predict(self, equipment_id: str, sensor_readings: dict):
        """
        Predicts if a new reading is anomalous.
        """
        self.train_or_load(equipment_id)
        
        if equipment_id not in self.models:
            return {"is_anomaly": False, "score": 0.0, "status": "No model"}

        model_data = self.models[equipment_id]
        model = model_data["model"]
        features = model_data["features"]
        
        # Construct input row
        input_data = []
        for f in features:
            input_data.append(sensor_readings.get(f, 0.0))
            
        df_input = pd.DataFrame([input_data], columns=features)
        
        # Predict (-1 is anomaly, 1 is normal)
        pred = model.predict(df_input)[0]
        # Score (negative is more anomalous)
        score = model.score_samples(df_input)[0]
        
        return {
            "is_anomaly": bool(pred == -1),
            "anomaly_score": round(float(score), 4), # Less than 0 is usually an anomaly
            "features_evaluated": features
        }

anomaly_detector = AnomalyDetector()
