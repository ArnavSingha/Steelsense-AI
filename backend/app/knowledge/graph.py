import os
import json
import networkx as nx

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend/data"))
KG_FILE = os.path.join(DATA_DIR, "knowledge_graph_seed.json")

class MaintenanceKnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._load_graph()

    def _load_graph(self):
        if not os.path.exists(KG_FILE):
            print(f"Warning: {KG_FILE} not found. Graph empty.")
            return

        with open(KG_FILE, 'r') as f:
            data = json.load(f)

        # Add Nodes
        for eq in data.get("equipment", []):
            self.graph.add_node(
                eq["id"],
                name=eq["name"],
                type=eq["type"],
                location=eq["location"],
                criticality=eq["criticality"],
                downtime_cost_per_hr=eq["downtime_cost_per_hr"]
            )

        # Add Edges
        for conn in data.get("connections", []):
            self.graph.add_edge(conn["from"], conn["to"], relation=conn["relation"])

        self.symptoms_map = data.get("symptoms", {})
        self.failure_modes = data.get("failure_modes", {})
        self.components = data.get("components", [])

    def get_equipment_details(self, eq_id: str):
        """Returns details for a specific equipment node."""
        eq_id = eq_id.lower() if eq_id else ""
        if self.graph.has_node(eq_id):
            return self.graph.nodes[eq_id]
        return None

    def get_downstream_impact(self, eq_id: str):
        """
        Traverses the graph to find all downstream assets affected by a failure.
        Calculates total downtime cost per hour.
        """
        eq_id = eq_id.lower() if eq_id else ""
        if not self.graph.has_node(eq_id):
            return {
                "root_node": eq_id,
                "affected_count": 0,
                "affected_assets": [],
                "total_downtime_cost_per_hr": 0
            }

        # Use BFS to find all downstream nodes
        affected = list(nx.bfs_tree(self.graph, eq_id).nodes())
        
        # Calculate cost
        total_cost = 0
        details = []
        for node in affected:
            node_data = self.graph.nodes[node]
            cost = node_data.get("downtime_cost_per_hr", 0)
            total_cost += cost
            details.append({
                "id": node,
                "name": node_data.get("name"),
                "criticality": node_data.get("criticality"),
                "downtime_cost_per_hr": cost
            })

        return {
            "root_node": eq_id,
            "affected_count": len(affected),
            "affected_assets": details,
            "total_downtime_cost_per_hr": total_cost
        }

    def get_probable_causes(self, symptoms_str: str):
        """Matches a string of symptoms to failure modes."""
        # Simple exact match for demo purposes
        for symptoms_key, data in self.failure_modes.items():
            if symptoms_key.lower() in symptoms_str.lower():
                return data.get("probable_causes", [])
        return []

# Singleton instance for the app
knowledge_graph = MaintenanceKnowledgeGraph()
