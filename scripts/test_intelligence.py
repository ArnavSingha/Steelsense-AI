import os
import sys
import json
import codecs

# Fix windows terminal unicode printing
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.brain.graph import maintenance_brain_app

def run_validations():
    print("=== Day 4 Validation ===\n")
    
    # 1. Example root-cause analysis output
    print("1. Root-Cause Analysis Output (Diagnostic Intent)")
    res_diag = maintenance_brain_app.invoke({"query": "Pressure Drop + Fluid Contamination in cooling-cs01"})
    print(res_diag.get("response"))
    print("\n" + "="*50 + "\n")
    
    # 2 & 3. Example failure propagation & risk score calculation breakdown
    print("2 & 3. Failure Propagation & Risk Score Calculation (Predictive Intent)")
    res_pred = maintenance_brain_app.invoke({"query": "What is the risk of cooling-cs01 failing?"})
    print(res_pred.get("response"))
    print("\n" + "="*50 + "\n")
    
    # 4. Example spare procurement lookup
    print("4. Spare Procurement Lookup (Planning Intent)")
    res_plan = maintenance_brain_app.invoke({"query": "Check spare parts for cooling-cs01"})
    print(res_plan.get("response"))
    print("\n" + "="*50 + "\n")
    
    # 5. Final Maintenance Recommendation Payload
    print("5. Example Final Maintenance Recommendation Payload")
    # For demo purposes, we combine the intelligence into a JSON response structure
    payload = {
        "equipment_id": "cooling-cs01",
        "diagnostic_confidence": res_diag.get("confidence"),
        "risk_level": res_pred.get("risk_level"),
        "downstream_impact_cost_hr": res_pred.get("downstream_impact", {}).get("total_downtime_cost_per_hr", 0),
        "recommended_action": "Schedule immediate maintenance. Procure required spares immediately due to CRITICAL risk level."
    }
    print(json.dumps(payload, indent=2))

if __name__ == "__main__":
    run_validations()
