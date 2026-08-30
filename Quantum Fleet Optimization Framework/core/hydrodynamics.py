"""
Hydrodynamic Physics Engine & Multi-Fuel Lifecycle Decarbonization Model
========================================================================
Implements the Admiralty Law calm-water cubic power formulation, empirical
added wave resistance, aerodynamic wind drag, and IMO 4th GHG Well-to-Wake (WtW)
lifecycle carbon emission factors.
"""

import math
from typing import Dict, Any, List, Optional

# Constants
RHO_SEAWATER = 1025.0  # kg/m^3
RHO_AIR = 1.225        # kg/m^3
GRAVITY = 9.80665      # m/s^2

# IMO 4th GHG & DNV Maritime Forecast 2025 Fuel Emission Factors & LHV
FUEL_PROPERTIES: Dict[str, Dict[str, float]] = {
    "VLSFO": {
        "lhv_mj_kg": 40.4,
        "cf_ttw": 3.114,       # Tank-to-Wake CO2 factor (t-CO2 / t-fuel)
        "cf_wtw": 3.206,       # Well-to-Wake CO2e factor (t-CO2e / t-fuel)
        "cost_per_mt": 620.0,  # USD / MT
        "base_sfoc_g_kwh": 172.0,
    },
    "LNG": {
        "lhv_mj_kg": 48.0,
        "cf_ttw": 2.750,
        "cf_wtw": 2.850,       # Includes methane slip in modern 2-stroke engines
        "cost_per_mt": 710.0,
        "base_sfoc_g_kwh": 145.0,
    },
    "METHANOL": {
        "lhv_mj_kg": 19.7,
        "cf_ttw": 1.375,       # Biogenic / green methanol
        "cf_wtw": 0.150,       # Net lifecycle WtW when produced via green H2 + DAC
        "cost_per_mt": 890.0,
        "base_sfoc_g_kwh": 350.0,
    },
    "AMMONIA": {
        "lhv_mj_kg": 18.6,
        "cf_ttw": 0.000,       # Zero carbon direct combustion
        "cf_wtw": 0.050,       # Green ammonia lifecycle emissions
        "cost_per_mt": 980.0,
        "base_sfoc_g_kwh": 375.0,
    },
    "HYDROGEN": {
        "lhv_mj_kg": 120.0,
        "cf_ttw": 0.000,
        "cf_wtw": 0.000,
        "cost_per_mt": 3500.0,
        "base_sfoc_g_kwh": 60.0,
    },
    "SHORE_POWER": {
        "lhv_mj_kg": 3.6,      # 1 kWh = 3.6 MJ
        "cf_ttw": 0.000,
        "cf_wtw": 0.380,       # Grid average kg CO2e / kWh
        "cost_per_kwh": 0.16,  # USD / kWh
        "base_sfoc_g_kwh": 0.0,
    }
}

# Standard Vessel Registry Profiles
VESSEL_TYPES: Dict[str, Dict[str, Any]] = {
    "VLCC": {
        "dwt": 298000.0,
        "displacement": 340000.0,
        "length_pp": 330.0,
        "beam": 60.0,
        "design_draft": 21.0,
        "mcr_kw": 32000.0,
        "admiralty_coef": 0.0034,
        "transverse_area": 1150.0,
        "c_drag_wind": 0.85,
        "c_wave": 42.0,
        "default_fuel": "VLSFO",
    },
    "PANAMAX": {
        "dwt": 74000.0,
        "displacement": 89000.0,
        "length_pp": 225.0,
        "beam": 32.2,
        "design_draft": 14.2,
        "mcr_kw": 14000.0,
        "admiralty_coef": 0.0038,
        "transverse_area": 620.0,
        "c_drag_wind": 0.80,
        "c_wave": 38.0,
        "default_fuel": "VLSFO",
    },
    "AFRAMAX": {
        "dwt": 115000.0,
        "displacement": 135000.0,
        "length_pp": 245.0,
        "beam": 42.0,
        "design_draft": 15.0,
        "mcr_kw": 18000.0,
        "admiralty_coef": 0.0036,
        "transverse_area": 780.0,
        "c_drag_wind": 0.82,
        "c_wave": 40.0,
        "default_fuel": "VLSFO",
    },
    "CAPESIZE": {
        "dwt": 178000.0,
        "displacement": 210000.0,
        "length_pp": 290.0,
        "beam": 45.0,
        "design_draft": 18.0,
        "mcr_kw": 22000.0,
        "admiralty_coef": 0.0035,
        "transverse_area": 950.0,
        "c_drag_wind": 0.84,
        "c_wave": 41.0,
        "default_fuel": "VLSFO",
    },
    "CONTAINER_15000TEU": {
        "dwt": 145000.0,
        "displacement": 175000.0,
        "length_pp": 366.0,
        "beam": 51.2,
        "design_draft": 15.5,
        "mcr_kw": 58000.0,
        "admiralty_coef": 0.0042,
        "transverse_area": 1400.0,
        "c_drag_wind": 0.90,
        "c_wave": 45.0,
        "default_fuel": "VLSFO",
    }
}


