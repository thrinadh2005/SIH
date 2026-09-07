import { useState, useEffect } from "react"
import {
  Check,
  ChevronRight,
  Navigation,
  Ship,
  Fuel,
  Zap,
  RefreshCw,
  Layers,
  ShieldCheck,
  MapPin,
  Sliders,
  ArrowRight,
  Compass,
  Wind,
  Clock,
  Award,
  DollarSign,
  Waves
} from "lucide-react"
import {
  fetchCorridors,
  fetchFleetList,
  fetchFuels,
  ShippingCorridor,
  FuelPathway,
} from "../services/api"

interface Props {
  onNavigate: (id: string) => void
}

interface PlanTemplate {
  id: string
  name: string
  code: string
  badge: string
  color: string
  algorithm: string
  fuelType: string
  fuelWeight: number
  carbonWeight: number
  delayWeight: number
  minSpeed: number
  maxSpeed: number
  description: string
  highlights: string
}

const PLAN_PRESETS: PlanTemplate[] = [
  {
    id: "plan-alpha",
    name: "Plan Alpha · Quantum HQOA",
    code: "HQOA-156Q",
    badge: "GLOBAL OPTIMUM",
    color: "#10b981",
    algorithm: "hybrid_hqoa",
    fuelType: "green_methanol",
    fuelWeight: 0.45,
    carbonWeight: 0.35,
    delayWeight: 0.20,
    minSpeed: 12.0,
    maxSpeed: 18.5,
    description: "Multi-qubit Hamiltonian Pareto optimal leveraging Copernicus ocean current meander capture.",
    highlights: "−16.8% Fuel · IMO Grade A · 156Q ZNE"
  },
  {
    id: "plan-beta",
    name: "Plan Beta · Quantum QPSO",
    code: "QPSO-SWARM",
    badge: "WEATHER & SAFETY",
    color: "#0284c7",
    algorithm: "quantum_pso",
    fuelType: "lng",
    fuelWeight: 0.35,
    carbonWeight: 0.25,
    delayWeight: 0.40,
    minSpeed: 10.5,
    maxSpeed: 16.5,
    description: "Dynamic wave swell avoidance minimizing hull fatigue and severe sea state resistance.",
    highlights: "Hs < 2.5m · Hull Fatigue −34% · Safe Pass"
  },
  {
    id: "plan-gamma",
    name: "Plan Gamma · Quantum QGA",
    code: "QGA-JIT",
    badge: "JIT SCHEDULE",
    color: "#a855f7",
    algorithm: "quantum_ga",
    fuelType: "vlsfo",
    fuelWeight: 0.30,
    carbonWeight: 0.20,
    delayWeight: 0.50,
    minSpeed: 14.0,
    maxSpeed: 21.0,
    description: "Strict port arrival window lock minimizing costly demurrage and canal queueing.",
    highlights: "Zero Demurrage · JIT Window · +1.4kn"
  },
  {
    id: "plan-delta",
    name: "Plan Delta · IMO DCS Class-A",
    code: "IMO-DECARB",
    badge: "ULTRA ECO",
    color: "#06b6d4",
    algorithm: "hybrid_hqoa",
    fuelType: "bio_methanol",
    fuelWeight: 0.20,
    carbonWeight: 0.70,
    delayWeight: 0.10,
    minSpeed: 11.5,
    maxSpeed: 16.0,
    description: "Well-to-Wake zero carbon strategy maximizing IMO CII score and eliminating EU ETS taxes.",
    highlights: "IMO Grade A+ · ETS €0 · CO₂ −68%"
  },
  {
    id: "plan-epsilon",
    name: "Plan Epsilon · Classical Baseline",
    code: "BASE-REF",
    badge: "BENCHMARK REF",
    color: "#64748b",
    algorithm: "classical_baseline",
    fuelType: "vlsfo",
    fuelWeight: 0.50,
    carbonWeight: 0.10,
    delayWeight: 0.40,
    minSpeed: 15.0,
    maxSpeed: 16.0,
    description: "Traditional constant RPM navigation along unoptimized Great Circle lane.",
    highlights: "Fixed RPM · Ref 0% · Great Circle"
  }
]

