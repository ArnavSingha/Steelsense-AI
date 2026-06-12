import os
from .state import MaintenanceState
from ..knowledge.vector_store import vector_store
from ..knowledge.graph import knowledge_graph
from ..intelligence.root_cause import root_cause_engine
from ..intelligence.risk_scoring import risk_engine
from ..intelligence.procurement import procurement
from ..knowledge.rag import client, GENERATION_MODEL, ask_maintenance_question
from ..ml.anomaly_detection import anomaly_detector
from ..ml.rul_estimation import rul_estimator
import json
import pandas as pd

def get_latest_sensor_readings(equipment_id: str) -> dict:
    """
    Helper to read the latest sensor readings from the equipment's CSV file.
    """
    from ..ml.anomaly_detection import DATA_DIR as ML_DATA_DIR
    file_path = os.path.join(ML_DATA_DIR, f"{equipment_id.lower()}.csv")
    if os.path.exists(file_path):
        try:
            df = pd.read_csv(file_path)
            if not df.empty:
                return df.iloc[-1].to_dict()
        except Exception as e:
            print(f"Error reading sensor data for {equipment_id}: {e}")
    return {}

def route_intent_node(state: MaintenanceState) -> MaintenanceState:
    """
    Analyzes the user query and routes it to the correct specialized workflow using Gemini.
    """
    query = state.get("query", "").lower()
    
    intent = None
    eq_id = None
    known_eqs = ["motor-4", "gearbox-gb02", "conveyor-c01", "press-hp02", "cooling-cs01"]
    
    if client:
        try:
            prompt = f"""
You are an intent router for an industrial predictive maintenance system.
Analyze the following user query: "{query}"

Output ONLY a JSON object with two keys:
1. "intent": One of ["predictive", "diagnostic", "planning", "general"]
   - "predictive": Asking about future risks, failures, anomalies, remaining useful life, or executive summaries.
   - "diagnostic": Asking about current symptoms, root causes, why something failed, or troubleshooting.
   - "planning": Asking about spare parts, procurement, maintenance scheduling, or costs.
   - "general": Anything else, general knowledge, asking for SOPs, etc.
2. "equipment_id": Extract the equipment ID if mentioned (e.g., "MOTOR-4", "COOLING-CS01", "PRESS-HP02", "GEARBOX-GB02", "CONVEYOR-C01"). If not mentioned, return null.

JSON Output:
"""
            # We use generation model and enforce JSON
            response_obj = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            data = json.loads(response_obj.text)
            intent = data.get("intent", "general")
            eq_id = data.get("equipment_id")
            if eq_id:
                eq_id = eq_id.upper()
        except Exception as e:
            print(f"LLM Routing failed: {e}. Falling back to heuristics.")
            intent = None

    if intent is None:
        # Simple heuristic routing for prototype fallback
        if "risk" in query or "predict" in query or "failure" in query or "when" in query:
            intent = "predictive"
        elif "cause" in query or "why" in query or "vibration" in query or "drop" in query or "symptom" in query:
            intent = "diagnostic"
        elif "spare" in query or "cost" in query or "replace" in query or "plan" in query:
            intent = "planning"
        else:
            intent = "general"
            
        for eq in known_eqs:
            if eq in query:
                eq_id = eq.upper()
                break
                
    return {"intent": intent, "equipment_id": eq_id}

