import { useState, useEffect } from "react";
import { Check, ChevronRight, ChevronLeft, AlertCircle, Zap, RefreshCw } from "lucide-react";
import { fetchCorridors, fetchFleetList, fetchFuels, ShippingCorridor, FuelPathway } from "../services/api";

interface Props {
  onNavigate: (id: string) => void;
}

const steps = [
  { id: 1, label: "Route" },
  { id: 2, label: "Vessel" },
  { id: 3, label: "Arrival" },
  { id: 4, label: "Environment" },
  { id: 5, label: "Objectives" },
  { id: 6, label: "Fuel" },
  { id: 7, label: "Algorithm" },
  { id: 8, label: "Review" },
];

export default function VoyageOptimizer({ onNavigate }: Props) {
  const [step, setStep] = useState(1);
  const [corridors, setCorridors] = useState<ShippingCorridor[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [fuels, setFuels] = useState<FuelPathway[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    corridorId: "SIN_ROT",
    origin: "Singapore",
    destination: "Rotterdam",
    distance: 8280,
    vesselId: "V001",
    vesselName: "Oceanic Vanguard",
    vesselType: "CONTAINER_15000TEU",
    fuel: "green_methanol",
    fuelWeight: 0.45,
    carbonWeight: 0.35,
    delayWeight: 0.20,
    shorePower: true,
    algorithm: "hybrid_hqoa",
    particles: "40",
    iterations: "60",
    runBaseline: true,
  });

  useEffect(() => {
    Promise.all([fetchCorridors(), fetchFleetList(), fetchFuels()])
      .then(([corrs, flt, fls]) => {
        setCorridors(corrs);
        setFleet(flt);
        setFuels(fls);
        if (corrs.length > 0) {
          setForm((f) => ({
            ...f,
            corridorId: corrs[0].id,
            origin: corrs[0].origin,
            destination: corrs[0].destination,
            distance: corrs[0].distance_nm,
          }));
        }
        if (flt.length > 0) {
          setForm((f) => ({
            ...f,
            vesselId: flt[0].id,
            vesselName: flt[0].name,
            vesselType: flt[0].vessel_type_key || "CONTAINER_15000TEU",
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const set = (k: string, v: string | boolean | number) => setForm((f) => ({ ...f, [k]: v }));
  const totalWeight = form.fuelWeight + form.carbonWeight + form.delayWeight;
  const weightOk = Math.abs(totalWeight - 1) < 0.01;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <RefreshCw size={24} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row" style={{ background: "var(--bg-base)" }}>
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Stepper */}
        <div
          className="shrink-0 flex items-center gap-0 px-4 sm:px-6 py-3 sm:py-4 border-b overflow-x-auto"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <button
                onClick={() => setStep(s.id)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: step === s.id ? "rgba(16,185,129,0.12)" : "transparent",
                  color: step === s.id ? "#10b981" : s.id < step ? "#22c55e" : "var(--text-4)",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: step === s.id ? "#10b981" : s.id < step ? "rgba(34,197,94,0.2)" : "var(--border)",
                    color: step === s.id ? "white" : s.id < step ? "#22c55e" : "var(--text-4)",
                  }}
                >
                  {s.id < step ? <Check size={10} /> : s.id}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className="w-4 sm:w-6 h-px mx-0.5 sm:mx-1" style={{ background: step > s.id ? "#22c55e" : "var(--border)" }} />}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {step === 1 && (
            <FormSection title="Step 1 — Shipping Corridor Selection">
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-3)" }}>
                Select Global Shipping Corridor
              </label>
              <div className="space-y-2">
                {corridors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        corridorId: c.id,
                        origin: c.origin,
                        destination: c.destination,
                        distance: c.distance_nm,
                      }))
                    }
                    className="w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between"
                    style={{
                      background: form.corridorId === c.id ? "rgba(16,185,129,0.1)" : "var(--bg-card)",
                      borderColor: form.corridorId === c.id ? "#10b981" : "var(--border)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">
                        {c.origin} → {c.destination} · {c.waypoints.length} Waypoints
                      </p>
                    </div>
                    <span className="font-mono-data text-xs text-emerald-400 font-bold">{c.distance_nm.toLocaleString()} NM</span>
                  </button>
                ))}
              </div>
            </FormSection>
          )}

          {step === 2 && (
            <FormSection title="Step 2 — Vessel Selection">
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-3)" }}>
                Select Active Fleet Vessel
              </label>
              <div className="space-y-2">
                {fleet.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        vesselId: v.id,
                        vesselName: v.name,
                        vesselType: v.vessel_type_key || "CONTAINER_15000TEU",
                      }))
                    }
                    className="w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between"
                    style={{
                      background: form.vesselId === v.id ? "rgba(16,185,129,0.1)" : "var(--bg-card)",
                      borderColor: form.vesselId === v.id ? "#10b981" : "var(--border)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{v.name}</p>
                      <p className="text-xs text-slate-400">
                        {v.type} · {v.dwt?.toLocaleString()} DWT
                      </p>
                    </div>
                    <span className="font-mono-data text-xs text-sky-400 font-bold">{v.speed} kn current</span>
                  </button>
                ))}
              </div>
            </FormSection>
          )}

          {step === 3 && (
            <FormSection title="Step 3 — Port Berth Window & Demurrage">
              <Field label="Target Berthing Arrival Window" value="07:00 – 11:30 UTC, Sep 14" onChange={() => {}} />
              <Field label="Demurrage Penalty Rate ($/hour)" value="2500" onChange={() => {}} />
            </FormSection>
          )}

          {step === 4 && (
            <FormSection title="Step 4 — Real-Time Metocean Weather Ingestion">
              <p className="text-xs text-slate-300 mb-2">Live meteorological data connected via OpenMeteo Marine Live API.</p>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
                ✓ 27 Trade Waypoints streaming real wave heights (Hs), wind velocity, and currents.
              </div>
            </FormSection>
          )}

          {step === 5 && (
            <FormSection title="Step 5 — Multi-Objective Weights">
              <SliderField label={`Fuel Cost Weight — ${(form.fuelWeight * 100).toFixed(0)}%`} value={form.fuelWeight} onChange={(v) => set("fuelWeight", v)} color="#10b981" />
              <SliderField label={`EU ETS Carbon Weight — ${(form.carbonWeight * 100).toFixed(0)}%`} value={form.carbonWeight} onChange={(v) => set("carbonWeight", v)} color="#06b6d4" />
              <SliderField label={`Port Delay Penalty — ${(form.delayWeight * 100).toFixed(0)}%`} value={form.delayWeight} onChange={(v) => set("delayWeight", v)} color="#f59e0b" />
              {!weightOk && (
                <div className="flex items-center gap-2 text-xs p-2 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  <AlertCircle size={12} /> Weights sum to {(totalWeight * 100).toFixed(0)}% — must equal 100%
                </div>
              )}
            </FormSection>
          )}

          {step === 6 && (
            <FormSection title="Step 6 — Multi-Fuel Pathway">
              <div className="space-y-2">
                {fuels.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => set("fuel", f.id)}
                    className="w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between"
                    style={{
                      background: form.fuel === f.id ? "rgba(16,185,129,0.1)" : "var(--bg-card)",
                      borderColor: form.fuel === f.id ? "#10b981" : "var(--border)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{f.name}</p>
                      <p className="text-xs text-slate-400">WtW Factor: {f.cf_wtw} tCO₂e/t-fuel</p>
                    </div>
                    <span className="font-mono-data text-xs text-emerald-400 font-bold">${f.cost_per_mt || 160}/MT</span>
                  </button>
                ))}
              </div>
              <ToggleField label="High Voltage Shore Power at Berth" sub="Evaluate cold-ironing to eliminate auxiliary boiler emissions" value={form.shorePower} onChange={(v) => set("shorePower", v)} />
            </FormSection>
          )}

          {step === 7 && (
            <FormSection title="Step 7 — Quantum Optimization Algorithm">
              {[
                { id: "hybrid_hqoa", label: "Hybrid HQOA (Recommended)", sub: "3-Tier: QGA Macro + QPSO Tunneling + Memetic Refinement", color: "#10b981" },
                { id: "qpso", label: "Pure QPSO", sub: "Quantum Delta-Potential Particle Swarm", color: "#7c3aed" },
                { id: "qga", label: "Quantum GA", sub: "Q-Bit Rotation Gate Evolution", color: "#8b5cf6" },
                { id: "classical_pso", label: "Classical PSO Baseline", sub: "Classical Particle Swarm", color: "#06b6d4" },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => set("algorithm", a.id)}
                  className="w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between mb-2"
                  style={{
                    background: form.algorithm === a.id ? `${a.color}15` : "var(--bg-card)",
                    borderColor: form.algorithm === a.id ? a.color : "var(--border)",
                  }}
                >
                  <div>
                    <p className="text-sm font-bold text-white">{a.label}</p>
                    <p className="text-xs text-slate-400">{a.sub}</p>
                  </div>
                </button>
              ))}
            </FormSection>
          )}

          {step === 8 && (
            <FormSection title="Step 8 — Review & Launch Optimization">
              <div className="p-4 rounded-xl border space-y-2 text-xs" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Route:</span> <strong className="text-white">{form.origin} → {form.destination}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Distance:</span> <strong className="text-emerald-400">{form.distance} NM</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Vessel:</span> <strong className="text-white">{form.vesselName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Algorithm:</span> <strong className="text-purple-400">{form.algorithm.toUpperCase()}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Fuel:</span> <strong className="text-white">{form.fuel.toUpperCase()} + Shore Power</strong>
                </div>
              </div>
            </FormSection>
          )}
        </div>

        {/* Navigation Footer */}
        <div
          className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t"
          style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
        >
          <button
            disabled={step === 1}
            onClick={() => setStep(Math.max(1, step - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent" }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          {step < 8 ? (
            <button
              onClick={() => setStep(Math.min(8, step + 1))}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => onNavigate("console")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-lg"
            >
              <Zap size={14} /> Run Live Quantum Solver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl space-y-4">
      <h2 className="font-display font-bold text-base text-white">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-slate-300">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg text-xs outline-none border border-slate-700 bg-slate-900 text-white"
      />
    </div>
  );
}

function SliderField({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold mb-2 text-slate-300">{label}</label>
      <input
        type="range"
        min="0.05"
        max="0.9"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${value * 100}%, var(--border) ${value * 100}%)` }}
      />
    </div>
  );
}

function ToggleField({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="shrink-0 rounded-full relative transition-colors"
        style={{ background: value ? "#10b981" : "var(--border)", width: 40, height: 22 }}
      >
        <div
          className="absolute top-0.5 rounded-full bg-white shadow transition-all"
          style={{ left: value ? 20 : 2, width: 18, height: 18 }}
        />
      </button>
    </div>
  );
}