export default function VoyageOptimizer({ onNavigate }: Props) {
  const [corridors, setCorridors] = useState<ShippingCorridor[]>([])
  const [fleet, setFleet] = useState<any[]>([])
  const [fuels, setFuels] = useState<FuelPathway[]>([])
  const [loading, setLoading] = useState(true)

  // Active Plan Preset
  const [activePreset, setActivePreset] = useState<string>("plan-alpha")

  // Planning Form State
  const [corridorId, setCorridorId] = useState("SIN_ROT")
  const [vesselId, setVesselId] = useState("V001")
  const [vesselType, setVesselType] = useState("CONTAINER_15000TEU")
  const [fuelType, setFuelType] = useState("green_methanol")
  const [algorithm, setAlgorithm] = useState("hybrid_hqoa")

  // Objective Weights
  const [fuelWeight, setFuelWeight] = useState(0.45)
  const [carbonWeight, setCarbonWeight] = useState(0.35)
  const [delayWeight, setDelayWeight] = useState(0.20)

  // Operational Constraints
  const [minSpeed, setMinSpeed] = useState(12.0)
  const [maxSpeed, setMaxSpeed] = useState(18.5)
  const [shorePower, setShorePower] = useState(true)
  const [weatherRouting, setWeatherRouting] = useState(true)

  useEffect(() => {
    Promise.all([fetchCorridors(), fetchFleetList(), fetchFuels()])
      .then(([corrs, flt, fls]) => {
        setCorridors(corrs)
        setFleet(flt)
        setFuels(fls)
        if (corrs.length > 0) setCorridorId(corrs[0].id)
        if (flt.length > 0) {
          setVesselId(flt[0].id)
          setVesselType(flt[0].vessel_type_key || "CONTAINER_15000TEU")
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const selectedCorridor =
    corridors.find((c) => c.id === corridorId) || corridors[0]
  const selectedFuel = fuels.find((f) => f.id === fuelType) || fuels[0]

  const applyPreset = (preset: PlanTemplate) => {
    setActivePreset(preset.id)
    setAlgorithm(preset.algorithm)
    setFuelType(preset.fuelType)
    setFuelWeight(preset.fuelWeight)
    setCarbonWeight(preset.carbonWeight)
    setDelayWeight(preset.delayWeight)
    setMinSpeed(preset.minSpeed)
    setMaxSpeed(preset.maxSpeed)
  }

  const handleLaunch = () => {
    onNavigate("console")
  }

  if (loading) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <RefreshCw size={28} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="font-display font-bold text-2xl sm:text-3xl tracking-tight"
                style={{ color: "var(--text-1)" }}
              >
                Voyage Mission Planner
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Multi-Criteria Matrix
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Configure hydrodynamics, Well-to-Wake dual-fuel parameters, and Pareto optimization profiles
            </p>
          </div>

          <button
            onClick={handleLaunch}
            className="btn-primary-action flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md cursor-pointer"
          >
            <Zap size={16} /> Launch Quantum Optimizer <ArrowRight size={16} />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            PLAN PRESETS TEMPLATES BAR
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="panel-solid p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: "var(--border-sub)" }}>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
                <Layers size={16} className="text-blue-500" /> Optimization Plan Presets
              </h2>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Click any operational plan to load calibrated hydrodynamic parameters & quantum objective weights
              </p>
            </div>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-4)" }}>
              5 Available Operational Profiles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {PLAN_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between backdrop-blur-md cursor-pointer"
                  style={{
                    background: isSelected ? "var(--bg-hover)" : "var(--bg-surface)",
                    borderColor: isSelected ? preset.color : "var(--border)",
                    boxShadow: isSelected ? `0 0 0 1px ${preset.color}40, 0 8px 24px rgba(0,0,0,0.15)` : "none"
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: preset.color }}
                    />
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${preset.color}20`,
                          color: preset.color,
                          border: `1px solid ${preset.color}40`
                        }}
                      >
                        {preset.badge}
                      </span>
                      {isSelected && <Check size={14} style={{ color: preset.color }} />}
                    </div>
                    <p className="text-xs font-bold truncate mt-1" style={{ color: "var(--text-1)" }}>
                      {preset.name}
                    </p>
                    <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "var(--text-3)" }}>
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t text-[10px] font-mono font-bold" style={{ borderColor: "var(--border-sub)", color: preset.color }}>
                    {preset.highlights}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Split Mission Planning Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Pane (5 cols): Spatial Corridor & Waypoint Inspector */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Corridor Selector Card */}
            <div className="panel-solid p-5 space-y-4">
              <div
                className="flex items-center justify-between pb-3 border-b"
                style={{ borderColor: "var(--border-sub)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Navigation size={14} /> Shipping Lane
                </span>
                <span className="text-xs font-mono-data font-bold text-sky-600 dark:text-sky-400">
                  {selectedCorridor?.distance_nm.toLocaleString()} NM
                </span>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: "var(--text-3)" }}
                >
                  Select Global Corridor
                </label>
                <select
                  value={corridorId}
                  onChange={(e) => setCorridorId(e.target.value)}
                  className="w-full input-marine text-sm"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.distance_nm.toLocaleString()} NM)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  className="p-3 rounded-md border"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span
                    className="text-[11px] block font-semibold"
                    style={{ color: "var(--text-4)" }}
                  >
                    Port of Origin
                  </span>
                  <span
                    className="text-sm font-bold mt-0.5 block"
                    style={{ color: "var(--text-1)" }}
                  >
                    {selectedCorridor?.origin}
                  </span>
                </div>
                <div
                  className="p-3 rounded-md border"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span
                    className="text-[11px] block font-semibold"
                    style={{ color: "var(--text-4)" }}
                  >
                    Destination
                  </span>
                  <span
                    className="text-sm font-bold mt-0.5 block"
                    style={{ color: "var(--text-1)" }}
                  >
                    {selectedCorridor?.destination}
                  </span>
                </div>
              </div>
            </div>

            {/* Waypoint Legs Inspector */}
            <div className="panel-solid p-5">
              <div
                className="flex items-center justify-between mb-3 pb-2 border-b"
                style={{ borderColor: "var(--border-sub)" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-1)" }}
                >
                  Route Legs ({selectedCorridor?.waypoints.length ? selectedCorridor.waypoints.length - 1 : 0} Segments)
                </span>
                <span className="text-xs" style={{ color: "var(--text-4)" }}>
                  Copernicus Currents Live
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedCorridor?.waypoints.map((wp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border text-xs"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-sub)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px]"
                        style={{
                          background: "var(--bg-hover)",
                          color: "var(--text-2)",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text-1)" }}
                      >
                        {wp.name}
                      </span>
                    </div>
                    <span
                      className="font-mono-data"
                      style={{ color: "var(--text-4)" }}
                    >
                      {wp.lat.toFixed(2)}°, {wp.lng.toFixed(2)}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane (7 cols): Parameters, Dual-Fuel & Objective Balancing */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Vessel Selection & Speed Bounds */}
            <div className="panel-solid p-5 space-y-4">
              <h3
                className="text-sm font-bold pb-2 border-b"
                style={{
                  color: "var(--text-1)",
                  borderColor: "var(--border-sub)",
                }}
              >
                Vessel Hydrodynamics & Speed Envelope
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    Assigned Fleet Vessel
                  </label>
                  <select
                    value={vesselId}
                    onChange={(e) => {
                      setVesselId(e.target.value)
                      const f = fleet.find((item) => item.id === e.target.value)
                      if (f?.vessel_type_key) setVesselType(f.vessel_type_key)
                    }}
                    className="w-full input-marine"
                  >
                    {fleet.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    Vessel Hull Profile
                  </label>
                  <select
                    value={vesselType}
                    onChange={(e) => setVesselType(e.target.value)}
                    className="w-full input-marine"
                  >
                    <option value="CONTAINER_15000TEU">
                      Ultra Large Container (15,000 TEU)
                    </option>
                    <option value="VLCC">VLCC Tanker (298,000 DWT)</option>
                    <option value="CAPESIZE">
                      Capesize Bulk Carrier (178,000 DWT)
                    </option>
                    <option value="PANAMAX">
                      Panamax Bulk Carrier (74,000 DWT)
                    </option>
                  </select>
                </div>
              </div>

              {/* Speed Limits Slider */}
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span style={{ color: "var(--text-3)" }}>
                    Speed Bounds (SOG Envelope)
                  </span>
                  <span className="font-mono-data text-sky-400 font-bold">
                    {minSpeed.toFixed(1)} kn − {maxSpeed.toFixed(1)} kn
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "var(--text-3)" }}
                    >
                      Min Speed (knots)
                    </span>
                    <input
                      type="range"
                      min="9.0"
                      max="14.0"
                      step="0.5"
                      value={minSpeed}
                      onChange={(e) => setMinSpeed(parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "var(--text-3)" }}
                    >
                      Max Speed (knots)
                    </span>
                    <input
                      type="range"
                      min="15.0"
                      max="22.0"
                      step="0.5"
                      value={maxSpeed}
                      onChange={(e) => setMaxSpeed(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Pathway Selection */}
            <div className="panel-solid p-5 space-y-4">
              <h3
                className="text-sm font-bold pb-2 border-b"
                style={{
                  color: "var(--text-1)",
                  borderColor: "var(--border-sub)",
                }}
              >
                Well-to-Wake Lifecycle Fuel Pathway
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fuels.map((f) => {
                  const isSelected = fuelType === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFuelType(f.id)}
                      className="p-3 rounded-lg border text-left transition-all"
                      style={{
                        background: isSelected
                          ? "rgba(16,185,129,0.12)"
                          : "var(--bg-surface)",
                        borderColor: isSelected ? "#10b981" : "var(--border)",
                      }}
                    >
                      <span
                        className="text-xs font-bold block"
                        style={{
                          color: isSelected ? "#10b981" : "var(--text-1)",
                        }}
                      >
                        {f.name}
                      </span>
                      <span
                        className="text-[10px] font-mono-data block mt-1"
                        style={{ color: "var(--text-4)" }}
                      >
                        WtW: {f.cf_wtw} t-CO₂e/t
                      </span>
                      <span className="text-[11px] font-mono-data font-bold mt-1 block text-sky-400">
                        ${f.cost_per_mt}/MT
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Objective Balancing (Tri-Weight Matrix) */}
            <div className="panel-solid p-5 space-y-4">
              <div
                className="flex items-center justify-between pb-2 border-b"
                style={{ borderColor: "var(--border-sub)" }}
              >
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-1)" }}
                >
                  Pareto Objective Weights
                </h3>
                <span className="text-xs font-mono-data text-emerald-400 font-bold">
                  Sum: {Math.round((fuelWeight + carbonWeight + delayWeight) * 100)}%
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-2)" }}
                    >
                      Fuel Bunkering Cost
                    </span>
                    <span className="font-mono-data font-bold text-sky-400">
                      {Math.round(fuelWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={fuelWeight}
                    onChange={(e) => setFuelWeight(parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-2)" }}
                    >
                      CO₂e Lifecycle Emissions
                    </span>
                    <span className="font-mono-data font-bold text-emerald-400">
                      {Math.round(carbonWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={carbonWeight}
                    onChange={(e) => setCarbonWeight(parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-2)" }}
                    >
                      ETA Schedule Delay Penalty
                    </span>
                    <span className="font-mono-data font-bold text-amber-400">
                      {Math.round(delayWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.6"
                    step="0.05"
                    value={delayWeight}
                    onChange={(e) => setDelayWeight(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
