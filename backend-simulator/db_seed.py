import sqlite3
import datetime
import numpy as np

def generate_db():
    conn = sqlite3.connect('sandbox.db')
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS enterprises (
            id TEXT PRIMARY KEY,
            name TEXT,
            industry TEXT,
            base_kw REAL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS historical_load (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enterprise_id TEXT,
            timestamp DATETIME,
            load_kw REAL,
            FOREIGN KEY(enterprise_id) REFERENCES enterprises(id)
        )
    ''')

    # Seed Enterprise
    ent_id = "ENT_HV_001"
    cursor.execute("INSERT OR IGNORE INTO enterprises (id, name, industry, base_kw) VALUES (?, ?, ?, ?)", 
                   (ent_id, "高壓科技製造廠 (HV Fab)", "Semiconductor", 2000.0))
    
    # Check if data already exists to avoid re-seeding
    cursor.execute("SELECT COUNT(*) FROM historical_load WHERE enterprise_id=?", (ent_id,))
    if cursor.fetchone()[0] > 0:
        print("Data already seeded.")
        return

    print("Generating 2 years of 15-minute load data (730 days)...")
    # Generate 2 years of data: 2024-01-01 to 2025-12-31
    start_date = datetime.datetime(2024, 1, 1, 0, 0)
    end_date = datetime.datetime(2025, 12, 31, 23, 45)
    
    delta = datetime.timedelta(minutes=15)
    current = start_date
    
    records = []
    
    while current <= end_date:
        month = current.month
        hour = current.hour
        weekday = current.weekday()
        
        # Base load
        load = 2000.0
        
        # Seasonality (Summer peak June-Sept)
        if 6 <= month <= 9:
            load += 500.0  # Chiller load
            
        # Day / Night shift differences (Graveyard shift is slightly lower)
        if 8 <= hour <= 20: # Day shift
            load += 300.0 + np.random.randint(-50, 50)
        else: # Night shift
            load += 50.0 + np.random.randint(-20, 20)
            
        # Weakends dip slightly but don't stop (24/7 fab)
        if weekday >= 5:
            load -= 400.0
            
        # Add random noise
        load += np.random.normal(0, 30)
        load = max(0, load) # ensure non-negative
        
        records.append((ent_id, current.strftime('%Y-%m-%d %H:%M:%S'), load))
        current += delta
        
    cursor.executemany("INSERT INTO historical_load (enterprise_id, timestamp, load_kw) VALUES (?, ?, ?)", records)
    conn.commit()
    conn.close()
    print(f"Successfully generated {len(records)} intervals into sandbox.db")

if __name__ == "__main__":
    generate_db()
