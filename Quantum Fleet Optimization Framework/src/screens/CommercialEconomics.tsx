import { useState, useEffect } from "react"
import {
  DollarSign,
  TrendingUp,
  Anchor,
  Fuel,
  ShieldCheck,
  Zap,
  Wind,
  RefreshCw,
  BarChart2,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  calculateBunkerArbitrage,
  calculateRetrofitRoi,
  BunkerArbitrageResponse,
  RetrofitROIResponse,
} from "../services/api"

interface Props {
  onNavigate: (id: string) => void
}

export default function CommercialEconomics({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"bunkering" | "retrofit">(
    "bunkering",
  )

  // Bunkering State
  const [corridor, setCorridor] = useState("SIN_ROT")
  const [fuelType, setFuelType] = useState("GREEN_METHANOL")
  const [fuelVolume, setFuelVolume] = useState(1200)
  const [bunkerData, setBunkerData] = useState<BunkerArbitrageResponse | null>(
    null,
  )
  const [loadingBunker, setLoadingBunker] = useState(false)

  // Retrofit ROI State
  const [vesselDwt, setVesselDwt] = useState(145000)
  const [carbonTax, setCarbonTax] = useState(82.5)
  const [capexModifier, setCapexModifier] = useState(0)
  const [roiData, setRoiData] = useState<RetrofitROIResponse | null>(null)
  const [loadingRoi, setLoadingRoi] = useState(false)

  useEffect(() => {
    setLoadingBunker(true)
    calculateBunkerArbitrage({
      corridor_id: corridor,
      fuel_type: fuelType,
      required_fuel_mt: fuelVolume,
    })
      .then(setBunkerData)
      .catch(() => {})
      .finally(() => setLoadingBunker(false))
  }, [corridor, fuelType, fuelVolume])

  useEffect(() => {
    setLoadingRoi(true)
    calculateRetrofitRoi({
      vessel_dwt: vesselDwt,
      carbon_tax_eur_tonne: carbonTax,
      custom_capex_adjust_pct: capexModifier,
    })
      .then(setRoiData)
      .catch(() => {})
      .finally(() => setLoadingRoi(false))
  }, [vesselDwt, carbonTax, capexModifier])

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
                Commercial Economics & Bunker Arbitrage
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                CAPEX / OPEX Engine
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Global bunkering spot price optimization · Dual-fuel conversion
              ROI · 15-year DCF analysis
            </p>
          </div>

          {/* Module Switcher Tabs */}
          <div
            className="flex gap-1.5 p-1.5 rounded-xl border panel-glass"
            style={{
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setActiveTab("bunkering")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "bunkering"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Fuel size={14} /> Bunker Spot Arbitrage
            </button>
            <button
              onClick={() => setActiveTab("retrofit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "retrofit"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <TrendingUp size={14} /> Dual-Fuel Retrofit ROI
            </button>
          </div>
        </div>

        {/* TAB 1: BUNKER ARBITRAGE */}
        {activeTab === "bunkering" && (
          <div className="space-y-6 animate-fade-in">
            {/* Input Controls */}
            <div className="panel-solid p-5 space-y-4">
              <h3
                className="text-sm font-bold pb-2 border-b"
                style={{
                  color: "var(--text-1)",
                  borderColor: "var(--border-sub)",
                }}
              >
                Voyage Procurement Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    Corridor Lane
                  </label>
                  <select
                    value={corridor}
                    onChange={(e) => setCorridor(e.target.value)}
                    className="w-full input-marine"
                  >
                    <option value="SIN_ROT">
                      Singapore (SGSIN) → Rotterdam (NLRTM) · 8,280 NM
                    </option>
                    <option value="SHA_LAX">
                      Shanghai (CNSHA) → Los Angeles (USLAX) · 5,700 NM
                    </option>
                    <option value="ROT_NYC">
                      Rotterdam (NLRTM) → New York (USNYC) · 3,400 NM
                    </option>
                    <option value="HOU_ANT">
                      Houston (USHOU) → Antwerp (BEANR) · 4,800 NM
                    </option>
                    <option value="MUM_ROT">
                      JNPT Mumbai (INNSA) → Rotterdam (NLRTM) · 6,400 NM
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    Fuel Pathway
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full input-marine"
                  >
                    <option value="GREEN_METHANOL">
                      Green Methanol (e-MeOH)
                    </option>
                    <option value="BIO_METHANOL">Bio-Methanol</option>
                    <option value="LNG">Cryogenic LNG</option>
                    <option value="VLSFO">
                      Very Low Sulphur Fuel Oil (VLSFO)
                    </option>
                    <option value="AMMONIA">e-Ammonia (NH₃)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                    <span style={{ color: "var(--text-3)" }}>
                      Required Volume
                    </span>
                    <span className="font-mono-data font-bold text-emerald-500">
                      {fuelVolume.toLocaleString()} MT
                    </span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={3000}
                    step={100}
                    value={fuelVolume}
                    onChange={(e) => setFuelVolume(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Arbitrage KPI Summary Cards */}
            {bunkerData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="panel-solid p-5 flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-3)" }}
                    >
                      Optimal Procurement Hub
                    </p>
                    <p className="font-bold text-xl text-emerald-500 mt-1">
                      {bunkerData.optimal_bunker_port}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-4)" }}
                    >
                      Lowest landed voyage cost
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                    <Anchor size={22} />
                  </div>
                </div>

                <div className="panel-solid p-5 flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-3)" }}
                    >
                      Arbitrage Spread Savings
                    </p>
                    <p className="font-mono-data font-bold text-2xl text-sky-500 mt-1">
                      $
                      {bunkerData.arbitrage_savings_vs_worst_hub_usd.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-500 font-bold mt-0.5">
                      +{bunkerData.arbitrage_savings_pct}% vs Highest Cost Port
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-500">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="panel-solid p-5 flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-3)" }}
                    >
                      Procurement Strategy
                    </p>
                    <p
                      className="text-xs font-bold mt-1 line-clamp-2"
                      style={{ color: "var(--text-1)" }}
                    >
                      {bunkerData.procurement_strategy}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-4)" }}
                    >
                      Includes barge & port call fees
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-500">
                    <Zap size={22} />
                  </div>
                </div>
              </div>
            )}

            {/* Port Pricing Matrix Table */}
            {bunkerData && (
              <div className="panel-solid overflow-hidden">
                <div
                  className="px-5 py-3.5 border-b"
                  style={{ borderColor: "var(--border-sub)" }}
                >
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Global Bunker Hub Spot Pricing & Procurement Matrix
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-marine">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Bunker Hub</th>
                        <th>Spot Price ($/MT)</th>
                        <th>Procured Volume</th>
                        <th>Barge & Port Overhead</th>
                        <th>Total Landed Cost</th>
                        <th>Delta vs Best</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bunkerData.port_rankings.map((p, idx) => {
                        const delta =
                          p.total_procurement_cost_usd -
                          bunkerData.minimum_total_cost_usd
                        const isBest = idx === 0
                        return (
                          <tr key={p.port_id}>
                            <td className="font-mono-data font-bold">
                              {isBest ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[11px] font-bold">
                                  #1 BEST
                                </span>
                              ) : (
                                `#${idx + 1}`
                              )}
                            </td>
                            <td
                              className="font-bold"
                              style={{ color: "var(--text-1)" }}
                            >
                              {p.name}
                            </td>
                            <td
                              className="font-mono-data font-bold"
                              style={{ color: "var(--text-2)" }}
                            >
                              ${p.spot_price_usd_mt}
                            </td>
                            <td
                              className="font-mono-data"
                              style={{ color: "var(--text-3)" }}
                            >
                              {p.fuel_procured_mt} MT
                            </td>
                            <td
                              className="font-mono-data"
                              style={{ color: "var(--text-4)" }}
                            >
                              ${p.port_overhead_usd.toLocaleString()}
                            </td>
                            <td className="font-mono-data font-bold text-emerald-500">
                              ${p.total_procurement_cost_usd.toLocaleString()}
                            </td>
                            <td
                              className="font-mono-data font-bold"
                              style={{ color: isBest ? "#10b981" : "#ef4444" }}
                            >
                              {isBest
                                ? "— Baseline"
                                : `+$${delta.toLocaleString()}`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DUAL-FUEL RETROFIT ROI */}
        {activeTab === "retrofit" && (
          <div className="space-y-6 animate-fade-in">
            {/* Retrofit Simulation Controls */}
            <div className="panel-solid p-5 space-y-4">
              <h3
                className="text-sm font-bold pb-2 border-b"
                style={{
                  color: "var(--text-1)",
                  borderColor: "var(--border-sub)",
                }}
              >
                Fleet Retrofit DCF Investment Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span style={{ color: "var(--text-3)" }}>
                      Vessel Deadweight
                    </span>
                    <span className="font-mono-data font-bold text-emerald-500">
                      {vesselDwt.toLocaleString()} DWT
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={320000}
                    step={10000}
                    value={vesselDwt}
                    onChange={(e) => setVesselDwt(Number(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span style={{ color: "var(--text-3)" }}>
                      EU ETS Carbon Price
                    </span>
                    <span className="font-mono-data font-bold text-sky-500">
                      €{carbonTax} / tCO₂
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={5}
                    value={carbonTax}
                    onChange={(e) => setCarbonTax(Number(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span style={{ color: "var(--text-3)" }}>
                      CAPEX Modifier
                    </span>
                    <span className="font-mono-data font-bold text-purple-500">
                      {capexModifier > 0
                        ? `+${capexModifier}%`
                        : `${capexModifier}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={30}
                    step={5}
                    value={capexModifier}
                    onChange={(e) => setCapexModifier(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Retrofit Evaluation Cards */}
            {roiData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roiData.evaluations.map((ev, i) => (
                  <div
                    key={ev.retrofit_id}
                    className="panel-solid p-5 space-y-3 relative flex flex-col justify-between"
                    style={{
                      borderColor: i === 0 ? "#10b981" : "var(--border)",
                    }}
                  >
                    <div>
                      <h3
                        className="font-bold text-base"
                        style={{ color: "var(--text-1)" }}
                      >
                        {ev.technology_name}
                      </h3>
                      <p className="text-xs text-emerald-500 font-bold mt-0.5">
                        CII Guarantee: {ev.cii_grade_guarantee}
                      </p>
                    </div>

                    <div
                      className="space-y-1.5 text-xs py-2.5 border-y"
                      style={{ borderColor: "var(--border-sub)" }}
                    >
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>
                          Total Initial CAPEX:
                        </span>
                        <span
                          className="font-mono-data font-bold"
                          style={{ color: "var(--text-1)" }}
                        >
                          ${(ev.total_initial_investment_usd / 1e6).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>
                          Annual Tax Shield:
                        </span>
                        <span className="font-mono-data font-bold text-emerald-500">
                          +${(ev.annual_carbon_tax_shield_usd / 1e3).toFixed(0)}
                          k/yr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>
                          Payback Period:
                        </span>
                        <span className="font-mono-data font-bold text-sky-500">
                          {ev.payback_period_years} Years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>
                          Internal Rate of Return:
                        </span>
                        <span className="font-mono-data font-bold text-purple-500">
                          {ev.irr_pct}% IRR
                        </span>
                      </div>
                    </div>

                    <div>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-4)" }}
                      >
                        15-Year Net Present Value (NPV @ 8% WACC):
                      </p>
                      <p className="font-mono-data font-bold text-xl text-emerald-500 mt-0.5">
                        +${(ev.npv_15yr_usd / 1e6).toFixed(2)} Million
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
