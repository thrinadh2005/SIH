import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchFuels, FuelPathway } from "../services/api";

interface Props {
  onNavigate: (id: string) => void;
}

export default function FuelSandbox({ onNavigate }: Props) {
  const [fuels, setFuels] = useState<FuelPathway[]>([]);
  const [selected, setSelected] = useState<string[]>(["vlsfo", "lng", "methanol"]);
  const [blendRatio, setBlendRatio] = useState(30);
  const [tab, setTab] = useState<"lca" | "economics" | "blend">("lca");

  useEffect(() => {
    fetchFuels()
      .then((res) => {
        setFuels(res);
        if (res.length > 0) {
          setSelected(res.slice(0, 3).map((f) => f.id));
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [...prev, id]
    );

  const shown = fuels.filter((f) => selected.includes(f.id));
  const baseline = fuels.find((f) => f.id === "vlsfo") || fuels[0] || {
    id: "vlsfo",
    name: "VLSFO",
    lhv_mj_kg: 40.4,
    cf_ttw: 3.114,
    cf_wtw: 3.206,
    cost_per_mt: 620,
    color: "#94a3b8",
  };
  const blendFuel = fuels.find((f) => f.id === "methanol" || f.id === "methanol_bio") || fuels[1] || baseline;

  const blendedCO2 = baseline.cf_wtw * (1 - blendRatio / 100) + blendFuel.cf_wtw * (blendRatio / 100);
  const blendedCost = (baseline.cost_per_mt / (baseline.lhv_mj_kg || 40.4)) * (1 - blendRatio / 100) +
    (blendFuel.cost_per_mt / (blendFuel.lhv_mj_kg || 19.7)) * (blendRatio / 100);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>
      <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg sm:text-xl" style={{ color: "var(--text-1)" }}>
                Alternative Fuel & Well-to-Wake Decarbonization Sandbox
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                IMO 2050 Net-Zero
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
              Well-to-wake lifecycle analysis · Market pricing · Cold-ironing at berth
            </p>
          </div>
          <button
            onClick={() => onNavigate("compliance")}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:bg-emerald-500/10"
            style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "transparent" }}
          >
            IMO CII Impact →
          </button>
        </div>

        {/* Fuel selector */}
        <div className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "var(--text-4)" }}>
            Select Fuel Pathways from Live Registry
          </p>
          <div className="flex flex-wrap gap-2">
            {fuels.map((f) => {
              const on = selected.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
                  style={{
                    background: on ? f.color + "18" : "var(--bg-base)",
                    borderColor: on ? f.color : "var(--border)",
                    color: on ? f.color : "var(--text-3)",
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {[
            ["lca", "Lifecycle WtW CO₂e"],
            ["economics", "Market Economics"],
            ["blend", "Dual-Fuel Blend Optimizer"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k as any)}
              className="px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
              style={{ background: tab === k ? "#10b981" : "transparent", color: tab === k ? "white" : "var(--text-3)" }}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "lca" && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
                Well-to-Wake Lifecycle CO₂e Emission Factors (tCO₂e / t-fuel)
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
                IMO 4th GHG lifecycle assessment including feedstock, processing, bunkering, and combustion
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={shown.map((f) => ({ name: f.name, value: f.cf_wtw, color: f.color }))} barSize={36}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-4)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="px-2 py-1.5 rounded border text-xs shadow-lg" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                          <p style={{ color: "var(--text-1)" }}>
                            {(payload[0].payload as any).name}: <strong>{payload[0].value} tCO₂e/t-fuel</strong>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {shown.map((f) => (
                      <Cell key={f.id} fill={f.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth: 460 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid var(--border)` }}>
                      {["Fuel Pathway", "LHV (MJ/kg)", "Tank-to-Wake", "Well-to-Wake", "Decarbonization Delta", "Market Price"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((f) => {
                      const delta = (((f.cf_wtw - baseline.cf_wtw) / (baseline.cf_wtw || 3.206)) * 100).toFixed(1);
                      return (
                        <tr key={f.id} className="border-b transition-colors hover:bg-slate-800/30" style={{ borderColor: "var(--border)" }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.color }} />
                              <span className="font-semibold" style={{ color: "var(--text-1)" }}>
                                {f.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono-data" style={{ color: "var(--text-2)" }}>
                            {f.lhv_mj_kg} MJ/kg
                          </td>
                          <td className="px-4 py-3 font-mono-data" style={{ color: "var(--text-2)" }}>
                            {f.cf_ttw}
                          </td>
                          <td className="px-4 py-3 font-mono-data font-bold" style={{ color: f.color }}>
                            {f.cf_wtw}
                          </td>
                          <td className="px-4 py-3 font-mono-data font-bold" style={{ color: parseFloat(delta) <= 0 ? "#10b981" : "#ef4444" }}>
                            {parseFloat(delta) < 0 ? "" : "+"}
                            {delta}%
                          </td>
                          <td className="px-4 py-3 font-mono-data" style={{ color: "var(--text-1)" }}>
                            {f.cost_per_mt ? `$${f.cost_per_mt}/MT` : `$${f.cost_per_kwh}/kWh`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "economics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
                Fuel Market Cost ($ / MT)
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
                Current bunker pricing per metric ton
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={shown.map((f) => ({ name: f.name, value: f.cost_per_mt || 160, color: f.color }))} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-4)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="px-2 py-1.5 rounded border text-xs shadow-lg" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                          <p style={{ color: "var(--text-1)" }}>
                            {(payload[0].payload as any).name}: <strong>${payload[0].value} / MT</strong>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {shown.map((f) => (
                      <Cell key={f.id} fill={f.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border p-4 flex flex-col justify-between" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
                  EU ETS Carbon Taxation Shield
                </p>
                <p className="text-xs mb-3" style={{ color: "var(--text-3)" }}>
                  Estimated carbon tax avoidance per voyage at $75/tCO₂
                </p>
              </div>

              <div className="space-y-2">
                {shown.map((f) => {
                  const carbonAvoided = Math.max(0, baseline.cf_wtw - f.cf_wtw) * 500;
                  const taxSaved = Math.round(carbonAvoided * 75);
                  return (
                    <div key={f.id} className="flex justify-between items-center py-1.5 border-b text-xs" style={{ borderColor: "var(--border)" }}>
                      <span style={{ color: f.color }}>{f.name}</span>
                      <span className="font-mono-data font-bold text-emerald-400">+${taxSaved.toLocaleString()} Saved</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] pt-2" style={{ color: "var(--text-4)" }}>
                * Based on EU ETS Maritime Phase-in 100% compliance threshold.
              </p>
            </div>
          </div>
        )}

        {tab === "blend" && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 sm:p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>
                Dual-Fuel Blend Optimizer ({baseline.name} + {blendFuel.name})
              </p>
              <p className="text-xs mb-5" style={{ color: "var(--text-3)" }}>
                Adjust the blend ratio to balance CII rating compliance against total fuel expenditures
              </p>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: "var(--text-3)" }}>
                    {blendFuel.name} blend: <strong style={{ color: "#10b981" }}>{blendRatio}%</strong>
                  </span>
                  <span style={{ color: "var(--text-3)" }}>
                    {baseline.name}: <strong style={{ color: "#94a3b8" }}>{100 - blendRatio}%</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={blendRatio}
                  onChange={(e) => setBlendRatio(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#10b981" }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Blended CO₂e Factor", value: `${blendedCO2.toFixed(3)}`, unit: "tCO₂e / t-fuel", color: blendedCO2 < 1.5 ? "#10b981" : "#f59e0b" },
                  {
                    label: "CO₂e Reduction",
                    value: `${(((baseline.cf_wtw - blendedCO2) / (baseline.cf_wtw || 3.206)) * 100).toFixed(1)}%`,
                    unit: `vs 100% ${baseline.name}`,
                    color: "#10b981",
                  },
                  { label: "Energy Cost Index", value: `$${blendedCost.toFixed(2)}`, unit: "/ MJ equivalent", color: "var(--text-1)" },
                  {
                    label: "IMO 2030 Target",
                    value: blendRatio >= 35 ? "✓ Compliant (Grade A)" : `${35 - blendRatio}% more needed`,
                    unit: blendRatio >= 35 ? "Exceeds IMO curve" : "To achieve Grade A",
                    color: blendRatio >= 35 ? "#10b981" : "#ef4444",
                  },
                ].map((k) => (
                  <div key={k.label} className="rounded-lg p-3 text-center border" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {k.label}
                    </p>
                    <p className="font-mono-data font-bold text-base mt-1" style={{ color: k.color }}>
                      {k.value}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
                      {k.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
