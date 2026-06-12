import os
import sys
import shutil
import json

# Fix windows terminal unicode printing
sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/data"))
SPARE_CATALOG = os.path.join(DATA_DIR, "spare_catalog.json")

def reset_demo():
    print("=== SteelSense AI: Demo Reset Utility ===")
    
    # 1. Reset Vector Store (FAISS)
    faiss_index = os.path.join(DATA_DIR, "faiss.index")
    sqlite_db = os.path.join(DATA_DIR, "metadata.db")
    
    if os.path.exists(faiss_index):
        os.remove(faiss_index)
        print("✓ FAISS index cleared.")
    if os.path.exists(sqlite_db):
        try:
            os.remove(sqlite_db)
            print("✓ SQLite metadata db file removed.")
        except PermissionError:
            # Fallback: Truncate tables if file is locked by running server
            import sqlite3
            try:
                conn = sqlite3.connect(sqlite_db)
                cursor = conn.cursor()
                cursor.execute("DELETE FROM chunks;")
                # Reset autoincrement sequence if table exists
                cursor.execute("DELETE FROM sqlite_sequence WHERE name='chunks';")
                conn.commit()
                conn.close()
                print("✓ SQLite metadata tables truncated (file locked by active server).")
            except Exception as se:
                print(f"✗ Failed to clear SQLite DB: {se}")
        
    # 2. Reset Spare Catalog Inventory
    if os.path.exists(SPARE_CATALOG):
        with open(SPARE_CATALOG, 'r') as f:
            catalog = json.load(f)
            
        # Reset stock to demo starting values
        for part in catalog.get("spares", []):
            if part["part_id"] == "VALVE-CS-01":
                part["stock"] = 1
            elif part["part_id"] == "SKF-6205-2RS":
                part["stock"] = 0
            elif part["part_id"] == "SEAL-HP-02":
                part["stock"] = 2
                
        with open(SPARE_CATALOG, 'w') as f:
            json.dump(catalog, f, indent=2)
            
        print("✓ Spare catalog inventory reset to Day 0 values.")
        
    # 3. Reset Feedback & Logbook
    feedback_file = os.path.join(DATA_DIR, "feedback.json")
    logbook_file = os.path.join(DATA_DIR, "logbook.json")
    
    for f_path in [feedback_file, logbook_file]:
        if os.path.exists(f_path):
            try:
                os.remove(f_path)
                print(f"✓ Cleared {os.path.basename(f_path)}")
            except Exception as e:
                try:
                    with open(f_path, "w") as f:
                        json.dump([], f)
                    print(f"✓ Truncated {os.path.basename(f_path)}")
                except Exception as ex:
                    print(f"✗ Failed to clear {os.path.basename(f_path)}: {ex}")
        
    print("\nDemo environment successfully reset! Ready for the judges.")

if __name__ == "__main__":
    reset_demo()
