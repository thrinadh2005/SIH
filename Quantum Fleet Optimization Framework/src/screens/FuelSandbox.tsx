import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { fetchFuels, FuelPathway } from "../services/api"
import { Fuel, Leaf, ArrowRight, ShieldCheck, DollarSign } from "lucide-react"

interface Props {
  onNavigate: (id: string) => void
}

export default function FuelSandbox({ onNavigate }: Props) {
  const [fuels, setFuels] = useState<FuelPathway[]>([])
  const [selected, setSelected] = useState<string[]>([
    "vlsfo",
    "lng",
    "methanol",
  ])
  const [blendRatio, setBlendRatio] = useState(30)
  const [tab, setTab] = useState<"lca" | "economics" | "blend">("lca")

  useEffect(() => {
    fetchFuels()
      .then((res) => {
        setFuels(res)
        if (res.length > 0) {
          setSelected(res.slice(0, 3).map((f) => f.id))
        }
      })
      .catch(() => {})
  }, [])

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((x) => x !== id)
          : prev
        : [...prev, id],
    )

  const shown = fuels.filter((f) => selected.includes(f.id))
  const baseline = fuels.find((f) => f.id === "vlsfo") ||
    fuels[0] || {
      id: "vlsfo",
      name: "VLSFO",
      lhv_mj_kg: 40.4,
      cf_ttw: 3.114,
      cf_wtw: 3.206,
      cost_per_mt: 620,
      color: "#94a3b8",
    }
  const blendFuel =
    fuels.find((f) => f.id === "methanol" || f.id === "methanol_bio") ||
    fuels[1] ||
    baseline

  const blendedCO2 =
    baseline.cf_wtw * (1 - blendRatio / 100) +
    blendFuel.cf_wtw * (blendRatio / 100)
  const blendedCost =
    (baseline.cost_per_mt / (baseline.lhv_mj_kg || 40.4)) *
      (1 - blendRatio / 100) +
    (blendFuel.cost_per_mt / (blendFuel.lhv_mj_kg || 19.7)) * (blendRatio / 100)

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
                Alternative Fuel & Well-to-Wake Decarbonization Sandbox
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                IMO 2050 Net-Zero
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Well-to-Wake (WtW) lifecycle emissions, spot economics, and
              dual-fuel bunkering blend optimizer
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate("commercial")}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-sky-500/10 text-sky-500 border-sky-500/30"
            >
              Bunker Arbitrage →
            </button>
            <button
              onClick={() => onNavigate("compliance")}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
            >
              IMO CII Impact →
            </button>
          </div>
        </div>

        {/* Fuel selector */}
        <div className="panel-solid p-5 space-y-3">
          <p
            className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: "var(--text-3)" }}
          >
            Active Fuel Pathways in Assessment
          </p>
          <div className="flex flex-wrap gap-2">
            {fuels.map((f) => {
              const on = selected.includes(f.id)
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all"
                  style={{
                    background: on
                      ? "rgba(16,185,129,0.12)"
                      : "var(--bg-surface)",
                    borderColor: on ? "#10b981" : "var(--border)",
                    color: on ? "#10b981" : "var(--text-3)",
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: f.color }}
                  />
                  {f.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-lg border w-fit"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
          }}
        >
          {[
            ["lca", "Lifecycle WtW CO₂e"],
            ["economics", "Market Economics"],
            ["blend", "Dual-Fuel Blend Optimizer"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k as any)}
              className="px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all"
              style={{
                background: tab === k ? "#10b981" : "transparent",
                color: tab === k ? "#ffffff" : "var(--text-3)",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "lca" && (
          <div className="space-y-5">
            <div className="panel-solid p-5">
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Well-to-Wake Lifecycle CO₂e Emission Factors (tCO₂e / t-fuel)
              </h3>
              <p
                className="text-xs mt-0.5 mb-4"
                style={{ color: "var(--text-3)" }}
              >
                IMO 4th GHG lifecycle assessment including feedstock extraction,
                processing, bunkering, and combustion
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={shown.map((f) => ({
                    name: f.name,
                    value: f.cf_wtw,
                    color: f.color,
                  }))}
                  barSize={32}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--text-4)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-4)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="panel-solid p-2.5 text-xs shadow-xl">
                          <p style={{ color: "var(--text-1)" }}>
                            {(payload[0].payload as any).name}:{" "}
                            <strong>{payload[0].value} tCO₂e/t-fuel</strong>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {shown.map((f) => (
                      <Cell key={f.id} fill={f.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="panel-solid overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-marine">
                  <thead>
                    <tr>
                      <th>Fuel Pathway</th>
                      <th>LHV (MJ/kg)</th>
                      <th>Tank-to-Wake Factor</th>
                      <th>Well-to-Wake Factor</th>
                      <th>Decarbonization Delta</th>
                      <th>Market Spot Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((f) => {
                      const delta = (
                        ((f.cf_wtw - baseline.cf_wtw) /
                          (baseline.cf_wtw || 3.206)) *
                        100
                      ).toFixed(1)
                      return (
                        <tr key={f.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: f.color }}
                              />
                              <span
                                className="font-semibold"
                                style={{ color: "var(--text-1)" }}
                              >
                                {f.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className="font-mono-data"
                            style={{ color: "var(--text-2)" }}
                          >
                            {f.lhv_mj_kg} MJ/kg
                          </td>
                          <td
                            className="font-mono-data"
                            style={{ color: "var(--text-2)" }}
                          >
                            {f.cf_ttw}
                          </td>
                          <td
                            className="font-mono-data font-bold"
                            style={{ color: f.color }}
                          >
                            {f.cf_wtw}
                          </td>
                          <td
                            className="font-mono-data font-bold"
                            style={{
                              color:
                                parseFloat(delta) <= 0 ? "#10b981" : "#ef4444",
                            }}
                          >
                            {parseFloat(delta) < 0 ? "" : "+"}
                            {delta}%
                          </td>
                          <td
                            className="font-mono-data"
                            style={{ color: "var(--text-1)" }}
                          >
                            {f.cost_per_mt
                              ? `$${f.cost_per_mt}/MT`
                              : `$${f.cost_per_kwh}/kWh`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "economics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="panel-solid p-5">
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Fuel Market Cost ($ / MT)
              </h3>
              <p
                className="text-xs mt-0.5 mb-4"
                style={{ color: "var(--text-3)" }}
              >
                Current global average spot pricing per metric ton
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={shown.map((f) => ({
                    name: f.name,
                    value: f.cost_per_mt || 160,
                    color: f.color,
                  }))}
                  barSize={28}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--text-4)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-4)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="panel-solid p-2.5 text-xs shadow-xl">
                          <p style={{ color: "var(--text-1)" }}>
                            {(payload[0].payload as any).name}:{" "}
                            <strong>${payload[0].value} / MT</strong>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {shown.map((f) => (
                      <Cell key={f.id} fill={f.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="panel-solid p-5 flex flex-col justify-between">
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-1)" }}
                >
                  EU ETS Carbon Taxation Shield
                </h3>
                <p
                  className="text-xs mt-0.5 mb-3"
                  style={{ color: "var(--text-3)" }}
                >
                  Estimated carbon tax avoidance per voyage at €82.50/tCO₂
                </p>
                <div
                  className="p-4 rounded-lg space-y-2 border"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-3)" }}>
                      VLSFO Benchmark Tax:
                    </span>
                    <span className="font-mono-data font-bold text-rose-500">
                      $240,450 USD
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-3)" }}>
                      Green Methanol Net Tax:
                    </span>
                    <span className="font-mono-data font-bold text-emerald-500">
                      $11,250 USD
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-xs pt-2 border-t"
                    style={{ borderColor: "var(--border-sub)" }}
                  >
                    <span
                      className="font-bold"
                      style={{ color: "var(--text-1)" }}
                    >
                      Tax Shield Value:
                    </span>
                    <span className="font-mono-data font-bold text-emerald-500">
                      +$229,200 USD Saved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "blend" && (
          <div className="panel-solid p-5 space-y-5">
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-1)" }}
            >
              Dual-Fuel Co-Firing Blend Optimizer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: "var(--text-3)" }}>
                    {blendFuel.name} Co-Firing Fraction
                  </span>
                  <span className="font-mono-data font-bold text-emerald-500">
                    {blendRatio}% Blend
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blendRatio}
                  onChange={(e) => setBlendRatio(Number(e.target.value))}
                />
              </div>

              <div
                className="p-4 rounded-lg border space-y-2"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-3)" }}>
                    Blended WtW Factor:
                  </span>
                  <span className="font-mono-data font-bold text-sky-500">
                    {blendedCO2.toFixed(3)} tCO₂e/t
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-3)" }}>
                    Energy Cost Index:
                  </span>
                  <span className="font-mono-data font-bold text-amber-500">
                    ${blendedCost.toFixed(2)}/GJ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
