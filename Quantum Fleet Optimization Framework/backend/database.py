"""
GreenFleet Quantum (SIH-26138) - SQLite Database Persistence Engine
===================================================================
Provides local relational database storage for:
1. Fleet vessels & live AIS telemetry coordinates
2. Voyage optimization runs and Pareto history
3. Real-time telemetry timeseries
4. Cryptographically signed IMO audit certificates
"""

import os
import sqlite3
import time
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "greenfleet.db"))

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Vessels Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vessels (
        id TEXT PRIMARY KEY,
        mmsi TEXT UNIQUE NOT NULL,
        imo TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        vessel_type_key TEXT NOT NULL,
        dwt REAL NOT NULL,
        displacement REAL NOT NULL,
        corridor TEXT NOT NULL,
        route_name TEXT NOT NULL,
        progress REAL NOT NULL,
        speed REAL NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        heading REAL NOT NULL,
        status TEXT NOT NULL,
        fuel_type TEXT NOT NULL,
        fuel_rate_mt_day REAL NOT NULL,
        attained_cii REAL NOT NULL,
        cii_grade TEXT NOT NULL,
        power_kw REAL NOT NULL,
        engine_load_pct REAL NOT NULL,
        eta TEXT NOT NULL,
        updated_at INTEGER NOT NULL
    )
    """)

    # 2. Optimized Voyages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS voyages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voyage_id TEXT UNIQUE NOT NULL,
        corridor_id TEXT NOT NULL,
        vessel_id TEXT NOT NULL,
        optimizer_used TEXT NOT NULL,
        total_cost_usd REAL NOT NULL,
        fuel_saved_pct REAL NOT NULL,
        fuel_saved_mt REAL NOT NULL,
        cost_saved_usd REAL NOT NULL,
        co2_avoided_mt REAL NOT NULL,
        cii_grade TEXT NOT NULL,
        execution_time_ms REAL NOT NULL,
        speeds_json TEXT NOT NULL,
        created_at INTEGER NOT NULL
    )
    """)

    # 3. Telemetry History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vessel_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        speed REAL NOT NULL,
        heading REAL NOT NULL,
        power_kw REAL NOT NULL,
        fuel_rate_mt_day REAL NOT NULL,
        wave_height_m REAL,
        wind_speed_kmh REAL
    )
    """)

    # 4. Audit Certificates Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cert_id TEXT UNIQUE NOT NULL,
        vessel_name TEXT NOT NULL,
        imo_number TEXT NOT NULL,
        vessel_type TEXT NOT NULL,
        fuel_type TEXT NOT NULL,
        attained_cii REAL NOT NULL,
        cii_grade TEXT NOT NULL,
        sha256_hash TEXT NOT NULL,
        issued_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed Initial Vessels if empty
    cursor.execute("SELECT COUNT(*) FROM vessels")
    if cursor.fetchone()[0] == 0:
        seed_vessels = [
            ("V001", "311009001", "IMO 9811001", "Oceanic Vanguard", "Container (15,000 TEU)", "CONTAINER_15000TEU", 145000.0, 175000.0, "SIN_ROT", "Singapore -> Rotterdam", 0.42, 16.4, 12.60, 43.40, 285.0, "optimized", "GREEN_METHANOL", 48.2, 4.82, "A", 24200.0, 74.2, "Sep 14, 09:30 UTC", int(time.time())),
            ("V002", "311009002", "IMO 9811002", "Pacific Meridian", "Panamax Bulk Carrier", "PANAMAX", 74000.0, 89000.0, "SHA_BOM", "Shanghai -> JNPT Mumbai", 0.68, 13.8, 8.00, 83.00, 260.0, "at-risk", "VLSFO", 28.5, 7.43, "C", 8900.0, 63.5, "Sep 08, 14:00 UTC", int(time.time())),
            ("V003", "311009003", "IMO 9811003", "Nordic Horizon", "Aframax Crude Carrier", "AFRAMAX", 115000.0, 135000.0, "RST_ROT", "Ras Tanura -> Rotterdam", 0.22, 14.5, 23.50, 59.80, 210.0, "normal", "LNG", 34.1, 5.95, "B", 11200.0, 62.2, "Sep 22, 18:00 UTC", int(time.time())),
            ("V004", "311009004", "IMO 9811004", "Indus Star", "Capesize Bulk Carrier", "CAPESIZE", 178000.0, 210000.0, "SIN_ROT", "Dampier -> Paradip", 0.81, 12.8, 35.80, 14.50, 310.0, "optimization-running", "VLSFO", 39.4, 6.12, "B", 14500.0, 65.9, "Sep 04, 11:00 UTC", int(time.time())),
            ("V005", "311009005", "IMO 9811005", "Atlantic Pioneer", "VLCC Crude Tanker", "VLCC", 298000.0, 340000.0, "RST_ROT", "Ras Tanura -> Houston", 0.53, 15.0, 35.95, -5.60, 245.0, "normal", "GREEN_METHANOL", 52.8, 4.90, "A", 21500.0, 67.1, "Sep 19, 06:00 UTC", int(time.time()))
        ]
        cursor.executemany("""
        INSERT INTO vessels (id, mmsi, imo, name, type, vessel_type_key, dwt, displacement, corridor, route_name, progress, speed, lat, lng, heading, status, fuel_type, fuel_rate_mt_day, attained_cii, cii_grade, power_kw, engine_load_pct, eta, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_vessels)
        conn.commit()

    conn.close()

