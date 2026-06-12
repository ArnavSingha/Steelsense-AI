from typing import List, Dict, Any
from ..knowledge.graph import knowledge_graph

class RootCauseEngine:
    def analyze_causes(self, equipment_id: str, symptoms_str: str, retrieved_context: List[Dict]) -> Dict[str, Any]:
        """
        Combines Knowledge Graph probabilities with RAG retrieved context 
        to output confidence-backed root cause analysis.
        """
        # 1. Base causes from KG
        kg_causes = knowledge_graph.get_probable_causes(symptoms_str)
        
        # 2. Check evidence in RAG context
        context_text = " ".join([c.get("text", "").lower() for c in retrieved_context])
        
        analyzed_causes = []
        highest_confidence = "LOW"
        
        for pc in kg_causes:
            cause_name = pc["cause"]
            base_likelihood = pc["likelihood"] # HIGH, MEDIUM, LOW
            
            # Simple heuristic: if the cause is heavily mentioned in recent logs or manuals
            evidence_strength = "WEAK"
            mentions = context_text.count(cause_name.lower())
            
            if mentions > 3:
                evidence_strength = "STRONG"
            elif mentions > 0:
                evidence_strength = "MODERATE"
                
            # Confidence Calculation
            confidence = "LOW"
            if base_likelihood == "HIGH" and evidence_strength == "STRONG":
                confidence = "HIGH"
                highest_confidence = "HIGH"
            elif base_likelihood == "HIGH" or evidence_strength == "STRONG":
                confidence = "MEDIUM"
                if highest_confidence != "HIGH": highest_confidence = "MEDIUM"
                
            analyzed_causes.append({
                "cause": cause_name,
                "base_likelihood": base_likelihood,
                "evidence_strength": evidence_strength,
                "confidence": confidence
            })
            
        return {
            "causes": analyzed_causes,
            "overall_confidence": highest_confidence,
            "symptoms_analyzed": symptoms_str
        }

    def find_historical_matches(self, equipment_id: str, primary_cause: str, risk_level: str) -> Dict[str, Any]:
        """
        Calculates a Case Similarity Score based on explicit match factors rather than pure text embeddings.
        Weights:
        40% Equipment Type Match
        30% Failure Mode Match
        20% Sensor Pattern Match
        10% Risk Level Match
        """
        # Hardcoded mock historical database for prototype
        historical_db = [
            {
                "case_id": "FR-2025-110",
                "date": "2025-04-12",
                "equipment_id": "motor-3",
                "equipment_type": "Motor",
                "failure_mode": "Lubrication Degradation",
                "sensor_pattern": "Vibration Increase, Temperature Rise",
                "risk_level": "CRITICAL"
            },
            {
                "case_id": "FR-2024-085",
                "date": "2024-11-03",
                "equipment_id": "cooling-cs02",
                "equipment_type": "Cooling System",
                "failure_mode": "Fluid Contamination",
                "sensor_pattern": "Pressure Drop",
                "risk_level": "HIGH"
            }
        ]
        
        best_match = None
        best_score = 0
        matched_factors = []
        
        # Heuristics to derive types from eq_id
        eq_type = "Motor" if "motor" in equipment_id else "Cooling System" if "cooling" in equipment_id else "Press"
        
        for case in historical_db:
            score = 0
            factors = []
            
            if case["equipment_type"] == eq_type:
                score += 40
                factors.append("Equipment Type")
                
            # Naive match check for failure mode/cause
            if "lubrication" in primary_cause.lower() and "lubrication" in case["failure_mode"].lower():
                score += 30
                factors.append("Lubrication Failure")
            elif "fluid" in primary_cause.lower() and "fluid" in case["failure_mode"].lower():
                score += 30
                factors.append("Fluid Contamination")
                
            # If we matched failure mode, assume sensor patterns likely matched for this demo
            if len(factors) > 1:
                score += 20
                for pattern in case["sensor_pattern"].split(", "):
                    factors.append(pattern)
                
            if case["risk_level"] == risk_level:
                score += 10
                factors.append("Risk Level")
                
            if score > best_score:
                best_score = score
                best_match = case
                matched_factors = factors
                
        similarity_tier = "HIGH" if best_score >= 70 else "MEDIUM" if best_score >= 40 else "LOW"
        
        if best_match:
            return {
                "case_id": best_match["case_id"],
                "similarity": similarity_tier,
                "score": best_score,
                "matched_factors": list(set(matched_factors))
            }
        return None

root_cause_engine = RootCauseEngine()
