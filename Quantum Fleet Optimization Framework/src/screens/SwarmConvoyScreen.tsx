import { useState, useEffect } from "react";
import {
  Users, Clock, DollarSign, CheckCircle, RefreshCw, Zap, Radio, Anchor, ShieldCheck
} from "lucide-react";
import { optimizeConvoySwarm, SwarmOptimizeResponse } from "../services/api";

interface Props {
  onNavigate: (id: string) => void;
}

export default function SwarmConvoyScreen({ onNavigate }: Props) {
  const [terminalId, setTerminalId] = useState("NLRTM");
  const [swarmData, setSwarmData] = useState<SwarmOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [negotiating, setNegotiating] = useState(false);

  const fetchSwarm = () => {
    setLoading(true);
    optimizeConvoySwarm(terminalId)
      .then(setSwarmData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSwarm();
  }, [terminalId]);

  const handleTriggerSwarmSync = () => {
    setNegotiating(true);
    setTimeout(() => {
      fetchSwarm();
      setNegotiating(false);
    }, 700);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Screen Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: "var(--text-1)" }}>
                Multi-Vessel Convoy Swarm Optimization
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                JIT Virtual Arrival
              </span>
            </div>
            <p className="text-sm sm:text-base mt-1" style={{ color: "var(--text-3)" }}>
              Multi-agent speed negotiation for terminal approaches · Eliminates anchorage idling & demurrage penalties
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border outline-none font-sans cursor-pointer transition-colors hover:border-purple-400"
              style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-1)" }}
            >
              <option value="NLRTM">Port of Rotterdam (Maasvlakte 2 Terminal)</option>
              <option value="SGSIN">Port of Singapore (Tuas Mega Port)</option>
              <option value="BEANR">Port of Antwerp-Bruges (Deurganckdock)</option>
              <option value="CNSHA">Port of Shanghai (Yangshan Deep-Water Port)</option>
              <option value="USLAX">Port of Los Angeles (Pier 400 APM Terminal)</option>
              <option value="USNYC">Port of New York & NJ (Maher Container Terminal)</option>
              <option value="INNSA">Jawaharlal Nehru Port (JNPT Mumbai Gateway)</option>
              <option value="AEJEA">Port of Jebel Ali / Dubai (DP World T1/T2)</option>
              <option value="KRPUS">Port of Busan (Pusan Newport Terminal)</option>
              <option value="DEHAM">Port of Hamburg (HHLA Container Terminal Altenwerder)</option>
            </select>

            <button
              onClick={handleTriggerSwarmSync}
              disabled={negotiating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
            >
              <RefreshCw size={15} className={negotiating ? "animate-spin" : ""} />
              {negotiating ? "Negotiating Speeds..." : "Re-sync Convoy Speeds"}
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        {swarmData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>Demurrage Saved</p>
                <p className="font-mono font-bold text-2xl sm:text-3xl text-emerald-500 mt-1">
                  ${swarmData.summary_metrics.total_demurrage_penalties_avoided_usd.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-500 font-bold mt-0.5">Zero charter penalty</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <DollarSign size={26} />
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>Idling Eliminated</p>
                <p className="font-mono font-bold text-2xl sm:text-3xl text-sky-500 mt-1">
                  {swarmData.summary_metrics.total_anchorage_idling_eliminated_hours}h
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>Avoided at anchorage</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
                <Clock size={26} />
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>Bunker Fuel Saved</p>
                <p className="font-mono font-bold text-2xl sm:text-3xl text-purple-500 mt-1">
                  {swarmData.summary_metrics.total_fuel_saved_mt} MT
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color: "#8b5cf6" }}>Slow steaming cut</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Zap size={26} />
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex items-center justify-between glass-card card-interactive" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-3)" }}>Swarm Efficiency</p>
                <p className="font-mono font-bold text-2xl sm:text-3xl text-amber-500 mt-1">
                  {swarmData.summary_metrics.fleet_coordination_efficiency_pct}%
                </p>
                <p className="text-xs text-emerald-500 font-bold mt-0.5">JIT Consensus Achieved</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <CheckCircle size={26} />
              </div>
            </div>
          </div>
        )}

        {/* Convoy Schedule Table */}
        {swarmData && (
          <div className="rounded-2xl border overflow-hidden glass-card" style={{ borderColor: "var(--border)" }}>
            <div className="p-5 sm:p-6 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-bold text-base sm:text-lg" style={{ color: "var(--text-1)" }}>
                  {swarmData.terminal_name} — Coordinated Vessel Arrival Schedule
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>
                  Virtual Arrival speeds negotiated dynamically to match assigned terminal quay crane windows
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Berth Slot", "Vessel Name", "Vessel Type", "Distance to Port", "Original Speed", "JIT Swarm Speed", "Speed Delta", "Demurrage Saved"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left font-bold uppercase tracking-wider text-xs" style={{ color: "var(--text-4)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {swarmData.scheduled_vessels.map((v) => (
                    <tr key={v.vessel_id} className="border-b transition-colors hover:bg-slate-500/10" style={{ borderColor: "var(--border)" }}>
                      <td className="px-5 py-4 font-mono font-bold text-sm" style={{ color: "#8b5cf6" }}>{v.target_berth_slot}</td>
                      <td className="px-5 py-4 font-bold text-base" style={{ color: "var(--text-1)" }}>{v.name}</td>
                      <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-3)" }}>{v.type}</td>
                      <td className="px-5 py-4 font-mono" style={{ color: "var(--text-2)" }}>{v.distance_nm} NM</td>
                      <td className="px-5 py-4 font-mono line-through" style={{ color: "var(--text-4)" }}>{v.original_speed_knots} kn</td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-500 text-base">{v.negotiated_jit_speed_knots} kn</td>
                      <td className="px-5 py-4 font-mono text-emerald-500 font-bold">-{v.speed_reduction_pct}%</td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-500 text-base">
                        +${v.demurrage_saved_usd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Explanatory Banner */}
        <div className="rounded-2xl border p-5 flex items-center gap-4 glass-card" style={{ borderColor: "rgba(139,92,246,0.3)" }}>
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Radio size={22} className="animate-pulse" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-base" style={{ color: "#8b5cf6" }}>Just-In-Time (JIT) Virtual Arrival Protocol</p>
            <p className="mt-1" style={{ color: "var(--text-2)" }}>
              Instead of racing to port at high speed only to drop anchor and idle for 24–48 hours, GreenFleet Quantum negotiates speed reductions across the convoy so each vessel arrives exactly when its designated berth crane and pilot are ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
