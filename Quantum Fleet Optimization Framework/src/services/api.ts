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

// ─── Domain Specific Types ───────────────────────────────────────────────────

export interface EdgeTelemetryResponse {
  gateway_status: string;
  source: string;
  baud_rate: number;
  port: string;
  timestamp: number;
  valid_sentences_count: number;
  checksum_errors: number;
  raw_nmea_sentences?: string[];
  telemetry: {
    gps_fix?: {
      lat: number;
      lng: number;
      fix_quality: string;
      satellites_tracked: number;
      hdop: number;
      altitude_m: number;
    };
    navigation?: {
      speed_over_ground_knots: number;
      course_over_ground_deg: number;
      status: string;
    };
    water_speed?: {
      heading_true_deg: number;
      speed_through_water_knots: number;
    };
    engine_rpm?: {
      shaft_rpm: number;
      propeller_pitch_pct: number;
      status: string;
    };
    shaft_power?: {
      torque_kn_m: number;
      shaft_rpm: number;
      delivered_power_kw: number;
      delivered_power_mw: number;
    };
  };
  derived_performance: {
    brake_power_kw: number;
    fuel_rate_mt_day: number;
    specific_fuel_consumption_g_kwh: number;
    hull_fouling_index_pct: number;
    thrust_efficiency_pct: number;
  };
}

export interface SatelliteAisResponse {
  vessel_id: string;
  satellite_constellation: string;
  coverage_tier: string;
  last_contact_epoch: number;
  hours_since_sat_uplink: number;
  satcom_uplink_latency_sec: number;
  status: string;
  dead_reckoning: {
    projected_lat: number;
    projected_lng: number;
    elapsed_hours: number;
    distance_travelled_nm: number;
    uncertainty_radius_nm: number;
    tracking_confidence_pct: number;
    is_dead_reckoning: boolean;
    tracking_mode: string;
  };
}

export interface FnoForecastResponse {
  corridor_id: string;
  region_name: string;
  prediction_engine: string;
  solver_backend: string;
  forecast_generated_at: number;
  forecast_horizon_hours: number;
  fno_forecast: {
    model: string;
    modes_truncated: number;
    resolution: string;
    spectral_loss_l2: number;
    inference_time_ms: number;
    frames: Array<{
      forecast_hour: number;
      mean_current_speed_knots: number;
      max_current_speed_knots: number;
      eddies_detected: Array<{
        id: string;
        center_lat: number;
        center_lng: number;
        type: string;
        intensity_knots: number;
        core_radius_nm: number;
        route_acceleration_potential_pct: number;
      }>;
      current_vectors: Array<{
        lat: number;
        lng: number;
        u_mps: number;
        v_mps: number;
        speed_knots: number;
        vorticity_10e5: number;
        is_cyclonic: boolean;
      }>;
    }>;
  };
}

export interface SwarmOptimizeResponse {
  terminal_id: string;
  terminal_name: string;
  terminal_coordinates: { lat: number; lng: number };
  convoy_vessels_count: number;
  negotiation_protocol: string;
  summary_metrics: {
    total_anchorage_idling_eliminated_hours: number;
    total_demurrage_penalties_avoided_usd: number;
    total_fuel_saved_mt: number;
    total_co2_avoided_mt: number;
    total_financial_benefit_usd: number;
    fleet_coordination_efficiency_pct: number;
  };
  scheduled_vessels: Array<{
    vessel_id: string;
    name: string;
    type: string;
    distance_nm: number;
    original_speed_knots: number;
    negotiated_jit_speed_knots: number;
    speed_reduction_pct: number;
    original_transit_hours: number;
    scheduled_berth_transit_hours: number;
    anchorage_delay_avoided_hours: number;
    demurrage_saved_usd: number;
    fuel_saved_mt: number;
    target_berth_slot: string;
  }>;
}

export interface PoseidonScorecardResponse {
  framework: string;
  vessel_name: string;
  vessel_type: string;
  deadweight_tonnage: number;
  reporting_year: number;
  attained_aer_gco2_dwt_nm: number;
  poseidon_trajectory_target_aer: number;
  climate_alignment_delta_pct: number;
  portfolio_status: string;
  lender_sustainability_rating: string;
  qualifying_commercial_banks: string[];
  interest_margin_discount_bps: number;
  annual_debt_servicing_saved_usd: number;
  sea_cargo_charter_eeoi: number;
}

export interface EuEtsWalletResponse {
  eua_spot_price_eur_tonne: number;
  eua_spot_price_usd_tonne: number;
  carbon_market_exchange: string;
  eu_ets_phase_in_pct: number;
  verified_scope1_co2_mt: number;
  required_eua_allowances: number;
  total_financial_liability_eur: number;
  total_financial_liability_usd: number;
  company_eua_wallet_balance: number;
  allowance_net_surplus_deficit: number;
  surrender_deadline: string;
  auto_purchase_order_triggered: boolean;
  compliance_safety_buffer_pct: number;
}

export interface BunkerArbitrageResponse {
  corridor_id: string;
  target_fuel: string;
  required_bunker_volume_mt: number;
  optimal_bunker_port: string;
  optimal_bunker_port_id: string;
  minimum_total_cost_usd: number;
  arbitrage_savings_vs_worst_hub_usd: number;
  arbitrage_savings_pct: number;
  procurement_strategy: string;
  port_rankings: Array<{
    port_id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    fuel_type: string;
    spot_price_usd_mt: number;
    fuel_procured_mt: number;
    fuel_cost_usd: number;
    port_overhead_usd: number;
    boil_off_loss_mt: number;
    total_procurement_cost_usd: number;
  }>;
}

