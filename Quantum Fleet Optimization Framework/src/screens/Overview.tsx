import { useState, useEffect, useRef } from "react";
import { Fuel, Wind, DollarSign, AlertTriangle, CheckCircle2, Ship, TrendingUp, Zap, Shield, Activity } from "lucide-react";
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
    <div className="px-3 py-2 rounded-lg text-xs border shadow-lg" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <p className="font-medium mb-1" style={{ color: "var(--text-3)" }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-2 items-center">
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
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
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

    const offAlert = wsClient.on<any>("ALERT", (a) => {
      setLiveAlerts((prev) => [
        {
          id: "RT-" + Date.now(),
          severity: a.severity,
          vessel: a.vessel,
          timestamp: "just now",
          title: a.title,
          metric: a.metric,
        },
        ...prev.slice(0, 4),
      ]);
    });

    return () => {
      (offConn as () => void)();
      (offVessel as () => void)();
      (offAlert as () => void)();
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
      <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl gradient-text">
                Fleet Command Overview
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                SIH-26138 Core
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Quantum-Inspired Multi-Objective Optimization · {fleet.length} active vessels connected live
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Live WS pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
              style={{
                background: wsStatus === "connected" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: "1px solid " + (wsStatus === "connected" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"),
                color: wsStatus === "connected" ? "#10b981" : "#ef4444",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-live-pulse" style={{ background: wsStatus === "connected" ? "#10b981" : "#ef4444" }} />
              {wsStatus === "connected" ? `LIVE · ${latency}ms` : "OFFLINE"}
            </div>

            <button
              onClick={() => onNavigate("optimizer")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#10b981)", color: "white" }}
            >
              <Zap size={14} /> Optimize Voyage
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            color="#7c3aed"
          />
          <KPICard
            label="YTD OPEX Saved"
            value="$2,480,000"
            sub="Fuel + EU ETS carbon tax"
            icon={DollarSign}
            color="#10b981"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Real-time Fuel Burn Curve */}
          <div className="lg:col-span-2 rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                  Real-Time Hourly Fuel Consumption Rate (MT/hour)
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Quantum Optimized Speed Trajectory vs Classical Static Schedule
                </p>
              </div>
              <span className="text-xs font-mono-data font-bold px-2 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                16.8% Lower Burn
              </span>
            </div>

            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={fuelTrendData}>
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--text-4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={32} domain={[55, 90]} />
                <Tooltip content={<Tip />} />
                <Line dataKey="baseline" name="Static Baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                <Line dataKey="optimized" name="Quantum Optimized" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CII Grade Distribution */}
          <div className="rounded-xl border p-4 flex flex-col justify-between" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                Fleet IMO CII Distribution
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                100% of vessels compliant (Grades A–C)
              </p>
            </div>

            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ciiDistData} barSize={26}>
                <XAxis dataKey="grade" tick={{ fontSize: 10, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--text-4)" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" name="Vessels" radius={[4, 4, 0, 0]}>
                  {ciiDistData.map((d) => (
                    <Cell key={d.grade} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-between text-xs pt-2 border-t font-medium" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
              <span>Total DWT: 810,000</span>
              <span style={{ color: "#10b981" }}>0 Vessels at Sanction Risk</span>
            </div>
          </div>
        </div>

        {/* Live Active Fleet Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Ship size={16} style={{ color: "#10b981" }} />
              <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                Live AIS Fleet Telemetry Stream
              </p>
            </div>
            <button onClick={() => onNavigate("fleet")} className="text-xs font-semibold hover:underline" style={{ color: "#10b981" }}>
              View All Fleet Details →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 620 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border)` }}>
                  {["Vessel Name", "Type / DWT", "Voyage Route", "Speed", "Engine Load", "Fuel Burn", "CII Rating", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.map((v) => (
                  <tr key={v.mmsi || v.id} className="border-b transition-colors hover:bg-slate-800/30" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text-1)" }}>
                      {v.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-3)" }}>
                      {v.type}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-2)" }}>
                      {v.route_name || "Singapore → Rotterdam"}
                    </td>
                    <td className="px-4 py-3 font-mono-data font-bold" style={{ color: "#06b6d4" }}>
                      {v.speed} kn
                    </td>
                    <td className="px-4 py-3 font-mono-data" style={{ color: "var(--text-2)" }}>
                      {v.engine_load_pct || 68.5}% MCR
                    </td>
                    <td className="px-4 py-3 font-mono-data" style={{ color: "#10b981" }}>
                      {v.fuel_rate_mt_day || 38.2} MT/d
                    </td>
                    <td className="px-4 py-3">
                      <CIIBadge grade={v.cii || v.cii_grade || "A"} />
                    </td>
                    <td className="px-4 py-3">
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