# Database Helper Functions
def db_get_all_vessels() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM vessels").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_get_vessel(vessel_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM vessels WHERE id = ? OR mmsi = ?", (vessel_id, vessel_id)).fetchone()
    conn.close()
    return dict(row) if row else None

def db_update_vessel_telemetry(vessel_id: str, lat: float, lng: float, speed: float, heading: float, progress: float):
    conn = get_db_connection()
    conn.execute("""
    UPDATE vessels
    SET lat = ?, lng = ?, speed = ?, heading = ?, progress = ?, updated_at = ?
    WHERE id = ? OR mmsi = ?
    """, (lat, lng, speed, heading, progress, int(time.time()), vessel_id, vessel_id))
    
    # Also log to history
    conn.execute("""
    INSERT INTO telemetry_history (vessel_id, timestamp, lat, lng, speed, heading, power_kw, fuel_rate_mt_day)
    SELECT id, ?, ?, ?, ?, ?, power_kw, fuel_rate_mt_day FROM vessels WHERE id = ? OR mmsi = ?
    """, (int(time.time()), lat, lng, speed, heading, vessel_id, vessel_id))
    conn.commit()
    conn.close()

def db_save_voyage(voyage_data: Dict[str, Any]):
    conn = get_db_connection()
    conn.execute("""
    INSERT OR REPLACE INTO voyages (voyage_id, corridor_id, vessel_id, optimizer_used, total_cost_usd, fuel_saved_pct, fuel_saved_mt, cost_saved_usd, co2_avoided_mt, cii_grade, execution_time_ms, speeds_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        voyage_data["voyage_id"],
        voyage_data["corridor_id"],
        voyage_data.get("vessel_id", "V001"),
        voyage_data["optimizer_used"],
        voyage_data["total_cost_usd"],
        voyage_data["savings"]["fuel_saved_pct"],
        voyage_data["savings"]["fuel_saved_mt"],
        voyage_data["savings"]["cost_saved_usd"],
        voyage_data["savings"]["co2_avoided_mt"],
        voyage_data["cii_grade"],
        voyage_data["execution_time_ms"],
        json.dumps(voyage_data.get("speeds", [])),
        int(time.time())
    ))
    conn.commit()
    conn.close()

def db_save_certificate(cert: Dict[str, Any]):
    conn = get_db_connection()
    conn.execute("""
    INSERT OR REPLACE INTO audit_certificates (cert_id, vessel_name, imo_number, vessel_type, fuel_type, attained_cii, cii_grade, sha256_hash, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cert["certificate_id"],
        cert["vessel_name"],
        cert.get("imo_number", "IMO 9811001"),
        cert["vessel_type"],
        cert["fuel_type"],
        cert["attained_cii"],
        cert["cii_grade"],
        cert["sha256_audit_hash"],
        cert["issue_date"]
    ))
    conn.commit()
    conn.close()

# Auto-initialize DB on import
init_db()
