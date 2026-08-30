"""
Maritime Telemetry & Route Ingestion Engine
============================================
Defines standard global maritime shipping corridors with real waypoints,
depth constraints, and metocean properties.
"""

from typing import List, Dict, Any

# Major Global Maritime Corridors with Waypoints & Constraints
GLOBAL_CORRIDORS: Dict[str, Dict[str, Any]] = {
    "SIN_ROT": {
        "id": "SIN_ROT",
        "name": "Singapore (SGSIN) → Rotterdam (NLRTM)",
        "origin": "Singapore",
        "destination": "Rotterdam",
        "distance_nm": 8280.0,
        "max_draft_m": 16.0,  # Suez Canal draft constraint
        "required_arrival_window_hours": 505.0,  # ~21 days
        "waypoints": [
            {"name": "Singapore Departure", "lat": 1.29, "lng": 103.85, "distance_to_next": 380.0, "avg_wave_m": 1.1, "wind_kmh": 14.0},
            {"name": "Malacca Strait North", "lat": 5.40, "lng": 98.60, "distance_to_next": 1250.0, "avg_wave_m": 1.3, "wind_kmh": 18.0},
            {"name": "Sri Lanka South", "lat": 5.80, "lng": 80.50, "distance_to_next": 1420.0, "avg_wave_m": 2.2, "wind_kmh": 26.0},
            {"name": "Arabian Sea Basin", "lat": 11.20, "lng": 62.10, "distance_to_next": 980.0, "avg_wave_m": 2.8, "wind_kmh": 32.0},
            {"name": "Bab-el-Mandeb Strait", "lat": 12.60, "lng": 43.40, "distance_to_next": 1140.0, "avg_wave_m": 1.8, "wind_kmh": 22.0},
            {"name": "Red Sea Central", "lat": 22.00, "lng": 38.00, "distance_to_next": 720.0, "avg_wave_m": 1.5, "wind_kmh": 20.0},
            {"name": "Suez Canal Transit", "lat": 29.90, "lng": 32.55, "distance_to_next": 960.0, "avg_wave_m": 0.8, "wind_kmh": 15.0},
            {"name": "Mediterranean Central (Malta)", "lat": 35.80, "lng": 14.50, "distance_to_next": 990.0, "avg_wave_m": 1.6, "wind_kmh": 24.0},
            {"name": "Strait of Gibraltar", "lat": 35.95, "lng": -5.60, "distance_to_next": 780.0, "avg_wave_m": 2.0, "wind_kmh": 28.0},
            {"name": "Bay of Biscay / English Channel", "lat": 47.50, "lng": -6.20, "distance_to_next": 460.0, "avg_wave_m": 3.4, "wind_kmh": 38.0},
            {"name": "Rotterdam Europort Arrival", "lat": 51.95, "lng": 4.14, "distance_to_next": 0.0, "avg_wave_m": 1.2, "wind_kmh": 18.0}
        ]
    },
    "SHA_BOM": {
        "id": "SHA_BOM",
        "name": "Shanghai (CNSHA) → JNPT Mumbai (INNSA)",
        "origin": "Shanghai",
        "destination": "JNPT Mumbai",
        "distance_nm": 4920.0,
        "max_draft_m": 15.0,
        "required_arrival_window_hours": 320.0,
        "waypoints": [
            {"name": "Yangtze River Estuary", "lat": 31.23, "lng": 121.50, "distance_to_next": 480.0, "avg_wave_m": 1.4, "wind_kmh": 20.0},
            {"name": "Taiwan Strait", "lat": 24.50, "lng": 119.80, "distance_to_next": 920.0, "avg_wave_m": 2.4, "wind_kmh": 32.0},
            {"name": "South China Sea West", "lat": 12.00, "lng": 112.50, "distance_to_next": 750.0, "avg_wave_m": 2.1, "wind_kmh": 25.0},
            {"name": "Singapore Strait", "lat": 1.30, "lng": 103.80, "distance_to_next": 400.0, "avg_wave_m": 1.0, "wind_kmh": 12.0},
            {"name": "Malacca Strait North", "lat": 5.40, "lng": 98.60, "distance_to_next": 1120.0, "avg_wave_m": 1.5, "wind_kmh": 18.0},
            {"name": "Bay of Bengal Crossing", "lat": 8.00, "lng": 83.00, "distance_to_next": 650.0, "avg_wave_m": 2.6, "wind_kmh": 30.0},
            {"name": "Cape Comorin (Kanyakumari)", "lat": 8.10, "lng": 77.55, "distance_to_next": 600.0, "avg_wave_m": 2.0, "wind_kmh": 24.0},
            {"name": "JNPT Mumbai Anchorage", "lat": 18.95, "lng": 72.95, "distance_to_next": 0.0, "avg_wave_m": 1.2, "wind_kmh": 16.0}
        ]
    },
    "RST_ROT": {
        "id": "RST_ROT",
        "name": "Ras Tanura (SARST) → Rotterdam (NLRTM)",
        "origin": "Ras Tanura",
        "destination": "Rotterdam",
        "distance_nm": 6450.0,
        "max_draft_m": 21.0,  # VLCC Tanker Route
        "required_arrival_window_hours": 460.0,
        "waypoints": [
            {"name": "Ras Tanura Terminal", "lat": 26.65, "lng": 50.15, "distance_to_next": 310.0, "avg_wave_m": 0.9, "wind_kmh": 16.0},
            {"name": "Strait of Hormuz", "lat": 26.50, "lng": 56.40, "distance_to_next": 520.0, "avg_wave_m": 1.4, "wind_kmh": 22.0},
            {"name": "Gulf of Oman", "lat": 23.50, "lng": 59.80, "distance_to_next": 840.0, "avg_wave_m": 1.8, "wind_kmh": 24.0},
            {"name": "Gulf of Aden", "lat": 13.00, "lng": 48.00, "distance_to_next": 620.0, "avg_wave_m": 2.0, "wind_kmh": 26.0},
            {"name": "Bab-el-Mandeb Strait", "lat": 12.60, "lng": 43.40, "distance_to_next": 1140.0, "avg_wave_m": 1.8, "wind_kmh": 22.0},
            {"name": "Suez Canal South", "lat": 27.80, "lng": 34.30, "distance_to_next": 280.0, "avg_wave_m": 0.8, "wind_kmh": 15.0},
            {"name": "Mediterranean Crossing", "lat": 34.50, "lng": 24.00, "distance_to_next": 1200.0, "avg_wave_m": 1.7, "wind_kmh": 25.0},
            {"name": "Strait of Gibraltar", "lat": 35.95, "lng": -5.60, "distance_to_next": 780.0, "avg_wave_m": 2.0, "wind_kmh": 28.0},
            {"name": "English Channel", "lat": 49.80, "lng": -3.20, "distance_to_next": 760.0, "avg_wave_m": 2.8, "wind_kmh": 34.0},
            {"name": "Rotterdam Europort", "lat": 51.95, "lng": 4.14, "distance_to_next": 0.0, "avg_wave_m": 1.2, "wind_kmh": 18.0}
        ]
    }
}


