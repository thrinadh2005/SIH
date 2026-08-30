import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, Anchor, Fuel, ShieldCheck,
  Zap, Wind, RefreshCw, BarChart2, CheckCircle, ArrowRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  calculateBunkerArbitrage,
  calculateRetrofitRoi,
  BunkerArbitrageResponse,
  RetrofitROIResponse
} from "../services/api";

interface Props {
  onNavigate: (id: string) => void;
}

export default function CommercialEconomics({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"bunkering" | "retrofit">("bunkering");

  // Bunkering State
  const [corridor, setCorridor] = useState("SIN_ROT");
  const [fuelType, setFuelType] = useState("GREEN_METHANOL");
  const [fuelVolume, setFuelVolume] = useState(1200);
  const [bunkerData, setBunkerData] = useState<BunkerArbitrageResponse | null>(null);
  const [loadingBunker, setLoadingBunker] = useState(false);

  // Retrofit ROI State
  const [vesselDwt, setVesselDwt] = useState(145000);
  const [carbonTax, setCarbonTax] = useState(82.5);
  const [capexModifier, setCapexModifier] = useState(0);
  const [roiData, setRoiData] = useState<RetrofitROIResponse | null>(null);
  const [loadingRoi, setLoadingRoi] = useState(false);

  // Fetch Bunkering Data
  useEffect(() => {
    setLoadingBunker(true);
    calculateBunkerArbitrage({
      corridor_id: corridor,
      fuel_type: fuelType,
      required_fuel_mt: fuelVolume
    })
      .then(setBunkerData)
      .catch(() => {})
      .finally(() => setLoadingBunker(false));
  }, [corridor, fuelType, fuelVolume]);

  // Fetch Retrofit ROI Data
  useEffect(() => {
    setLoadingRoi(true);
    calculateRetrofitRoi({
      vessel_dwt: vesselDwt,
      carbon_tax_eur_tonne: carbonTax,
      custom_capex_adjust_pct: capexModifier
    })
      .then(setRoiData)
      .catch(() => {})
      .finally(() => setLoadingRoi(false));
  }, [vesselDwt, carbonTax, capexModifier]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Screen Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: "var(--text-1)" }}>
                Commercial Fleet Economics & Bunker Arbitrage
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                CAPEX / OPEX Suite
              </span>
            </div>
            <p className="text-sm sm:text-base mt-1" style={{ color: "var(--text-3)" }}>
              Global bunkering spot price optimization · Dual-fuel conversion ROI · 15-year DCF analysis
            </p>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex gap-1.5 p-1.5 rounded-2xl glass-card">
            <button
              onClick={() => setActiveTab("bunkering")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === "bunkering" ? "#10b981" : "transparent",
                color: activeTab === "bunkering" ? "white" : "var(--text-3)",
                boxShadow: activeTab === "bunkering" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none"
              }}
            >
              <Fuel size={16} /> Bunker Arbitrage
            </button>
            <button
              onClick={() => setActiveTab("retrofit")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === "retrofit" ? "#10b981" : "transparent",
                color: activeTab === "retrofit" ? "white" : "var(--text-3)",
                boxShadow: activeTab === "retrofit" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none"
              }}
            >
              <TrendingUp size={16} /> Dual-Fuel Retrofit ROI
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 1: GLOBAL BUNKER ARBITRAGE SOLVER
        ────────────────────────────────────────────────────────────────────────────── */}
        {activeTab === "bunkering" && (
          <div className="space-y-6 animate-fade-in">
            {/* Input Controls Card */}
            <div className="rounded-2xl border p-5 sm:p-6 glass-card space-y-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-1)" }}>Voyage & Fuel Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Corridor Selector */}
                <div>
                  <label className="text-xs sm:text-sm font-bold block mb-2" style={{ color: "var(--text-2)" }}>
                    Voyage Corridor
                  </label>
                  <select
                    value={corridor}
                    onChange={(e) => setCorridor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold border outline-none font-sans cursor-pointer transition-colors hover:border-emerald-500"
                    style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-1)" }}
                  >
                    <option value="SIN_ROT">Singapore (SGSIN) → Rotterdam (NLRTM) · 8,280 NM</option>
                    <option value="SHA_LAX">Shanghai (CNSHA) → Los Angeles (USLAX) · 5,700 NM</option>
                    <option value="ROT_NYC">Rotterdam (NLRTM) → New York (USNYC) · 3,400 NM</option>
                    <option value="PER_SHA">Port Hedland (AUPHE) → Shanghai (CNSHA) · 3,850 NM</option>
                    <option value="HOU_ANT">Houston (USHOU) → Antwerp-Bruges (BEANR) · 4,800 NM</option>
                    <option value="MUM_ROT">JNPT Mumbai (INNSA) → Rotterdam (NLRTM) · 6,400 NM</option>
                    <option value="COL_SGP">Colombo (LKCMB) → Singapore (SGSIN) · 1,580 NM</option>
                    <option value="DUR_ROT">Durban (ZADUR) → Rotterdam (NLRTM) · 7,100 NM</option>
                    <option value="SAN_ROT">Santos (BRSSZ) → Rotterdam (NLRTM) · 5,450 NM</option>
                  </select>
                </div>

                {/* Fuel Type Selector */}
                <div>
                  <label className="text-xs sm:text-sm font-bold block mb-2" style={{ color: "var(--text-2)" }}>
                    Bunker Fuel Pathway
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold border outline-none font-sans cursor-pointer transition-colors hover:border-emerald-500"
                    style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-1)" }}
                  >
                    <option value="GREEN_METHANOL">Green Methanol (e-MeOH)</option>
                    <option value="BIO_METHANOL">Bio-Methanol</option>
                    <option value="LNG">Cryogenic LNG</option>
                    <option value="VLSFO">Very Low Sulphur Fuel Oil (VLSFO)</option>
                    <option value="AMMONIA">e-Ammonia (NH₃)</option>
                  </select>
                </div>

                {/* Bunker Volume Slider */}
                <div className="p-4 rounded-xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span style={{ color: "var(--text-2)" }}>Required Bunker Volume</span>
                    <span className="font-mono text-base font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1 font-mono" style={{ color: "var(--text-4)" }}>
                    <span>400 MT</span>
                    <span>1,700 MT</span>
                    <span>3,000 MT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arbitrage KPI Summary Cards */}
            {bunkerData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>
                      Optimal Procurement Hub
                    </p>
                    <p className="font-bold text-xl sm:text-2xl text-emerald-500 mt-1">
                      {bunkerData.optimal_bunker_port}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>Lowest total voyage landed cost</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <Anchor size={26} />
                  </div>
                </div>

                <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>
                      Arbitrage Price Savings
                    </p>
                    <p className="font-mono font-bold text-2xl sm:text-3xl text-sky-500 mt-1">
                      ${bunkerData.arbitrage_savings_vs_worst_hub_usd.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-500 font-bold mt-0.5">
                      +{bunkerData.arbitrage_savings_pct}% vs Highest Cost Port
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
                    <DollarSign size={26} />
                  </div>
                </div>

                <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>
                      Procurement Strategy
                    </p>
                    <p className="text-sm font-bold mt-1 line-clamp-2" style={{ color: "var(--text-1)" }}>
                      {bunkerData.procurement_strategy}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>Includes barge & port call fees</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
                    <Zap size={26} />
                  </div>
                </div>
              </div>
            )}

            {/* Global Port Comparison Table */}
            {bunkerData && (
              <div className="rounded-2xl border overflow-hidden glass-card" style={{ borderColor: "var(--border)" }}>
                <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg" style={{ color: "var(--text-1)" }}>Global Bunker Hub Spot Pricing & Cost Matrix</h3>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>Dynamic evaluation factoring in boil-off rate losses and port call charges</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: 680 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Rank", "Bunker Hub", "Spot Price ($/MT)", "Procured (MT)", "Barge & Port Fee", "Total Cost", "Delta vs Best"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left font-bold uppercase tracking-wider text-xs" style={{ color: "var(--text-4)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bunkerData.port_rankings.map((p, idx) => {
                        const delta = p.total_procurement_cost_usd - bunkerData.minimum_total_cost_usd;
                        const isBest = idx === 0;
                        return (
                          <tr key={p.port_id} className="border-b transition-colors hover:bg-slate-500/10" style={{ borderColor: "var(--border)" }}>
                            <td className="px-5 py-4 font-mono font-bold">
                              {isBest ? (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 text-xs font-bold">
                                  #1 OPTIMAL
                                </span>
                              ) : (
                                `#${idx + 1}`
                              )}
                            </td>
                            <td className="px-5 py-4 font-bold text-base" style={{ color: "var(--text-1)" }}>{p.name}</td>
                            <td className="px-5 py-4 font-mono font-bold" style={{ color: "var(--text-2)" }}>${p.spot_price_usd_mt}</td>
                            <td className="px-5 py-4 font-mono" style={{ color: "var(--text-3)" }}>{p.fuel_procured_mt} MT</td>
                            <td className="px-5 py-4 font-mono" style={{ color: "var(--text-4)" }}>${p.port_overhead_usd.toLocaleString()}</td>
                            <td className="px-5 py-4 font-mono font-bold text-emerald-500 text-base">
                              ${p.total_procurement_cost_usd.toLocaleString()}
                            </td>
                            <td className="px-5 py-4 font-mono font-bold" style={{ color: isBest ? "#10b981" : "#ef4444" }}>
                              {isBest ? "— Best Route Baseline" : `+$${delta.toLocaleString()}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 2: DUAL-FUEL ENGINE & WING SAIL RETROFIT ROI SIMULATOR
        ────────────────────────────────────────────────────────────────────────────── */}
        {activeTab === "retrofit" && (
          <div className="space-y-6 animate-fade-in">
            {/* Retrofit Simulation Controls */}
            <div className="rounded-2xl border p-5 sm:p-6 glass-card space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Fleet Retrofit Investment Parameters</h3>
                <span className="text-xs font-mono font-bold text-emerald-500 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  REAL-TIME DCF ENGINE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span style={{ color: "var(--text-2)" }}>Vessel Deadweight</span>
                    <span className="font-mono text-base font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1 font-mono" style={{ color: "var(--text-4)" }}>
                    <span>20k DWT</span>
                    <span>170k DWT</span>
                    <span>320k DWT</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span style={{ color: "var(--text-2)" }}>EU ETS Carbon Tax</span>
                    <span className="font-mono text-base font-bold text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-500/30">
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1 font-mono" style={{ color: "var(--text-4)" }}>
                    <span>€50/t</span>
                    <span>€100/t</span>
                    <span>€150/t</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span style={{ color: "var(--text-2)" }}>CAPEX Modifier</span>
                    <span className="font-mono text-base font-bold text-purple-500 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                      {capexModifier > 0 ? `+${capexModifier}%` : `${capexModifier}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={30}
                    step={5}
                    value={capexModifier}
                    onChange={(e) => setCapexModifier(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1 font-mono" style={{ color: "var(--text-4)" }}>
                    <span>-20% (Subsidy)</span>
                    <span>0% (Base)</span>
                    <span>+30% (High Inflation)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retrofit Evaluation Cards */}
            {roiData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {roiData.evaluations.map((ev, i) => (
                  <div
                    key={ev.retrofit_id}
                    className="rounded-2xl border p-5 sm:p-6 space-y-4 relative overflow-hidden flex flex-col justify-between glass-card card-interactive"
                    style={{
                      borderColor: i === 0 ? "#10b981" : "var(--border)",
                      background: i === 0 ? "rgba(16,185,129,0.08)" : "var(--bg-card)"
                    }}
                  >
                    {i === 0 && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500 text-white tracking-wider">
                        Highest 15Y NPV
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg pr-14" style={{ color: "var(--text-1)" }}>{ev.technology_name}</h3>
                      <p className="text-xs sm:text-sm text-emerald-500 font-bold mt-1">
                        CII Guarantee: {ev.cii_grade_guarantee}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm py-3 border-y" style={{ borderColor: "var(--border)" }}>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>Total Initial Investment:</span>
                        <span className="font-mono font-bold" style={{ color: "var(--text-1)" }}>${(ev.total_initial_investment_usd / 1e6).toFixed(2)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>Annual Tax Shield:</span>
                        <span className="font-mono font-bold text-emerald-500">+${(ev.annual_carbon_tax_shield_usd / 1e3).toFixed(0)}k / yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>Payback Period:</span>
                        <span className="font-mono font-bold text-sky-500">{ev.payback_period_years} Years</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-4)" }}>Internal Rate of Return:</span>
                        <span className="font-mono font-bold text-purple-500">{ev.irr_pct}% IRR</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs" style={{ color: "var(--text-4)" }}>15-Year Net Present Value (NPV @ 8% WACC):</p>
                      <p className="font-mono font-bold text-2xl text-emerald-500 mt-1">
                        +${(ev.npv_15yr_usd / 1e6).toFixed(2)} Million
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 15-Year Cumulative DCF Chart */}
            {roiData && (
              <div className="rounded-2xl border p-5 sm:p-6 glass-card" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-bold text-base sm:text-lg mb-1" style={{ color: "var(--text-1)" }}>15-Year Discounted Cash Flow (DCF) Trajectory</h3>
                <p className="text-xs sm:text-sm mb-5" style={{ color: "var(--text-3)" }}>Cumulative Net Value creation accounting for CAPEX recovery and EU ETS tax savings</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={Array.from({ length: 15 }, (_, y) => ({
                      year: `Yr ${y + 1}`,
                      Methanol: Math.round((roiData.evaluations.find(e => e.retrofit_id === "METHANOL_DUAL_FUEL")?.discounted_cashflows_15yr[y + 1] || 0) / 1000),
                      LNG: Math.round((roiData.evaluations.find(e => e.retrofit_id === "LNG_DUAL_FUEL")?.discounted_cashflows_15yr[y + 1] || 0) / 1000),
                      WindSail: Math.round((roiData.evaluations.find(e => e.retrofit_id === "WING_SAIL_WIND_ASSIST")?.discounted_cashflows_15yr[y + 1] || 0) / 1000),
                    }))}
                    barSize={20}
                  >
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--text-4)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={50} unit="k$" />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="p-3 rounded-xl border text-xs shadow-2xl space-y-1.5 glass-card" style={{ borderColor: "var(--border)" }}>
                            <p className="font-bold" style={{ color: "var(--text-1)" }}>{(payload[0].payload as any).year} Discounted Net Benefit</p>
                            {payload.map((p) => (
                              <p key={p.name} style={{ color: p.color }} className="text-xs font-semibold">
                                {p.name}: <strong>${Number(p.value).toLocaleString()}k</strong>
                              </p>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="Methanol" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="WindSail" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="LNG" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