def diagnostic_node(state: MaintenanceState) -> MaintenanceState:
    """
    Diagnostic workflow:
    1. Retrieve SOPs/Manuals/Logs
    2. Query Knowledge Graph for probable causes
    3. Generate root cause diagnosis using Gemini LLM if available
    """
    query = state.get("query", "")
    eq_id = state.get("equipment_id") or "motor-4"
    history = state.get("history", [])
    
    # 1. Retrieve Context
    chunks = vector_store.retrieve(query, equipment_id=eq_id, top_k=5)
    
    # 2. Analyze Root Causes
    analysis = root_cause_engine.analyze_causes(eq_id, query, chunks)
    
    # Get KG details
    kg_details = knowledge_graph.failure_modes
    
    # Check historical matches
    history_match = root_cause_engine.find_historical_matches(eq_id, "Degradation", "HIGH")
    
    # Formulate Prompt
    context_str = "\n\n".join([f"[Source: {c['doc_type']} for {c['equipment_id']}]\n{c['text']}" for c in chunks])
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history]) if history else "No previous history."
    
    prompt = f"""
You are ForgeMind Copilot, an expert industrial maintenance AI assistant at Tata Steel.
Your goal is to diagnose equipment issues and identify probable root causes by combining the Knowledge Graph failure mode definitions, retrieved manuals/SOPs, and historical cases.

<knowledge_graph_failure_modes>
{json.dumps(kg_details, indent=2)}
</knowledge_graph_failure_modes>

<retrieved_context_manuals_sops>
{context_str}
</retrieved_context_manuals_sops>

<historical_matches>
{json.dumps(history_match, indent=2) if history_match else "None"}
</historical_matches>

<conversation_history>
{history_str}
</conversation_history>

User Diagnostic Query: {query}

Instructions:
- Perform semantic mapping between the symptoms described in the query and the known failure modes.
- If there's a match, explain the probable causes and how they relate to the retrieved SOPs or manuals.
- Reference relevant SOPs (like SOP-LUB-001) or manuals/work orders directly.
- Formulate a clear, highly professional, bulleted diagnostic report.
- Include a clear recommended immediate corrective action.
- Provide the overall confidence level (HIGH, MEDIUM, or LOW) and explain why.

Your Response:
"""

    if client:
        try:
            response_obj = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
            )
            response = response_obj.text
        except Exception as e:
            response = f"Error calling Gemini API for diagnosis: {str(e)}\n\nFallback: Diagnostic Workflow Activated."
    else:
        # Fallback to rule-based analysis format
        response = "Diagnostic Workflow Activated.\n\n"
        response += "**Root Cause Analysis:**\n"
        if analysis["causes"]:
            for cause in analysis["causes"]:
                response += f"- {cause['cause']} (Base: {cause['base_likelihood']}, Evidence: {cause['evidence_strength']}, Confidence: {cause['confidence']})\n"
        else:
            response += "- Unknown failure mode. Symptoms do not match exact predefined signatures. Please inspect manually.\n"
        response += f"\n**Overall Diagnostic Confidence:** {analysis['overall_confidence']}\n"

    return {
        "response": response,
        "retrieved_context": chunks,
        "confidence": analysis["overall_confidence"],
        "historical_match": history_match
    }

def predictive_node(state: MaintenanceState) -> MaintenanceState:
    """
    Predictive workflow:
    1. Check sensor anomaly states
    2. Check downstream impact from KG
    3. Calculate Risk
    4. Generate Executive Summary using Gemini LLM if available
    """
    eq_id = state.get("equipment_id") or "motor-4"
    query = state.get("query", "")
    history = state.get("history", [])
    
    # Load latest sensor data
    readings = get_latest_sensor_readings(eq_id)
    
    # Run ML Predictions
    anomaly_res = anomaly_detector.predict(eq_id, readings) if readings else {"is_anomaly": False, "anomaly_score": 0.0}
    rul_res = rul_estimator.predict(eq_id, readings) if readings else {"rul_days": -1, "confidence": "LOW", "reasoning_signals": {}}
    
    details = knowledge_graph.get_equipment_details(eq_id)
    impact = knowledge_graph.get_downstream_impact(eq_id)
    
    # Simple spare lookup to feed risk engine
    spares = procurement.find_spares_for_equipment(eq_id)
    primary_spare = spares[0] if spares else None
    
    risk_data = None
    if details and impact:
        risk_data = risk_engine.calculate_risk(details, impact, primary_spare)
        
    cost = f"₹{impact['total_downtime_cost_per_hr']:,.0f}/hr" if impact else "Unknown"
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history]) if history else "No previous history."
    
    prompt = f"""
You are ForgeMind Copilot, an industrial predictive maintenance expert at Tata Steel.
Your goal is to write a concise, professional Executive Summary (BLUF - Bottom Line Up Front) for the Plant Manager regarding an impending equipment failure risk.

Here is the data from our predictive systems:
- Equipment ID: {eq_id.upper()}
- Equipment Name: {details.get('name') if details else 'Unknown'}
- Location: {details.get('location') if details else 'Unknown'}
- Risk Level: {risk_data['risk_level'] if risk_data else 'UNKNOWN'}
- Is Anomaly Detected (ML): {anomaly_res.get('is_anomaly', False)} (Score: {anomaly_res.get('anomaly_score', 0)})
- Estimated Remaining Useful Life (RUL): {rul_res.get('rul_days', -1)} days (ML Confidence: {rul_res.get('confidence', 'LOW')})
- ML Trajectory: {rul_res.get('reasoning_signals', {}).get('trajectory', 'UNKNOWN')}
- Downstream Assets Affected: {impact.get('affected_count', 0)} assets
- Downtime Financial Exposure: {cost}/hour
- Primary Spare Availability: Stock: {primary_spare.get('stock') if primary_spare else 0}, Lead Time: {primary_spare.get('lead_time_days') if primary_spare else 0} days

<conversation_history>
{history_str}
</conversation_history>

User Predictive Query: {query}

Instructions:
1. Write a structured "Plant Manager Executive Summary".
2. Focus on the financial impact (downtime cost), RUL estimate, and spare parts bottleneck.
3. State whether immediate action is required based on RUL (e.g. if RUL is 2 days and spare lead time is 12 days).
4. Do not include raw JSON dumps or lists of features. Keep it professional, data-dense, and formatted in markdown.

Your Response:
"""

    if client:
        try:
            response_obj = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
            )
            response = response_obj.text
        except Exception as e:
            response = f"Error calling Gemini API for predictive analysis: {str(e)}\n\nFallback: Predictive Workflow Activated."
    else:
        # Fallback to rule-based output
        response = "### Executive Summary\n\n"
        if risk_data:
            response += f"**Equipment:** {eq_id.upper()}\n"
            response += f"**Risk:** {risk_data['risk_level']}\n"
            response += f"**Primary Cause:** Sensor Anomaly / Degradation Detected\n"
            response += f"**Estimated RUL:** {rul_res.get('rul_days', -1)} days (Confidence: {rul_res.get('confidence', 'LOW')})\n"
            response += f"**Potential Impact:** {cost} downstream exposure\n"
            response += f"**Recommended Action:** Initiate maintenance protocol and reserve {'inventory' if primary_spare else 'parts'}.\n\n"
            response += f"*(Risk Breakdown: {json.dumps(risk_data['breakdown'])})*\n"
            
    # Add historical match
    history_match = None
    if risk_data:
        history_match = root_cause_engine.find_historical_matches(eq_id, "Degradation", risk_data['risk_level'])

    return {
        "response": response, 
        "downstream_impact": impact, 
        "risk_level": risk_data["risk_level"] if risk_data else "UNKNOWN",
        "historical_match": history_match
    }

