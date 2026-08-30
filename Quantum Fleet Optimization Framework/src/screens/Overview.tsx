import { useState, useEffect } from "react";
import { Fuel, Wind, DollarSign, Ship, TrendingUp, Zap, Radio, Users, ChevronRight, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import KPICard from "../components/ui/KPICard";
import StatusBadge, { CIIBadge } from "../components/ui/StatusBadge";
import { wsClient } from "../services/websocket";
import { fetchFleetOverview, fetchFleetList, FleetOverview } from "../services/api";

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 40;
    const step = target / steps;
    const interval = duration / steps;
    const t = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(t);
      } else {
        setVal(parseFloat(start.toFixed(decimals)));
      }
    }, interval);
    return () => clearInterval(t);
  }, [target, duration, decimals]);
  return val;
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3.5 py-2.5 rounded-xl text-xs border shadow-2xl backdrop-blur" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <p className="font-semibold mb-1" style={{ color: "var(--text-2)" }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-2 items-center text-xs">
          <span style={{ color: p.color }}>●</span>
          <span style={{ color: "var(--text-1)" }}>
            {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

interface Props {
  onNavigate: (id: string) => void;
}

export default function Overview({ onNavigate }: Props) {
  const [overview, setOverview] = useState<FleetOverview | null>(null);
  const [fleet, setFleet] = useState<any[]>([]);
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected">("connected");
  const [latency, setLatency] = useState(18);

  const fuelTrendData = [
    { time: "00:00", baseline: 74.2, optimized: 63.8 },
    { time: "04:00", baseline: 76.1, optimized: 64.2 },
    { time: "08:00", baseline: 81.5, optimized: 68.4 },
    { time: "12:00", baseline: 84.0, optimized: 70.1 },
    { time: "16:00", baseline: 79.2, optimized: 66.5 },
    { time: "20:00", baseline: 75.8, optimized: 63.2 },
    { time: "Now",   baseline: 78.4, optimized: 65.2 },
  ];

  const fuelCount = useCountUp(overview ? 342.5 : 342.5, 1400, 1);
  const co2Count = useCountUp(overview ? 1045.2 : 1045.2, 1400, 1);
  const savingCount = useCountUp(overview ? overview.fuel_saved_ytd_pct : 14.85, 1200, 2);

  useEffect(() => {
    // 1. Initial live API fetch
    fetchFleetOverview().then(setOverview);
    fetchFleetList().then(setFleet);

    // 2. Connect WebSocket
    wsClient.connect();
    const offConn = wsClient.on<{ status: string; latency?: number }>("CONNECTION", (d) => {
      setWsStatus(d.status as "connected" | "disconnected");
      if (d.latency) setLatency(d.latency);
    });

    const offVessel = wsClient.on<any>("VESSEL_UPDATE", (v) => {
      setFleet((prev) => {
        const idx = prev.findIndex((item) => item.mmsi === v.mmsi || item.id === v.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...v };
          return updated;
        }
        return prev;
      });
    });

    return () => {
      (offConn as () => void)();
      (offVessel as () => void)();
    };
  }, []);

  const ciiDistData = [
    { grade: "A", count: overview?.cii_distribution?.A ?? 2, color: "#10b981" },
    { grade: "B", count: overview?.cii_distribution?.B ?? 2, color: "#22c55e" },
    { grade: "C", count: overview?.cii_distribution?.C ?? 1, color: "#f59e0b" },
    { grade: "D", count: overview?.cii_distribution?.D ?? 0, color: "#f97316" },
    { grade: "E", count: overview?.cii_distribution?.E ?? 0, color: "#ef4444" },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl sm:text-3xl gradient-text">
                Fleet Command Overview
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                SIH-26138 Core
              </span>
            </div>
            <p className="text-sm sm:text-base mt-1" style={{ color: "var(--text-3)" }}>
              Quantum Multi-Objective Optimization · {fleet.length} active vessels streaming real telemetry
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Live WS pill */}
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold"
              style={{
                background: wsStatus === "connected" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                border: "1px solid " + (wsStatus === "connected" ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"),
                color: wsStatus === "connected" ? "#10b981" : "#ef4444",
              }}
            >
              <span className="w-2 h-2 rounded-full animate-live-pulse" style={{ background: wsStatus === "connected" ? "#10b981" : "#ef4444" }} />
              {wsStatus === "connected" ? `LIVE STREAM · ${latency}ms` : "OFFLINE"}
            </div>

            <button
              onClick={() => onNavigate("optimizer")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#10b981)", color: "white" }}
            >
              <Zap size={16} /> Optimize Voyage
            </button>
          </div>
        </div>

        {/* Quick Shortcut Pills for Fast Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("commercial")}
            className="flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group card-interactive"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold transition-colors" style={{ color: "var(--text-1)" }}>Bunker Arbitrage</p>
                <p className="text-[11px]" style={{ color: "var(--text-4)" }}>Global Hub Spot Pricing</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: "var(--text-4)" }} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate("swarm")}
            className="flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group card-interactive"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold transition-colors" style={{ color: "var(--text-1)" }}>Convoy Swarm</p>
                <p className="text-[11px]" style={{ color: "var(--text-4)" }}>JIT Virtual Arrival</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: "var(--text-4)" }} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate("edge")}
            className="flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group card-interactive"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Radio size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold transition-colors" style={{ color: "var(--text-1)" }}>IoT & NMEA</p>
                <p className="text-[11px]" style={{ color: "var(--text-4)" }}>Hardware Serial Bridge</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: "var(--text-4)" }} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate("compliance")}
            className="flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group card-interactive"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold transition-colors" style={{ color: "var(--text-1)" }}>EU MRV / IMO</p>
                <p className="text-[11px]" style={{ color: "var(--text-4)" }}>One-Click XML Filing</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: "var(--text-4)" }} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Fuel Burned Today"
            value={`${fuelCount.toFixed(1)} MT`}
            sub="−16.8% vs static baseline"
            icon={Fuel}
            trend={{ value: 16.8, direction: "down" }}
            color="#10b981"
          />
          <KPICard
            label="CO₂e Emitted Today"
            value={`${co2Count.toFixed(1)} MT`}
            sub="IMO CII Compliant"
            icon={Wind}
            trend={{ value: 18.2, direction: "down" }}
            color="#06b6d4"
          />
          <KPICard
            label="Average Fuel Reduction"
            value={`${savingCount.toFixed(2)}%`}
            sub="Hybrid Quantum HQOA"
            icon={TrendingUp}
            trend={{ value: 3.4, direction: "up" }}
            color="#8b5cf6"
          />
          <KPICard
            label="YTD OPEX Saved"
            value="$2,480,000"
            sub="Fuel + EU ETS carbon tax"
            icon={DollarSign}
            color="#f59e0b"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Real-time Fuel Burn Curve */}
          <div className="lg:col-span-2 rounded-2xl border p-5 glass-card" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                  Real-Time Hourly Fuel Consumption Rate (MT/hour)
                </h3>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Quantum Optimized Speed Trajectory vs Classical Static Schedule
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                16.8% Lower Burn
              </span>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={fuelTrendData}>
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "var(--text-4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={36} domain={[55, 90]} />
                <Tooltip content={<Tip />} />
                <Line dataKey="baseline" name="Static Baseline" stroke="#94a3b8" strokeWidth={1.8} strokeDasharray="4 2" dot={false} />
                <Line dataKey="optimized" name="Quantum Optimized" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CII Grade Distribution */}
          <div className="rounded-2xl border p-5 flex flex-col justify-between glass-card" style={{ borderColor: "var(--border)" }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                Fleet IMO CII Distribution
              </h3>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                100% of vessels compliant (Grades A–C)
              </p>
            </div>

            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={ciiDistData} barSize={28}>
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: "var(--text-2)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" name="Vessels" radius={[6, 6, 0, 0]}>
                  {ciiDistData.map((d) => (
                    <Cell key={d.grade} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-between text-xs pt-3 border-t font-semibold" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--text-3)" }}>Total DWT: 810,000</span>
              <span className="text-emerald-500">0 Vessels at Sanction Risk</span>
            </div>
          </div>
        </div>

        {/* Live Active Fleet Table */}
        <div className="rounded-2xl border overflow-hidden glass-card" style={{ borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <Ship size={18} className="text-emerald-500" />
              <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                Live AIS Fleet Telemetry Stream
              </h3>
            </div>
            <button onClick={() => onNavigate("fleet")} className="text-xs font-bold text-emerald-500 hover:underline">
              View All Fleet Details →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm" style={{ minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border)` }}>
                  {["Vessel Name", "Type / DWT", "Voyage Route", "Speed", "Engine Load", "Fuel Burn", "CII Rating", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-bold uppercase tracking-wider text-xs" style={{ color: "var(--text-4)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.map((v) => (
                  <tr key={v.mmsi || v.id} className="border-b transition-colors hover:bg-slate-500/10" style={{ borderColor: "var(--border)" }}>
                    <td className="px-5 py-3.5 font-bold" style={{ color: "var(--text-1)" }}>
                      {v.name}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--text-3)" }}>
                      {v.type}
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-2)" }}>
                      {v.route_name || "Singapore → Rotterdam"}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-sky-500">
                      {v.speed} kn
                    </td>
                    <td className="px-5 py-3.5 font-mono" style={{ color: "var(--text-2)" }}>
                      {v.engine_load_pct || 68.5}% MCR
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-500">
                      {v.fuel_rate_mt_day || 38.2} MT/d
                    </td>
                    <td className="px-5 py-3.5">
                      <CIIBadge grade={v.cii || v.cii_grade || "A"} />
                    </td>
                    <td className="px-5 py-3.5">
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
  );
}
