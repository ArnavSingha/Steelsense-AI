import os
import json

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend/data"))
SPARE_CATALOG_FILE = os.path.join(DATA_DIR, "spare_catalog.json")

class ProcurementIntelligence:
    def __init__(self):
        self.catalog = {}
        self._load_catalog()

    def _load_catalog(self):
        if not os.path.exists(SPARE_CATALOG_FILE):
            print(f"Warning: {SPARE_CATALOG_FILE} not found.")
            return

        with open(SPARE_CATALOG_FILE, 'r') as f:
            data = json.load(f)
            # Index by part_id for quick lookup
            for part in data.get("spares", []):
                self.catalog[part["part_id"]] = part

    def get_spare_details(self, part_id: str):
        """Looks up a part by ID."""
        return self.catalog.get(part_id)

    def find_spares_for_equipment(self, equipment_id: str):
        """Finds all compatible spares for a given equipment ID."""
        spares = []
        for part in self.catalog.values():
            if equipment_id in part.get("for_equipment", []):
                spares.append(part)
        return spares

# Singleton
procurement = ProcurementIntelligence()