def planning_node(state: MaintenanceState) -> MaintenanceState:
    """
    Planning workflow:
    1. Query spare catalog
    2. Suggest maintenance windows and procurement plans using Gemini
    """
    eq_id = state.get("equipment_id") or "motor-4"
    query = state.get("query", "")
    history = state.get("history", [])
    
    spares = procurement.find_spares_for_equipment(eq_id)
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history]) if history else "No previous history."
    
    prompt = f"""
You are ForgeMind Copilot, an industrial procurement and maintenance planning expert at Tata Steel.
Your goal is to suggest an optimized maintenance window and procurement/replenishment plan based on spare parts availability.

Compatible Spare Parts for {eq_id.upper()}:
{json.dumps(spares, indent=2)}

<conversation_history>
{history_str}
</conversation_history>

User Planning Query: {query}

Instructions:
1. Provide a clear spare parts inventory status.
2. Outline recommended actions (e.g. if stock is 0, recommend immediate expedited order; if stock > 0, recommend reserving inventory).
3. Offer suggestions for maintenance scheduling based on stock lead times.
4. Keep the output structured, professional, and formatted in markdown.

Your Response:
"""

    if client:
        try:
            response_obj = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
            )
            response = response_obj.text
        except Exception as e:
            response = f"Error calling Gemini API for planning: {str(e)}\n\nFallback: Planning Workflow Activated."
    else:
        # Fallback to rule-based output
        response = "Planning Workflow Activated.\n\n"
        if spares:
            response += f"**Procurement Intelligence for {eq_id}:**\n"
            for spare in spares:
                response += f"- Part {spare['part_id']} ({spare['name']}): Stock: {spare['stock']}, Lead Time: {spare['lead_time_days']} days, Cost: ₹{spare['cost_inr']:,.0f}\n"
                if spare['stock'] > 0:
                    response += "  *Recommendation:* Reserve existing inventory and schedule maintenance.\n"
                else:
                    response += "  *Recommendation:* Stock depleted. Expedite immediate procurement.\n"
        else:
            response += f"No specific spares found in catalog for {eq_id}.\n"
            
    return {"response": response}

def general_qa_node(state: MaintenanceState) -> MaintenanceState:
    """
    Fallback RAG for general questions.
    """
    query = state.get("query", "")
    eq_id = state.get("equipment_id")
    
    rag_res = ask_maintenance_question(query, equipment_id=eq_id)
    return {"response": rag_res.answer}
