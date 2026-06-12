from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3
import os
from .state import MaintenanceState
from .nodes import (
    route_intent_node,
    diagnostic_node,
    predictive_node,
    planning_node,
    general_qa_node
)

# Set up SQLite database for LangGraph state persistence
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "langgraph_checkpoints.db")

# Initialize global connection with check_same_thread=False for FastAPI
conn = sqlite3.connect(DB_PATH, check_same_thread=False)

def get_next_node(state: MaintenanceState) -> str:
    """
    Conditional edge routing based on the intent extracted in route_intent_node.
    """
    intent = state.get("intent")
    if intent == "diagnostic":
        return "diagnostic_node"
    elif intent == "predictive":
        return "predictive_node"
    elif intent == "planning":
        return "planning_node"
    else:
        return "general_qa_node"

def build_maintenance_brain():
    """
    Constructs the LangGraph workflow for the Maintenance Brain.
    """
    workflow = StateGraph(MaintenanceState)

    # Add Nodes
    workflow.add_node("router", route_intent_node)
    workflow.add_node("diagnostic_node", diagnostic_node)
    workflow.add_node("predictive_node", predictive_node)
    workflow.add_node("planning_node", planning_node)
    workflow.add_node("general_qa_node", general_qa_node)

    # Define Edges
    # Entry point is the router
    workflow.set_entry_point("router")

    # Conditional routing from router
    workflow.add_conditional_edges(
        "router",
        get_next_node,
        {
            "diagnostic_node": "diagnostic_node",
            "predictive_node": "predictive_node",
            "planning_node": "planning_node",
            "general_qa_node": "general_qa_node"
        }
    )

    # All leaf nodes go to END
    workflow.add_edge("diagnostic_node", END)
    workflow.add_edge("predictive_node", END)
    workflow.add_edge("planning_node", END)
    workflow.add_edge("general_qa_node", END)

    # Compile the graph with persistent SQLite checkpointer
    memory = SqliteSaver(conn)
    memory.setup() # create tables if they don't exist
    app = workflow.compile(checkpointer=memory)
    return app

# Singleton compiled graph
maintenance_brain_app = build_maintenance_brain()
