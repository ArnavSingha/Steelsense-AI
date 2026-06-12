from typing import TypedDict, Optional, List, Dict, Any

class MaintenanceState(TypedDict):
    """
    The state dictionary that is passed between nodes in the LangGraph workflow.
    """
    # Inputs
    query: str
    equipment_id: Optional[str]
    history: Optional[List[Dict[str, str]]]
    
    # Routing
    intent: Optional[str]  # e.g., "diagnostic", "predictive", "general", "planning"
    
    # Agent Memory / Context
    retrieved_context: List[Dict[str, Any]]
    downstream_impact: Optional[Dict[str, Any]]
    sensor_anomalies: Optional[List[Dict[str, Any]]]
    
    # Final Output
    response: str
    confidence: Optional[str] # "HIGH", "MEDIUM", "LOW"
    risk_level: Optional[str] # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    historical_match: Optional[Dict[str, Any]]
