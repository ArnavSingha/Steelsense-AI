import os
import json
import csv
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/data"))

# Ensure directories exist
os.makedirs(os.path.join(DATA_DIR, "sensor_data"), exist_ok=True)
os.makedirs(os.path.join(DATA_DIR, "maintenance_logs"), exist_ok=True)
os.makedirs(os.path.join(DATA_DIR, "failure_reports"), exist_ok=True)

# 1. Generate Sensor Data (CSV)
def generate_sensor_data():
    equipment_sensors = {
        "motor-4": ["vibration_mm_s", "temperature_c", "current_amp"],
        "press-hp02": ["pressure_bar", "fluid_temp_c", "vibration_mm_s"],
        "cooling-cs01": ["coolant_temp_c", "flow_rate_lpm", "pressure_bar"],
        "gearbox-gb02": ["oil_temp_c", "vibration_mm_s", "noise_db"],
        "conveyor-c01": ["motor_current_amp", "belt_tension_n", "speed_m_s"]
    }
    
    start_date = datetime.now() - timedelta(days=180) # 6 months of data
    
    for eq_id, sensors in equipment_sensors.items():
        filepath = os.path.join(DATA_DIR, "sensor_data", f"{eq_id}.csv")
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["timestamp"] + sensors + ["anomaly_flag"])
            
            # Normal baseline with some noise
            baselines = {
                "vibration_mm_s": 2.5,
                "temperature_c": 55.0,
                "current_amp": 120.0,
                "pressure_bar": 200.0,
                "fluid_temp_c": 45.0,
                "coolant_temp_c": 30.0,
                "flow_rate_lpm": 500.0,
                "oil_temp_c": 60.0,
                "noise_db": 75.0,
                "motor_current_amp": 85.0,
                "belt_tension_n": 1500.0,
                "speed_m_s": 2.5
            }
            
            for i in range(180):
                date = start_date + timedelta(days=i)
                row = [date.strftime("%Y-%m-%d")]
                
                # Introduce degradation for motor-4 in the last 30 days
                is_anomaly = 0
                for s in sensors:
                    # Realistic physical baseline noise using Gaussian distribution
                    noise_factor = baselines[s] * 0.015
                    val = baselines[s] + random.gauss(0, noise_factor)
                    
                    if eq_id == "motor-4" and i > 150: # Last 30 days degradation
                        days_degraded = i - 150
                        if s == "vibration_mm_s":
                            # Exponential bearing failure curve
                            val += 0.1 * (1.15 ** days_degraded)
                        elif s == "temperature_c":
                            # Thermal friction rise proportional to vibration amplitude
                            val += 0.4 * days_degraded
                        elif s == "current_amp":
                            # Motor draws slightly more current due to internal friction resistance
                            val += 0.5 * days_degraded
                        is_anomaly = 1 if i > 165 else 0
                        
                    # Introduce degradation for cooling-cs01 in the last 10 days
                    if eq_id == "cooling-cs01" and i > 170:
                        days_degraded = i - 170
                        if s == "coolant_temp_c":
                            val += days_degraded * 1.6
                        elif s == "flow_rate_lpm":
                            # Valve/nozzle clogging reduces flow rate
                            val -= days_degraded * 18.0
                        elif s == "pressure_bar":
                            # Blockage increases backpressure
                            val += days_degraded * 2.5
                        is_anomaly = 1 if i > 175 else 0
                        
                    row.append(round(val, 2))
                row.append(is_anomaly)
                writer.writerow(row)

# 2. Generate Maintenance Logs
def generate_maintenance_logs():
    eq_ids = ["motor-4", "gearbox-gb02", "conveyor-c01", "press-hp02", "cooling-cs01"]
    technicians = ["Ramesh T.", "Suresh K.", "Amit P.", "Priya S."]
    
    start_date = datetime.now() - timedelta(days=180)
    
    for i in range(1, 51):
        log_date = start_date + timedelta(days=random.randint(0, 175))
        eq_id = random.choice(eq_ids)
        tech = random.choice(technicians)
        
        # Specific seeded logs for demo scenarios
        if i == 1:
            eq_id = "motor-4"
            log_date = datetime.now() - timedelta(days=45)
            action = "Routine inspection. Lubrication performed as per SOP-LUB-001. Noted slight discoloration in old grease."
        elif i == 2:
            eq_id = "press-hp02"
            log_date = datetime.now() - timedelta(days=90)
            action = "Replaced main hydraulic seal. Fluid levels topped up."
        else:
            actions = [
                "Routine visual inspection completed. No issues found.",
                "Tightened mounting bolts. Minor vibration detected but within limits.",
                "Cleaned filters and checked fluid levels. All normal.",
                "Scheduled preventive maintenance. Replaced minor wear parts.",
                "Investigated abnormal noise report. Found loose guard rail, secured it."
            ]
            action = random.choice(actions)
            
        doc = f"""# Maintenance Log: WO-2025-{1000+i:04d}
**Date:** {log_date.strftime("%Y-%m-%d")}
**Equipment:** {eq_id}
**Technician:** {tech}

## Action Performed
{action}

## Next Scheduled Maintenance
{(log_date + timedelta(days=30)).strftime("%Y-%m-%d")}
"""
        with open(os.path.join(DATA_DIR, "maintenance_logs", f"WO-2025-{1000+i:04d}.md"), 'w') as f:
            f.write(doc)

# 3. Generate Failure Reports
def generate_failure_reports():
    eq_ids = ["motor-4", "gearbox-gb02", "conveyor-c01", "press-hp02", "cooling-cs01"]
    
    start_date = datetime.now() - timedelta(days=730) # 2 years historical
    
    for i in range(1, 21):
        fail_date = start_date + timedelta(days=random.randint(0, 700))
        eq_id = random.choice(eq_ids)
        
        if eq_id == "motor-4":
            symptoms = "High Vibration + Temperature Rise"
            rc = random.choices(["Lubrication Failure", "Shaft Misalignment", "Bearing Fatigue"], weights=[0.78, 0.14, 0.08])[0]
        elif eq_id == "press-hp02":
            symptoms = "Pressure Drop + Fluid Contamination"
            rc = random.choices(["Pump Wear", "Seal Failure", "Filter Clogging"], weights=[0.55, 0.30, 0.15])[0]
        elif eq_id == "cooling-cs01":
            symptoms = "Coolant Temperature Rise + Flow Rate Drop"
            rc = random.choices(["Pump Cavitation", "Valve Blockage", "Heat Exchanger Fouling"], weights=[0.4, 0.4, 0.2])[0]
        else:
            symptoms = "Operational Halt"
            rc = "Mechanical Wear"
            
        doc = f"""# Failure Report: FR-{fail_date.year}-{100+i:03d}
**Date of Failure:** {fail_date.strftime("%Y-%m-%d")}
**Equipment ID:** {eq_id}
**Severity:** HIGH

## Symptoms
{symptoms}

## Root Cause Analysis
Investigated the failure and determined the root cause to be: **{rc}**.

## Corrective Action
Replaced affected components and recalibrated.
"""
        with open(os.path.join(DATA_DIR, "failure_reports", f"FR-{fail_date.year}-{100+i:03d}.md"), 'w') as f:
            f.write(doc)

if __name__ == "__main__":
    print("Generating Sensor Data...")
    generate_sensor_data()
    print("Generating Maintenance Logs...")
    generate_maintenance_logs()
    print("Generating Failure Reports...")
    generate_failure_reports()
    print("Done!")
