import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Ship,
  Zap,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react"
import StatusBadge, { CIIBadge } from "../components/ui/StatusBadge"
import { fetchFleetList } from "../services/api"
import { wsClient } from "../services/websocket"

interface Props {
  onNavigate: (id: string) => void
}

const allStatuses = [
  "all",
  "optimized",
  "normal",
  "at-risk",
  "optimization-running",
]

export default function FleetManagement({ onNavigate }: Props) {
  const [fleet, setFleet] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [sortKey, setSortKey] =
    useState<"name" | "speed" | "fuel_rate_mt_day" | "attained_cii">("name")
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  useEffect(() => {
    fetchFleetList().then(setFleet)

    wsClient.connect()
    const offVessel = wsClient.on<any>("VESSEL_UPDATE", (v) => {
      setFleet((prev) => {
        const idx = prev.findIndex(
          (item) => item.mmsi === v.mmsi || item.id === v.id,
        )
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], ...v }
          return updated
        }
        return prev
      })
    })

    return () => {
      offVessel()
    }
  }, [])

  const setSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1))
    else {
      setSortKey(key)
      setSortDir(1)
    }
  }

  const filtered = fleet
    .filter((v) => {
      const q = query.toLowerCase()
      const matchQ =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.imo?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.mmsi?.includes(q)
      const matchS = status === "all" || v.status === status
      return matchQ && matchS
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? a.name
      const bv = b[sortKey] ?? b.name
      if (av < bv) return -sortDir
      if (av > bv) return sortDir
      return 0
    })

  const SortTh = ({ label, k }: { label: string k: typeof sortKey }) => (
    <th className="cursor-pointer select-none" onClick={() => setSort(k)}>
      {label} {sortKey === k ? (sortDir === 1 ? "↑" : "↓") : ""}
    </th>
  )

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
                Fleet Registry & Live Status
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                {fleet.length} Connected
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Real-time AIS positioning, hydrodynamics, engine load, and IMO CII
              compliance grades
            </p>
          </div>

          <button
            onClick={() => onNavigate("optimizer")}
            className="btn-primary-action flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
          >
            <Zap size={14} /> Optimize Fleet Voyage
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="panel-solid p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <div
              className="flex-1 max-w-md flex items-center gap-2 rounded-lg px-3 py-2 border"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border)",
              }}
            >
              <Search size={14} style={{ color: "var(--text-4)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vessel by name, MMSI, IMO number or type…"
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "var(--text-1)" }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: "var(--text-4)" }} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-marine text-xs"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Operational Statuses" : s.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tactical Fleet Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="panel-solid p-4 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-3)" }}
            >
              Connected Vessels
            </p>
            <p className="font-display font-bold text-2xl mt-1 font-mono-data text-emerald-500">
              {fleet.length}
            </p>
          </div>
          <div className="panel-solid p-4 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-3)" }}
            >
              At-Risk / Warning
            </p>
            <p className="font-display font-bold text-2xl mt-1 font-mono-data text-rose-500">
              {fleet.filter((v) => v.status === "at-risk").length}
            </p>
          </div>
          <div className="panel-solid p-4 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-3)" }}
            >
              Quantum Optimized
            </p>
            <p className="font-display font-bold text-2xl mt-1 font-mono-data text-purple-500">
              {fleet.filter((v) => v.status === "optimized").length}
            </p>
          </div>
          <div className="panel-solid p-4 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-3)" }}
            >
              Avg Daily Burn
            </p>
            <p className="font-display font-bold text-2xl mt-1 font-mono-data text-sky-500">
              {fleet.length
                ? (
                    fleet.reduce((s, v) => s + (v.fuel_rate_mt_day || 35), 0) /
                    fleet.length
                  ).toFixed(1) + " MT/d"
                : "38.5 MT/d"}
            </p>
          </div>
        </div>

        {/* Fleet Register Table */}
        <div className="panel-solid overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-marine">
              <thead>
                <tr>
                  <SortTh label="Vessel Name" k="name" />
                  <th>Type & Deadweight</th>
                  <th>Corridor & ETA</th>
                  <SortTh label="Speed (SOG)" k="speed" />
                  <SortTh label="Fuel Burn" k="fuel_rate_mt_day" />
                  <th>Engine Load</th>
                  <SortTh label="CII Grade" k="attained_cii" />
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.mmsi || v.id}>
                    <td
                      className="font-bold"
                      style={{ color: "var(--text-1)" }}
                    >
                      <div>{v.name}</div>
                      <div
                        className="text-[11px] font-mono"
                        style={{ color: "var(--text-4)" }}
                      >
                        IMO {v.imo || "9812401"}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-3)" }}>
                      <div>{v.type}</div>
                      <div className="text-[11px] font-mono-data">
                        {v.dwt
                          ? `${v.dwt.toLocaleString()} DWT`
                          : "145,000 DWT"}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-2)" }}>
                      <div>{v.route_name || "Singapore → Rotterdam"}</div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--text-4)" }}
                      >
                        Progress: {v.progress || 45}% · ETA: {v.eta || "3d 12h"}
                      </div>
                    </td>
                    <td className="font-mono-data font-bold text-sky-500">
                      {v.speed} kn
                    </td>
                    <td className="font-mono-data font-bold text-emerald-500">
                      {v.fuel_rate_mt_day || 38.2} MT/d
                    </td>
                    <td
                      className="font-mono-data"
                      style={{ color: "var(--text-2)" }}
                    >
                      {v.engine_load_pct || 68.5}% MCR
                    </td>
                    <td>
                      <CIIBadge grade={v.cii || v.cii_grade || "A"} />
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>
                      <button
                        onClick={() => onNavigate("optimizer")}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      >
                        Optimize →
                      </button>
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
