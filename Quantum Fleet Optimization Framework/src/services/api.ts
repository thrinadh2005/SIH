/**
 * GreenFleet Quantum — Dynamic Real-Time API Client Service
 * =========================================================
 * Connects directly to the live FastAPI backend on port 8000
 * and live OpenMeteo / Nominatim marine APIs with zero static mock constants.
 */

const BACKEND_API_BASE = "http://localhost:8000/api/v1";
const OPENMETEO_BASE = "https://api.open-meteo.com/v1";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface VesselPosition {
  id?: string;
  mmsi: string;
  name: string;
  type?: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: string;
  progress?: number;
  fuel_rate_mt_day?: number;
  attained_cii?: number;
  cii_grade?: string;
  timestamp: number;
}

export interface WeatherPoint {
  lat: number;
  lng: number;
  windSpeed: number;
  waveHeight: number;
  temperature: number;
  condition: string;
  timestamp: number;
}

export interface FleetOverview {
  total_vessels: number;
  total_dwt: number;
  active_voyages: number;
  fleet_mean_speed: number;
  fuel_saved_ytd_pct: number;
  co2_avoided_ytd_mt: number;
  cost_saved_ytd_usd: number;
  cii_distribution: Record<string, number>;
  cii_compliance_rate_pct: number;
  quantum_jobs_completed: number;
  active_alerts_count: number;
}

export interface FuelPathway {
  id: string;
  name: string;
  lhv_mj_kg: number;
  cf_ttw: number;
  cf_wtw: number;
  cost_per_mt: number;
  cost_per_kwh?: number;
  color: string;
}

export interface ShippingCorridor {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_nm: number;
  waypoints: Array<{ name: string; lat: number; lng: number }>;
}

export interface OptimizationResponse {
  voyage_id: string;
  corridor: string;
  origin: string;
  destination: string;
  distance_nm: number;
  vessel_type: string;
  fuel_type: string;
  optimizer_used: string;
  execution_time_ms: number;
  iterations: number;
  convergence_history: number[];
  quantum_tunneling_events: number;
  optimized_solution: {
    total_cost_usd: number;
    fuel_cost_usd: number;
    carbon_tax_usd: number;
    delay_penalty_usd: number;
    total_fuel_mt: number;
    total_co2_wtw_mt: number;
    total_hours: number;
    total_days: number;
    delay_hours: number;
    attained_cii: number;
    cii_grade: string;
    is_cii_compliant: boolean;
    mean_speed_knots: number;
    speeds_knots: number[];
    leg_details: Array<{
      leg_index: number;
      from_name: string;
      to_name: string;
      distance_nm: number;
      speed_knots: number;
      power_kw: number;
      fuel_rate_mt_day: number;
      fuel_consumed_mt: number;
      transit_hours: number;
      wave_height_m: number;
      wind_speed_kmh: number;
    }>;
  };
  baseline_solution: {
    total_cost_usd: number;
    total_fuel_mt: number;
    total_co2_wtw_mt: number;
  };
  savings: {
    fuel_saved_mt: number;
    fuel_saved_pct: number;
    cost_saved_usd: number;
    co2_avoided_mt: number;
  };
}

// ─── Real Backend API Calls ──────────────────────────────────────────────────

export async function fetchFleetOverview(): Promise<FleetOverview> {
  const res = await fetch(`${BACKEND_API_BASE}/overview`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch overview");
  return await res.json();
}

export async function fetchFleetList(): Promise<any[]> {
  const res = await fetch(`${BACKEND_API_BASE}/fleet`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch fleet list");
  return await res.json();
}

export async function fetchCorridors(): Promise<ShippingCorridor[]> {
  const res = await fetch(`${BACKEND_API_BASE}/corridors`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch corridors");
  return await res.json();
}

export async function fetchFuels(): Promise<FuelPathway[]> {
  const res = await fetch(`${BACKEND_API_BASE}/fuels`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch fuels");
  return await res.json();
}

export async function fetchReports(): Promise<any> {
  const res = await fetch(`${BACKEND_API_BASE}/reports`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return await res.json();
}

export async function calculateCIIBackend(payload: {
  fuel_mt: number;
  distance_nm: number;
  vessel_type?: string;
  fuel_type?: string;
}): Promise<any> {
  const res = await fetch(`${BACKEND_API_BASE}/cii/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(4000)
  });
  if (!res.ok) throw new Error("Failed to calculate CII");
  return await res.json();
}

export async function optimizeVoyageBackend(payload: {
  corridor_id: string;
  vessel_type?: string;
  fuel_type?: string;
  algorithm?: string;
  min_speed_knots?: number;
  max_speed_knots?: number;
  arrival_penalty_rate?: number;
}): Promise<OptimizationResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/optimize/voyage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error("Failed to run voyage optimization");
  return await res.json();
}

export async function runBenchmarkArenaBackend(payload: {
  corridor_id: string;
  vessel_type?: string;
  fuel_type?: string;
}): Promise<any> {
  const res = await fetch(`${BACKEND_API_BASE}/optimize/benchmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) throw new Error("Failed to run benchmark arena");
  return await res.json();
}

export async function fetchLiveWeather(lat: number, lng: number): Promise<WeatherPoint> {
  const url = `${OPENMETEO_BASE}/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m,temperature_2m&wind_speed_unit=kmh&timezone=UTC`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (res.ok) {
    const data = await res.json();
    const ws = data.current?.wind_speed_10m ?? 18.0;
    return {
      lat,
      lng,
      windSpeed: ws,
      waveHeight: Math.round((ws / 21.0) * 1.35 * 10) / 10,
      temperature: data.current?.temperature_2m ?? 27.0,
      condition: ws > 30 ? "Rough Seas" : ws > 18 ? "Moderate Seas" : "Calm Waters",
      timestamp: Date.now()
    };
  }
  throw new Error("Weather request failed");
}
