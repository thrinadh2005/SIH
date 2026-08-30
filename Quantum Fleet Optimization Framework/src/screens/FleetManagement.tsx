import { useState, useEffect } from "react";
import { Search, Filter, Ship, Zap, ArrowUpRight } from "lucide-react";
import StatusBadge, { CIIBadge } from "../components/ui/StatusBadge";
import { fetchFleetList } from "../services/api";
import { wsClient } from "../services/websocket";

interface Props {
  onNavigate: (id: string) => void;
}

const allStatuses = ["all", "optimized", "normal", "at-risk", "optimization-running"];

export default function FleetManagement({ onNavigate }: Props) {
  const [fleet, setFleet] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "speed" | "fuel_rate_mt_day" | "attained_cii">("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  useEffect(() => {
    fetchFleetList().then(setFleet);

    wsClient.connect();
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
      (offVessel as () => void)();
    };
  }, []);

  const setSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const filtered = fleet
    .filter((v) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.imo?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.mmsi?.includes(q);
      const matchS = status === "all" || v.status === status;
      return matchQ && matchS;
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? a.name;
      const bv = b[sortKey] ?? b.name;
      if (av < bv) return -sortDir;
      if (av > bv) return sortDir;
      return 0;
    });

  const SortTh = ({ label, k }: { label: string; k: typeof sortKey }) => (
    <th
      className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide cursor-pointer select-none"
      style={{ color: sortKey === k ? "#06b6d4" : "var(--text-4)" }}
      onClick={() => setSort(k)}
    >
      {label} {sortKey === k ? (sortDir === 1 ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Toolbar */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 border-b flex flex-wrap gap-3 items-center justify-between"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div
            className="flex-1 max-w-sm flex items-center gap-2 rounded-lg px-3 py-2 border"
            style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--text-4)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vessel, MMSI, IMO, type…"
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: "var(--text-1)" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} style={{ color: "var(--text-4)" }} />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-xs border outline-none font-medium"
              style={{ background: "var(--bg-base)", borderColor: "var(--border)", color: "var(--text-2)" }}
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onNavigate("optimizer")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
          style={{ background: "linear-gradient(135deg,#7c3aed,#10b981)", color: "white" }}
        >
          <Zap size={13} /> Optimize Fleet Voyage
        </button>
      </div>

      {/* Summary cards */}
      <div className="shrink-0 px-4 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { label: "Connected Vessels", value: fleet.length, color: "#10b981" },
          { label: "At Risk / Alert", value: fleet.filter((v) => v.status === "at-risk").length, color: "#ef4444" },
          { label: "Quantum Optimized", value: fleet.filter((v) => v.status === "optimized").length, color: "#a78bfa" },
          {
            label: "Avg Fuel Burn",
            value: fleet.length ? (fleet.reduce((s, v) => s + (v.fuel_rate_mt_day || 35), 0) / fleet.length).toFixed(1) + " MT/d" : "38.5 MT/d",
            color: "#06b6d4",
          },
        ].map((k) => (
          <div key={k.label} className="rounded-lg p-2.5 border text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
              {k.label}
            </p>
            <p className="font-mono-data font-bold text-lg" style={{ color: k.color }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs" style={{ minWidth: 780 }}>
          <thead className="sticky top-0 z-10" style={{ background: "var(--bg-surface)" }}>
            <tr style={{ borderBottom: `1px solid var(--border)` }}>
              <SortTh label="Vessel Name" k="name" />
              <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
                Type / IMO
              </th>
              <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
                Active Route
              </th>
              <SortTh label="Speed (kn)" k="speed" />
              <SortTh label="Fuel Rate" k="fuel_rate_mt_day" />
              <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
                Target ETA
              </th>
              <SortTh label="CII Rating" k="attained_cii" />
              <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
                Status
              </th>
              <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.mmsi || v.id} className="border-b transition-colors hover:bg-slate-800/30" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 font-bold" style={{ color: "var(--text-1)" }}>
                  <div className="flex items-center gap-2">
                    <Ship size={14} style={{ color: "#06b6d4" }} />
                    {v.name}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-3)" }}>
                  {v.type} <span className="font-mono-data text-[10px]">({v.imo || v.mmsi})</span>
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text-2)" }}>
                  {v.route_name || "Singapore → Rotterdam"}
                </td>
                <td className="px-4 py-3 font-mono-data font-bold" style={{ color: "#06b6d4" }}>
                  {v.speed} kn
                </td>
                <td className="px-4 py-3 font-mono-data" style={{ color: "#10b981" }}>
                  {v.fuel_rate_mt_day || 38.2} MT/d
                </td>
                <td className="px-4 py-3 font-mono-data" style={{ color: "var(--text-3)" }}>
                  {v.eta || "Sep 14, 09:30 UTC"}
                </td>
                <td className="px-4 py-3">
                  <CIIBadge grade={v.cii || v.cii_grade || "A"} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onNavigate("optimizer")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all hover:bg-emerald-500/10"
                    style={{ borderColor: "var(--border)", color: "#10b981" }}
                  >
                    Optimize <ArrowUpRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