class HydrodynamicModel:
    """
    Computes calm water resistance, added wave drag, wind resistance,
    total required shaft power, hourly/daily fuel burn, and lifecycle emissions.
    """

    def __init__(self, vessel_type: str = "CONTAINER_15000TEU", custom_specs: Optional[Dict[str, Any]] = None):
        self.vessel_type = vessel_type
        self.specs = VESSEL_TYPES.get(vessel_type, VESSEL_TYPES["CONTAINER_15000TEU"]).copy()
        if custom_specs:
            self.specs.update(custom_specs)

    def calculate_calm_water_power(self, speed_knots: float, draft_ratio: float = 0.90) -> float:
        """
        Admiralty Law Formulation:
        P_calm (kW) = c_1 * Delta^(2/3) * v^3 * draft_factor
        """
        displacement = self.specs["displacement"]
        c1 = self.specs["admiralty_coef"]
        v = max(0.5, speed_knots)
        calm_power = c1 * (displacement ** (2.0 / 3.0)) * (v ** 3) * (0.5 + 0.5 * draft_ratio)
        return float(calm_power)

    def calculate_added_wave_power(self, speed_knots: float, wave_height_m: float, wave_angle_deg: float = 0.0) -> float:
        """
        Empirical Added Wave Resistance:
        Delta_P_wave (kW) = c_wave * (Hs^2) * (Delta / 100000) * (v / 14.0) * wave_direction_factor
        wave_angle_deg: 0 = head sea (max drag), 90 = beam sea, 180 = following sea
        """
        hs = max(0.1, wave_height_m)
        v = max(0.5, speed_knots)
        displacement = self.specs["displacement"]
        c_wave = self.specs["c_wave"]

        # Angle factor: head sea = 1.0, following sea = 0.25
        rad = math.radians(wave_angle_deg)
        dir_factor = 0.625 + 0.375 * math.cos(rad)

        wave_power = c_wave * (hs ** 2) * (displacement / 100000.0) * (v / 14.0) * dir_factor
        return float(max(0.0, wave_power))

    def calculate_added_wind_power(self, speed_knots: float, wind_speed_kmh: float, wind_angle_deg: float = 0.0) -> float:
        """
        Aerodynamic Wind Resistance:
        Delta_P_wind (kW) = 0.5 * rho_air * C_drag * A_trans * (V_apparent)^2 * V_vessel
        """
        v_vessel_ms = speed_knots * 0.514444
        v_wind_ms = wind_speed_kmh / 3.6
        rad = math.radians(wind_angle_deg)

        # Apparent wind calculation
        v_app_x = v_vessel_ms + v_wind_ms * math.cos(rad)
        v_app_y = v_wind_ms * math.sin(rad)
        v_apparent_ms = math.sqrt(v_app_x ** 2 + v_app_y ** 2)

        rho_air = RHO_AIR
        c_drag = self.specs["c_drag_wind"]
        a_trans = self.specs["transverse_area"]

        force_wind_n = 0.5 * rho_air * c_drag * a_trans * (v_apparent_ms ** 2) * math.cos(math.atan2(v_app_y, v_app_x))
        wind_power_kw = (force_wind_n * v_vessel_ms) / 1000.0

        # Tailwind can assist (reduce power), capped at -15% of calm power
        return float(wind_power_kw)

    def calculate_total_power(self, speed_knots: float, wave_height_m: float = 1.5,
                              wave_angle_deg: float = 0.0, wind_speed_kmh: float = 20.0,
                              wind_angle_deg: float = 0.0, draft_ratio: float = 0.90) -> Dict[str, float]:
        """
        Calculates total required propulsion power (kW) clamped to MCR limits.
        """
        p_calm = self.calculate_calm_water_power(speed_knots, draft_ratio)
        p_wave = self.calculate_added_wave_power(speed_knots, wave_height_m, wave_angle_deg)
        p_wind = self.calculate_added_wind_power(speed_knots, wind_speed_kmh, wind_angle_deg)

        total_kw = max(800.0, p_calm + p_wave + p_wind)
        mcr_kw = self.specs["mcr_kw"]
        total_kw = min(total_kw, mcr_kw * 1.05)  # 105% MCR peak limit
        load_pct = (total_kw / mcr_kw) * 100.0

        return {
            "calm_power_kw": round(p_calm, 2),
            "wave_power_kw": round(p_wave, 2),
            "wind_power_kw": round(p_wind, 2),
            "total_power_kw": round(total_kw, 2),
            "engine_load_pct": round(load_pct, 2)
        }

    def get_sfoc(self, engine_load_pct: float, fuel_type: str = "VLSFO") -> float:
        """
        Non-linear SFOC curve: Engine is most efficient between 70% and 85% MCR.
        Higher SFOC at low load (<40%) or extreme overload (>95%).
        """
        props = FUEL_PROPERTIES.get(fuel_type.upper(), FUEL_PROPERTIES["VLSFO"])
        base_sfoc = props["base_sfoc_g_kwh"]

        # Empirical parabolic SFOC efficiency curve
        load = max(20.0, min(105.0, engine_load_pct))
        sfoc_multiplier = 1.0 + 0.00015 * ((load - 78.0) ** 2)
        if load < 50.0:
            sfoc_multiplier += 0.08 * ((50.0 - load) / 30.0)

        return float(base_sfoc * sfoc_multiplier)

    def calculate_fuel_consumption(self, speed_knots: float, distance_nm: float,
                                   wave_height_m: float = 1.5, wave_angle_deg: float = 0.0,
                                   wind_speed_kmh: float = 20.0, wind_angle_deg: float = 0.0,
                                   draft_ratio: float = 0.90, fuel_type: str = "VLSFO") -> Dict[str, Any]:
        """
        Calculates fuel burn (MT), hours sailing, and carbon emissions for a leg.
        """
        speed = max(1.0, speed_knots)
        hours = distance_nm / speed
        days = hours / 24.0

        power_dict = self.calculate_total_power(speed, wave_height_m, wave_angle_deg, wind_speed_kmh, wind_angle_deg, draft_ratio)
        total_kw = power_dict["total_power_kw"]
        engine_load_pct = power_dict["engine_load_pct"]

        sfoc = self.get_sfoc(engine_load_pct, fuel_type)
        total_fuel_grams = total_kw * sfoc * hours
        total_fuel_mt = total_fuel_grams / 1e6

        # Clean fuel alias lookup
        raw_key = fuel_type.upper()
        if "METHANOL" in raw_key:
            fuel_key = "METHANOL"
        elif "AMMONIA" in raw_key:
            fuel_key = "AMMONIA"
        elif "HYDROGEN" in raw_key:
            fuel_key = "HYDROGEN"
        elif "SHORE" in raw_key:
            fuel_key = "SHORE_POWER"
        elif "LNG" in raw_key:
            fuel_key = "LNG"
        else:
            fuel_key = "VLSFO"

        props = FUEL_PROPERTIES.get(fuel_key, FUEL_PROPERTIES["VLSFO"])
        co2_ttw_mt = total_fuel_mt * props["cf_ttw"]
        co2_wtw_mt = total_fuel_mt * props["cf_wtw"]
        cost_usd = total_fuel_mt * props["cost_per_mt"]

        # Carbon tax estimate ($80 / ton CO2 under EU ETS / IMO Net-Zero)
        carbon_tax_usd = co2_wtw_mt * 80.0

        return {
            "distance_nm": distance_nm,
            "speed_knots": speed,
            "hours": round(hours, 2),
            "days": round(days, 2),
            "power": power_dict,
            "sfoc_g_kwh": round(sfoc, 2),
            "fuel_mt": round(total_fuel_mt, 3),
            "fuel_rate_mt_day": round(total_fuel_mt / max(0.01, days), 2),
            "co2_ttw_mt": round(co2_ttw_mt, 3),
            "co2_wtw_mt": round(co2_wtw_mt, 3),
            "fuel_cost_usd": round(cost_usd, 2),
            "carbon_tax_usd": round(carbon_tax_usd, 2),
            "total_voyage_cost_usd": round(cost_usd + carbon_tax_usd, 2)
        }

    def calculate_cii_score(self, total_fuel_mt: float, total_distance_nm: float, fuel_type: str = "VLSFO") -> Dict[str, Any]:
        """
        IMO Carbon Intensity Indicator (CII) Rating calculation.
        Attained CII = (CO2 emitted in grams) / (DWT * Distance in NM)
        """
        props = FUEL_PROPERTIES.get(fuel_type.upper(), FUEL_PROPERTIES["VLSFO"])
        co2_grams = total_fuel_mt * props["cf_ttw"] * 1e6
        dwt = self.specs["dwt"]
        dist = max(1.0, total_distance_nm)

        attained_cii = co2_grams / (dwt * dist)

        # IMO 2026 Reference line thresholds for vessel capacity
        # Grade A < 5.5, B < 6.5, C < 7.5 (Compliant boundary), D < 8.5, E >= 8.5
        if attained_cii <= 5.5:
            grade = "A"
            rating = "Major Superior"
            color = "#10b981"
        elif attained_cii <= 6.5:
            grade = "B"
            rating = "Minor Superior"
            color = "#06b6d4"
        elif attained_cii <= 7.5:
            grade = "C"
            rating = "Moderate / Compliant"
            color = "#eab308"
        elif attained_cii <= 8.5:
            grade = "D"
            rating = "Inferior (Corrective Plan Required)"
            color = "#f97316"
        else:
            grade = "E"
            rating = "Unacceptable (Sanctions / Port Ban)"
            color = "#ef4444"

        return {
            "attained_cii": round(attained_cii, 3),
            "grade": grade,
            "rating_description": rating,
            "color": color,
            "is_compliant": grade in ["A", "B", "C"],
            "dwt": dwt,
            "distance_nm": dist,
            "co2_grams_total": round(co2_grams, 1),
            "required_cii_ref_2026": 7.50
        }
