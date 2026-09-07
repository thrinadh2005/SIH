import { useState, useEffect } from "react"
import {
  Fuel,
  Wind,
  DollarSign,
  Ship,
  TrendingUp,
  Zap,
  Radio,
  Users,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
} from "recharts"
import KPICard from "../components/ui/KPICard"
import StatusBadge, { CIIBadge } from "../components/ui/StatusBadge"
import { wsClient } from "../services/websocket"
import {
  fetchFleetOverview,
  fetchFleetList,
  FleetOverview,
} from "../services/api"

function useCountUp(target: number, duration = 800, decimals = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const steps = 25
    const step = target / steps
    const interval = duration / steps
    const t = setInterval(() => {
      start += step
      if (start >= target) {
        setVal(target)
        clearInterval(t)
      } else {
        setVal(parseFloat(start.toFixed(decimals)))
      }
    }, interval)
    return () => clearInterval(t)
  }, [target, duration, decimals])
  return val
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-4 py-3 rounded-xl text-xs sm:text-sm border shadow-2xl panel-solid backdrop-blur-md animate-fade-in"
    >
      <p className="font-bold mb-1.5 text-sky-400">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-2.5 items-center text-xs sm:text-sm my-0.5">
          <span style={{ color: p.color }}>●</span>
          <span style={{ color: "var(--text-2)" }}>
            {p.name}:{" "}
            <strong style={{ color: "var(--text-1)" }}>
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            </strong>
          </span>
        </div>
      ))}
    </div>
  )
}

const FLEET_PLANS = [
  {
    id: "alpha",
    name: "Plan Alpha · Quantum HQOA",
    code: "HQOA-156Q",
    badge: "GLOBAL OPTIMUM",
    color: "#2563eb",
    saving: "16.8%",
    co2: "−17.2%",
    cii: "Grade A",
    hours: "384h",
    vessels: "Oceanic Vanguard · Pacific Meridian",
    desc: "Multi-qubit Hamiltonian Pareto optimal with Copernicus ocean current meander capture."
  },
  {
    id: "beta",
    name: "Plan Beta · Quantum QPSO",
    code: "QPSO-SWARM",
    badge: "WEATHER & SAFETY",
    color: "#0284c7",
    saving: "12.4%",
    co2: "−13.0%",
    cii: "Grade A",
    hours: "392h",
    vessels: "Nordic Horizon",
    desc: "Dynamic wave swell bypass minimizing hull fatigue and severe sea state resistance."
  },
  {
    id: "gamma",
    name: "Plan Gamma · Quantum QGA",
    code: "QGA-JIT",
    badge: "JIT SCHEDULE",
    color: "#6366f1",
    saving: "9.5%",
    co2: "−10.1%",
    cii: "Grade B",
    hours: "356h",
    vessels: "Atlantic Pioneer",
    desc: "Strict port arrival window schedule lock minimizing costly demurrage and canal queueing."
  },
  {
    id: "delta",
    name: "Plan Delta · IMO DCS Class-A",
    code: "IMO-DECARB",
    badge: "ULTRA ECO",
    color: "#0891b2",
    saving: "19.0%",
    co2: "−68.4%",
    cii: "Grade A+",
    hours: "388h",
    vessels: "Solaris Voyager",
    desc: "Well-to-Wake dual-fuel bio-methanol blend achieving zero EU ETS tax penalties."
  },
  {
    id: "epsilon",
    name: "Plan Epsilon · Classical Baseline",
    code: "BASE-REF",
    badge: "BENCHMARK REF",
    color: "#64748b",
    saving: "0.0%",
    co2: "Ref 0%",
    cii: "Grade C",
    hours: "378h",
    vessels: "Historical Reference",
    desc: "Traditional constant RPM navigation along unoptimized Great Circle lane."
  }
]

interface Props {
  onNavigate: (id: string) => void
}