def evaluate_voyage_cost(speeds_knots: List[float], corridor: Dict[str, Any],
                         vessel_type: str = "CONTAINER_15000TEU",
                         fuel_type: str = "VLSFO",
                         arrival_penalty_per_hour: float = 2500.0) -> Dict[str, Any]:
    """
    Multi-objective cost function evaluated during optimization:
    J = Fuel Cost ($) + Carbon Tax ($) + Demurrage Penalty ($)
    """
    from core.hydrodynamics import HydrodynamicModel, FUEL_PROPERTIES

    hydro = HydrodynamicModel(vessel_type=vessel_type)
    waypoints = corridor["waypoints"]
    n_legs = len(waypoints) - 1

    total_distance_nm = 0.0
    total_hours = 0.0
    total_fuel_mt = 0.0
    total_co2_wtw_mt = 0.0
    leg_details = []

    for i in range(n_legs):
        wp = waypoints[i]
        dist = wp["distance_to_next"]
        speed = speeds_knots[i] if i < len(speeds_knots) else 15.0
        wave_h = wp.get("avg_wave_m", 1.5)
        wind_k = wp.get("wind_kmh", 20.0)

        leg_res = hydro.calculate_fuel_consumption(
            speed_knots=speed,
            distance_nm=dist,
            wave_height_m=wave_h,
            wind_speed_kmh=wind_k,
            fuel_type=fuel_type
        )

        total_distance_nm += dist
        total_hours += leg_res["hours"]
        total_fuel_mt += leg_res["fuel_mt"]
        total_co2_wtw_mt += leg_res["co2_wtw_mt"]
        leg_details.append(leg_res)

    props = FUEL_PROPERTIES.get(fuel_type.upper(), FUEL_PROPERTIES["VLSFO"])
    fuel_cost_usd = total_fuel_mt * props["cost_per_mt"]
    carbon_tax_usd = total_co2_wtw_mt * 80.0  # $80/ton CO2e

    # Port arrival constraint penalty
    max_allowed_hours = corridor.get("required_arrival_window_hours", 500.0)
    delay_hours = max(0.0, total_hours - max_allowed_hours)
    delay_penalty_usd = delay_hours * arrival_penalty_per_hour

    # Multi-Objective aggregate cost
    total_cost_usd = fuel_cost_usd + carbon_tax_usd + delay_penalty_usd

    # IMO CII calculation
    cii_res = hydro.calculate_cii_score(total_fuel_mt, total_distance_nm, fuel_type)

    return {
        "total_cost_usd": round(total_cost_usd, 2),
        "fuel_cost_usd": round(fuel_cost_usd, 2),
        "carbon_tax_usd": round(carbon_tax_usd, 2),
        "delay_penalty_usd": round(delay_penalty_usd, 2),
        "total_fuel_mt": round(total_fuel_mt, 2),
        "total_co2_wtw_mt": round(total_co2_wtw_mt, 2),
        "total_hours": round(total_hours, 2),
        "total_days": round(total_hours / 24.0, 2),
        "delay_hours": round(delay_hours, 2),
        "attained_cii": cii_res["attained_cii"],
        "cii_grade": cii_res["grade"],
        "is_cii_compliant": cii_res["is_compliant"],
        "mean_speed_knots": round(sum(speeds_knots) / max(1, len(speeds_knots)), 2),
        "speeds_knots": [round(s, 2) for s in speeds_knots],
        "leg_details": leg_details
    }
