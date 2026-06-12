from typing import Dict, Any

class RiskScoringEngine:
    """
    Calculates transparent business-aware risk scores.
    Formula based on downtime cost, criticality, spare lead time, and propagation.
    """
    
    def calculate_risk(self, equipment_details: Dict[str, Any], downstream_impact: Dict[str, Any], spare_part: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Calculates a qualitative and quantitative risk score.
        """
        base_criticality = equipment_details.get("criticality", "LOW")
        downtime_cost = equipment_details.get("downtime_cost_per_hr", 0)
        
        affected_count = downstream_impact.get("affected_count", 0)
        total_downtime_cost = downstream_impact.get("total_downtime_cost_per_hr", downtime_cost)
        
        # Spare Delay Factor
        spare_delay_days = 0
        if spare_part:
            stock = spare_part.get("stock", 0)
            if stock == 0:
                spare_delay_days = spare_part.get("lead_time_days", 14)
                
        # Calculate Risk Components (1-10 scale for each)
        
        # 1. Criticality Score (1-10)
        crit_score = {"LOW": 2, "MEDIUM": 5, "HIGH": 8, "CRITICAL": 10}.get(base_criticality, 2)
        
        # 2. Financial Severity Score (1-10) -> assume max scale is ~2,500,000 / hr
        fin_score = min(10, int((total_downtime_cost / 2500000) * 10))
        if fin_score == 0 and total_downtime_cost > 0: fin_score = 1
        
        # 3. Propagation Score (1-10) -> based on affected count
        prop_score = min(10, affected_count * 2)
        
        # 4. Spare Delay Score (1-10)
        delay_score = min(10, int(spare_delay_days / 2))
        
        total_score = crit_score + fin_score + prop_score + delay_score
        max_possible = 40
        risk_percentage = (total_score / max_possible) * 100
        
        # Qualitative Level
        if risk_percentage >= 75:
            risk_level = "CRITICAL"
        elif risk_percentage >= 50:
            risk_level = "HIGH"
        elif risk_percentage >= 25:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        return {
            "risk_level": risk_level,
            "breakdown": {
                "criticality_factor": crit_score,
                "financial_factor": fin_score,
                "propagation_factor": prop_score,
                "spare_delay_factor": delay_score
            },
            "metrics": {
                "total_downtime_cost_per_hr": total_downtime_cost,
                "affected_assets": affected_count,
                "spare_lead_time_days": spare_delay_days
            }
        }

# Singleton
risk_engine = RiskScoringEngine()