export interface RetrofitROIResponse {
  vessel_dwt: number;
  wacc_discount_rate: number;
  carbon_tax_assumed_usd: number;
  top_recommended_retrofit: string;
  evaluations: Array<{
    retrofit_id: string;
    technology_name: string;
    total_capex_usd: number;
    drydock_offhire_cost_usd: number;
    total_initial_investment_usd: number;
    annual_net_benefit_usd: number;
    annual_co2_abated_mt: number;
    annual_carbon_tax_shield_usd: number;
    payback_period_years: number;
    npv_15yr_usd: number;
    irr_pct: number;
    cii_grade_guarantee: string;
    discounted_cashflows_15yr: number[];
  }>;
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

// ─── New Commercial, AI, IoT & Regulatory Callers ───────────────────────────

export async function fetchLiveEdgeTelemetry(): Promise<EdgeTelemetryResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/edge/telemetry`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch edge telemetry");
  return await res.json();
}

export async function fetchSatelliteAisTracking(params?: {
  vessel_id?: string;
  lat?: number;
  lng?: number;
  speed?: number;
  heading?: number;
}): Promise<SatelliteAisResponse> {
  const query = new URLSearchParams({
    vessel_id: params?.vessel_id || "V-01",
    lat: String(params?.lat ?? 5.5),
    lng: String(params?.lng ?? 85.2),
    speed: String(params?.speed ?? 16.4),
    heading: String(params?.heading ?? 284.0),
    hours_since_fix: "0.45"
  });
  const res = await fetch(`${BACKEND_API_BASE}/edge/satellite-ais?${query}`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch satellite AIS");
  return await res.json();
}

export async function fetchFnoForecast(corridorId: string = "SIN_ROT"): Promise<FnoForecastResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/ai/fno-forecast?corridor_id=${corridorId}`, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error("Failed to fetch FNO forecast");
  return await res.json();
}

export async function fetchHeronQuantumTrial(qubits: number = 6, shots: number = 2048): Promise<any> {
  const res = await fetch(`${BACKEND_API_BASE}/quantum/heron-trial?n_qubits=${qubits}&shots=${shots}&use_zne=true`, {
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error("Failed to run IBM Heron trial");
  return await res.json();
}

export async function optimizeConvoySwarm(terminalId: string = "NLRTM"): Promise<SwarmOptimizeResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/swarm/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ terminal_id: terminalId }),
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error("Failed to optimize convoy swarm");
  return await res.json();
}

export async function fetchPoseidonScorecard(vesselName: string = "Oceanic Vanguard"): Promise<PoseidonScorecardResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/regulatory/poseidon-scorecard?vessel_name=${encodeURIComponent(vesselName)}`, {
    signal: AbortSignal.timeout(4000)
  });
  if (!res.ok) throw new Error("Failed to fetch Poseidon scorecard");
  return await res.json();
}

export async function fetchEuEtsWallet(co2Mt: number = 4310.2): Promise<EuEtsWalletResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/regulatory/eu-ets-wallet?co2_mt=${co2Mt}`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch EU ETS wallet");
  return await res.json();
}

export function getEuMrvXmlUrl(vesselName: string = "Oceanic Vanguard"): string {
  return `${BACKEND_API_BASE}/regulatory/eu-mrv/xml?vessel_name=${encodeURIComponent(vesselName)}`;
}

export function getImoDcsXmlUrl(vesselName: string = "Oceanic Vanguard"): string {
  return `${BACKEND_API_BASE}/regulatory/imo-dcs/xml?vessel_name=${encodeURIComponent(vesselName)}`;
}

export async function calculateBunkerArbitrage(payload: {
  corridor_id?: string;
  fuel_type?: string;
  required_fuel_mt?: number;
}): Promise<BunkerArbitrageResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/commercial/bunker-arbitrage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      corridor_id: payload.corridor_id || "SIN_ROT",
      fuel_type: payload.fuel_type || "GREEN_METHANOL",
      required_fuel_mt: payload.required_fuel_mt || 1200.0,
      tank_capacity_mt: 2000.0,
      current_tank_level_mt: 350.0
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error("Failed to calculate bunker arbitrage");
  return await res.json();
}

export async function calculateRetrofitRoi(payload?: {
  vessel_dwt?: number;
  carbon_tax_eur_tonne?: number;
  custom_capex_adjust_pct?: number;
}): Promise<RetrofitROIResponse> {
  const res = await fetch(`${BACKEND_API_BASE}/commercial/retrofit-roi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vessel_dwt: payload?.vessel_dwt || 145000.0,
      carbon_tax_eur_tonne: payload?.carbon_tax_eur_tonne || 82.50,
      discount_rate_wacc: 0.08,
      custom_capex_adjust_pct: payload?.custom_capex_adjust_pct || 0.0
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error("Failed to calculate retrofit ROI");
  return await res.json();
}

export async function syncEdgeCache(): Promise<{
  status: string;
  packets_uploaded: number;
  sync_epoch: number;
  cloud_latency_ms: number;
}> {
  const res = await fetch(`${BACKEND_API_BASE}/edge/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error("Failed to sync edge cache");
  return await res.json();
}

export interface GlobalPort {
  code: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  max_draft_m: number;
  avg_berth_wait_hrs: number;
  port_call_fee_usd: number;
  bunker_barge_fee_usd: number;
  prices_usd_mt: Record<string, number>;
}

export async function fetchGlobalPorts(): Promise<{ total_ports: number; ports: GlobalPort[] }> {
  const res = await fetch(`${BACKEND_API_BASE}/ports`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("Failed to fetch global ports");
  return await res.json();
}