export default function Overview({ onNavigate }: Props) {
  const [overview, setOverview] = useState<FleetOverview | null>(null)
  const [fleet, setFleet] = useState<any[]>([])
  const [latency, setLatency] = useState(18)
  const [selectedPlanTab, setSelectedPlanTab] = useState<string>("alpha")

  const liveTotalFuel =
    overview?.total_fuel_burned_today_mt ??
    (fleet.length
      ? fleet.reduce((acc, v) => acc + (v.fuel_rate_mt_day || 0), 0)
      : 203.0)
  const liveTotalCO2 =
    overview?.total_co2_today_mt ??
    (fleet.length
      ? fleet.reduce(
          (acc, v) =>
            acc +
            (v.fuel_rate_mt_day || 0) *
              (v.fuel_type === "GREEN_METHANOL" ? 0.15 : 3.206),
          0,
        )
      : 330.0)
  const currentHourlyRate = Math.round((liveTotalFuel / 24) * 10) / 10
  const savingPct = overview?.fuel_saved_ytd_pct ?? 16.8
  const baseHourlyRate =
    Math.round(currentHourlyRate * (1 + savingPct / 100) * 10) / 10

  const fuelTrendData = [
    { time: "00:00", baseline: Math.round(baseHourlyRate * 0.95 * 10) / 10, optimized: Math.round(currentHourlyRate * 0.96 * 10) / 10 },
    { time: "04:00", baseline: Math.round(baseHourlyRate * 0.98 * 10) / 10, optimized: Math.round(currentHourlyRate * 0.97 * 10) / 10 },
    { time: "08:00", baseline: Math.round(baseHourlyRate * 1.05 * 10) / 10, optimized: Math.round(currentHourlyRate * 1.03 * 10) / 10 },
    { time: "12:00", baseline: Math.round(baseHourlyRate * 1.08 * 10) / 10, optimized: Math.round(currentHourlyRate * 1.05 * 10) / 10 },
    { time: "16:00", baseline: Math.round(baseHourlyRate * 1.02 * 10) / 10, optimized: Math.round(currentHourlyRate * 1.01 * 10) / 10 },
    { time: "20:00", baseline: Math.round(baseHourlyRate * 0.99 * 10) / 10, optimized: Math.round(currentHourlyRate * 0.98 * 10) / 10 },
  ]

  const fuelCount = useCountUp(liveTotalFuel, 800, 1)
  const co2Count = useCountUp(liveTotalCO2, 800, 1)
  const savingCount = useCountUp(savingPct, 800, 2)

  useEffect(() => {
    fetchFleetOverview()
      .then((res) => setOverview(res))
      .catch((err) => console.error("Fleet overview fetch failed:", err))

    fetchFleetList()
      .then((res) => setFleet(res))
      .catch((err) => console.error("Fleet list fetch failed:", err))

    const unsub = wsClient.subscribe((msg) => {
      if (msg.type === "CONNECTION" && msg.payload.latency) {
        setLatency(msg.payload.latency)
      } else if (msg.type === "VESSEL_UPDATE") {
        setFleet((prev) =>
          prev.map((v) =>
            v.id === msg.payload.id || v.mmsi === msg.payload.mmsi
              ? { ...v, ...msg.payload }
              : v,
          ),
        )
      }
    })

    return () => unsub()
  }, [])

  const ciiDistData = [
    { grade: "A", count: 3, color: "#10b981" },
    { grade: "B", count: 2, color: "#0284c7" },
    { grade: "C", count: 0, color: "#f59e0b" },
    { grade: "D", count: 0, color: "#ea580c" },
    { grade: "E", count: 0, color: "#dc2626" },
  ]

  const activePlan = FLEET_PLANS.find((p) => p.id === selectedPlanTab) || FLEET_PLANS[0]

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="p-5 sm:p-7 lg:p-9 space-y-7 max-w-7xl mx-auto">
        {/* Header Control Bar with Sapphire Gradient Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="font-display font-bold text-2xl sm:text-3xl tracking-tight"
                style={{ color: "var(--text-1)" }}
              >
                Fleet Operations & Quantum Command
              </h1>
              <span className="flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/35 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-live-pulse" />
                Live AIS Telemetry
              </span>
            </div>
            <p className="text-sm sm:text-base mt-1.5 font-medium" style={{ color: "var(--text-3)" }}>
              Hydrodynamic speed envelopes, satellite AIS ingestion, multi-plan dispatch, and IMO MARPOL Annex VI compliance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-mono font-semibold shadow-xs"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-2)",
              }}
            >
              <Radio size={15} className="text-blue-500 dark:text-sky-400 animate-live-pulse" />
              <span>NMEA Link</span>
              <span className="text-blue-600 dark:text-sky-400 font-bold">{latency}ms</span>
            </div>

            <button
              onClick={() => onNavigate("optimizer")}
              className="btn-primary-action flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <Zap size={16} /> Plan New Voyage
            </button>
          </div>
        </div>

        {/* Operational Quick Command Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate("commercial")}
            className="panel-interactive p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                  Bunker Arbitrage
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--text-4)" }}>
                  Global Spot Spreads
                </p>
              </div>
            </div>
            <ArrowUpRight size={17} style={{ color: "var(--text-4)" }} />
          </button>

          <button
            onClick={() => onNavigate("swarm")}
            className="panel-interactive p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                  Convoy Swarm
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--text-4)" }}>
                  Port JIT Speed Sync
                </p>
              </div>
            </div>
            <ArrowUpRight size={17} style={{ color: "var(--text-4)" }} />
          </button>

          <button
            onClick={() => onNavigate("edge")}
            className="panel-interactive p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                <Radio size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                  IoT Edge Bridge
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--text-4)" }}>
                  Serial Hardware Feed
                </p>
              </div>
            </div>
            <ArrowUpRight size={17} style={{ color: "var(--text-4)" }} />
          </button>

          <button
            onClick={() => onNavigate("compliance")}
            className="panel-interactive p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                  IMO DCS & MRV
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--text-4)" }}>
                  Audit Certs Proof
                </p>
              </div>
            </div>
            <ArrowUpRight size={17} style={{ color: "var(--text-4)" }} />
          </button>
        </div>

        {/* Tactical Fleet Metrics (Cobalt / Sapphire Palette) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <KPICard
            label="Fuel Burned Today"
            value={`${fuelCount.toFixed(1)} MT`}
            sub="−16.8% vs static baseline"
            icon={Fuel}
            trend={{ value: 16.8, direction: "down" }}
            color="#2563eb"
          />
          <KPICard
            label="CO₂e Emitted Today"
            value={`${co2Count.toFixed(1)} MT`}
            sub="IMO CII Compliant (Grade A)"
            icon={Wind}
            trend={{ value: 18.2, direction: "down" }}
            color="#0284c7"
          />
          <KPICard
            label="Average Fuel Reduction"
            value={`${savingCount.toFixed(2)}%`}
            sub="Hybrid Quantum HQOA Model"
            icon={TrendingUp}
            trend={{ value: 3.4, direction: "up" }}
            color="#6366f1"
          />
          <KPICard
            label="YTD OPEX Saved"
            value={`$${(overview?.cost_saved_ytd_usd ?? 4846080).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            sub="Bunkering + EU ETS carbon allowance"
            icon={DollarSign}
            color="#f59e0b"
          />
        </div>

        {/* Active Multi-Plan Dispatch Board with Smooth Select Physics */}
        <div className="panel-solid p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b" style={{ borderColor: "var(--border-sub)" }}>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2.5" style={{ color: "var(--text-1)" }}>
                <Layers size={18} className="text-sky-500" /> Active Optimization Plans & Fleet Assignment
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-3)" }}>
                Multi-qubit Hamiltonian trajectory profiles dispatched across active corridors
              </p>
            </div>
            <button
              onClick={() => onNavigate("results")}
              className="text-xs sm:text-sm font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 transition-all"
            >
              Open Plan Evaluator Studio <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {FLEET_PLANS.map((plan) => {
              const isSelected = plan.id === selectedPlanTab
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanTab(plan.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 shadow-lg scale-[1.02]"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-sky-500/50 hover:translate-y-[-2px]"
                  }`}
                >
                  <div>
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-2 border shadow-2xs"
                      style={{
                        background: `${plan.color}20`,
                        color: plan.color,
                        borderColor: `${plan.color}45`,
                      }}
                    >
                      {plan.badge}
                    </span>
                    <p className="text-xs sm:text-sm font-bold truncate" style={{ color: "var(--text-1)" }}>
                      {plan.name}
                    </p>
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "var(--text-3)" }}>
                      {plan.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t flex items-center justify-between text-xs font-mono" style={{ borderColor: "var(--border-sub)" }}>
                    <span style={{ color: "var(--text-4)" }}>{plan.cii}</span>
                    <span className="font-bold text-sm" style={{ color: plan.color }}>
                      {plan.saving !== "0.0%" ? `−${plan.saving}` : "Base"}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Plan Detail Box */}
          <div
            className="p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <p className="text-sm font-bold flex items-center gap-2.5" style={{ color: "var(--text-1)" }}>
                <span>{activePlan.name} Telemetry</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md border text-blue-600 dark:text-sky-300 bg-blue-500/10 border-blue-500/30">
                  Assigned: {activePlan.vessels}
                </span>
              </p>
              <p className="text-xs sm:text-sm mt-1.5 font-medium" style={{ color: "var(--text-3)" }}>
                Expected Fuel Saving: <strong className="text-blue-600 dark:text-sky-400">{activePlan.saving}</strong> · Lifecycle CO₂e: <strong className="text-indigo-600 dark:text-indigo-400">{activePlan.co2}</strong> · Transit Time: <strong className="text-amber-600 dark:text-amber-400">{activePlan.hours}</strong> · IMO Rating: <strong className="text-emerald-600 dark:text-emerald-400">{activePlan.cii}</strong>
              </p>
            </div>

            <button
              onClick={() => onNavigate("results")}
              className="btn-primary-action flex items-center gap-2 px-4 py-2 text-xs sm:text-sm shrink-0"
            >
              Inspect Route Matrix <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Real-Time Trajectory & CII Grid (Sapphire Area Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fuel Consumption Trajectory */}
          <div className="lg:col-span-2 panel-solid p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3
                  className="text-base font-bold"
                  style={{ color: "var(--text-1)" }}
                >
                  Hourly Fuel Consumption Rate (MT/hr)
                </h3>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
                  Quantum Speed Trajectory vs Fixed RPM Baseline
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/35 shadow-xs">
                16.8% Fuel Reduction
              </span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={fuelTrendData}>
                <defs>
                  <linearGradient id="quantumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sub)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--text-3)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--text-3)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  width={40}
                  domain={[55, 90]}
                />
                <Tooltip content={<Tip />} />
                <Line
                  dataKey="baseline"
                  name="Static Baseline"
                  stroke="var(--text-4)"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="optimized"
                  name="Quantum Optimized"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#quantumGradient)"
                  dot={{ fill: "#38bdf8", stroke: "#2563eb", strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* CII Rating Breakdown */}
          <div className="panel-solid p-6 flex flex-col justify-between">
            <div>
              <h3
                className="text-base font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Fleet IMO CII Distribution
              </h3>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
                100% compliant with 2026 MEPC.328(76) threshold
              </p>
            </div>

            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={ciiDistData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sub)" vertical={false} />
                <XAxis
                  dataKey="grade"
                  tick={{ fontSize: 13, fill: "var(--text-2)", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-3)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" name="Vessels" radius={[5, 5, 0, 0]}>
                  {ciiDistData.map((d) => (
                    <Cell key={d.grade} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div
              className="flex justify-between text-xs sm:text-sm pt-3.5 border-t font-semibold"
              style={{ borderColor: "var(--border-sub)" }}
            >
              <span style={{ color: "var(--text-3)" }}>
                Fleet DWT: {(overview?.total_dwt ?? 810000).toLocaleString()}
              </span>
              <span className="text-blue-600 dark:text-sky-400 font-bold">0 Sanctioned</span>
            </div>
          </div>
        </div>

        {/* Live Active Fleet Table */}
        <div className="panel-solid overflow-hidden">
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-sub)" }}
          >
            <div className="flex items-center gap-2.5">
              <Ship size={19} className="text-sky-500" />
              <h3
                className="text-base font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Live Fleet AIS Telemetry Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate("fleet")}
              className="text-xs sm:text-sm font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1.5"
            >
              Complete Fleet Register <ChevronRight size={15} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-marine">
              <thead>
                <tr>
                  <th>Vessel Name</th>
                  <th>Type & DWT</th>
                  <th>Voyage Corridor</th>
                  <th>Speed (SOG)</th>
                  <th>Engine Load</th>
                  <th>Fuel Burn</th>
                  <th>CII Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((v) => (
                  <tr key={v.mmsi || v.id}>
                    <td
                      className="font-bold text-sm sm:text-base"
                      style={{ color: "var(--text-1)" }}
                    >
                      {v.name}
                    </td>
                    <td style={{ color: "var(--text-3)" }}>{v.type}</td>
                    <td style={{ color: "var(--text-2)" }}>
                      {v.route_name || "Singapore → Rotterdam"}
                    </td>
                    <td className="font-mono-data font-bold text-sky-600 dark:text-sky-400 text-sm sm:text-base">
                      {v.speed} kn
                    </td>
                    <td
                      className="font-mono-data font-medium"
                      style={{ color: "var(--text-2)" }}
                    >
                      {v.engine_load_pct || 68.5}% MCR
                    </td>
                    <td className="font-mono-data font-bold text-blue-600 dark:text-sky-300 text-sm sm:text-base">
                      {v.fuel_rate_mt_day || 38.2} MT/d
                    </td>
                    <td>
                      <CIIBadge grade={v.cii || v.cii_grade || "A"} />
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
