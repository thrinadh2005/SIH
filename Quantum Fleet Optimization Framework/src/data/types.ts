/**
 * GreenFleet Quantum (SIH-26138) - Common Frontend Domain Types
 */

export interface Vessel {
  id: string;
  mmsi: string;
  imo: string;
  name: string;
  type: string;
  vessel_type_key: string;
  dwt: number;
  displacement: number;
  corridor: string;
  route_name: string;
  progress: number;
  speed: number;
  lat: number;
  lng: number;
  heading: number;
  status: "optimized" | "normal" | "at-risk" | "optimization-running" | "offline";
  fuel_type: string;
  fuel_rate_mt_day: number;
  attained_cii: number;
  cii_grade: "A" | "B" | "C" | "D" | "E";
  power_kw: number;
  engine_load_pct: number;
  eta: string;
}

export interface Corridor {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_nm: number;
  waypoints: Array<{ name: string; lat: number; lng: number }>;
}

export interface FuelPathwayInfo {
  id: string;
  name: string;
  lhv_mj_kg: number;
  cf_ttw: number;
  cf_wtw: number;
  cost_per_mt: number;
  color: string;
}
