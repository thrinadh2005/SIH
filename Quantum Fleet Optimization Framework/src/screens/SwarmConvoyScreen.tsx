import { useState, useEffect } from "react"
import {
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Zap,
  Radio,
  Anchor,
  ShieldCheck,
} from "lucide-react"
import { optimizeConvoySwarm, SwarmOptimizeResponse } from "../services/api"

interface Props {
  onNavigate: (id: string) => void
}

export default function SwarmConvoyScreen({ onNavigate }: Props) {
  const [terminalId, setTerminalId] = useState("NLRTM")
  const [swarmData, setSwarmData] = useState<SwarmOptimizeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [negotiating, setNegotiating] = useState(false)

  const fetchSwarm = () => {
    setLoading(true)
    optimizeConvoySwarm(terminalId)
      .then(setSwarmData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSwarm()
  }, [terminalId])

  const handleTriggerSwarmSync = () => {
    setNegotiating(true)
    setTimeout(() => {
      fetchSwarm()
      setNegotiating(false)
    }, 600)
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Screen Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="font-display font-bold text-2xl sm:text-3xl tracking-tight"
                style={{ color: "var(--text-1)" }}
              >
                Convoy Swarm Optimization
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                JIT Virtual Arrival
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Multi-agent speed negotiation for terminal approaches · Eliminates
              anchorage idling & demurrage penalties
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              className="input-marine text-xs"
            >
              <option value="NLRTM">
                Port of Rotterdam (Maasvlakte 2 Terminal)
              </option>
              <option value="SGSIN">Port of Singapore (Tuas Mega Port)</option>
              <option value="BEANR">
                Port of Antwerp-Bruges (Deurganckdock)
              </option>
              <option value="CNSHA">
                Port of Shanghai (Yangshan Deep-Water Port)
              </option>
              <option value="USLAX">
                Port of Los Angeles (Pier 400 APM Terminal)
              </option>
              <option value="USNYC">
                Port of New York & NJ (Maher Container Terminal)
              </option>
              <option value="INNSA">
                Jawaharlal Nehru Port (JNPT Mumbai Gateway)
              </option>
            </select>

            <button
              onClick={handleTriggerSwarmSync}
              disabled={negotiating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all"
              style={{ background: "#7c3aed" }}
            >
              <RefreshCw
                size={13}
                className={negotiating ? "animate-spin" : ""}
              />
              {negotiating ? "Negotiating Speeds…" : "Re-sync Convoy Speeds"}
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        {swarmData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Demurrage Saved
                </p>
                <p className="font-mono-data font-bold text-2xl text-emerald-500 mt-1">
                  $
                  {swarmData.summary_metrics.total_demurrage_penalties_avoided_usd.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                  Zero charter penalty
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Idling Eliminated
                </p>
                <p className="font-mono-data font-bold text-2xl text-sky-500 mt-1">
                  {
                    swarmData.summary_metrics
                      .total_anchorage_idling_eliminated_hours
                  }
                  h
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-4)" }}
                >
                  Avoided at anchorage
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-500">
                <Clock size={22} />
              </div>
            </div>

            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Bunker Fuel Saved
                </p>
                <p className="font-mono-data font-bold text-2xl text-purple-500 mt-1">
                  {swarmData.summary_metrics.total_fuel_saved_mt} MT
                </p>
                <p className="text-xs font-semibold mt-0.5 text-purple-400">
                  Slow steaming cut
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-500">
                <Zap size={22} />
              </div>
            </div>

            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Swarm Efficiency
                </p>
                <p className="font-mono-data font-bold text-2xl text-amber-500 mt-1">
                  {swarmData.summary_metrics.fleet_coordination_efficiency_pct}%
                </p>
                <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                  JIT Consensus
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>
        )}

        {/* Convoy Schedule Table */}
        {swarmData && (
          <div className="panel-solid overflow-hidden">
            <div
              className="px-5 py-3.5 border-b"
              style={{ borderColor: "var(--border-sub)" }}
            >
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-1)" }}
              >
                {swarmData.terminal_name} — Coordinated Vessel Arrival Schedule
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                Virtual Arrival speeds negotiated dynamically to match assigned
                terminal quay crane windows
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="table-marine">
                <thead>
                  <tr>
                    <th>Berth Slot</th>
                    <th>Vessel Name</th>
                    <th>Vessel Type</th>
                    <th>Distance to Port</th>
                    <th>Original Speed</th>
                    <th>JIT Swarm Speed</th>
                    <th>Speed Delta</th>
                    <th>Demurrage Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {swarmData.scheduled_vessels.map((v) => (
                    <tr key={v.vessel_id}>
                      <td className="font-mono-data font-bold text-purple-400">
                        {v.target_berth_slot}
                      </td>
                      <td
                        className="font-bold"
                        style={{ color: "var(--text-1)" }}
                      >
                        {v.name}
                      </td>
                      <td
                        className="font-mono-data text-xs"
                        style={{ color: "var(--text-3)" }}
                      >
                        {v.type}
                      </td>
                      <td
                        className="font-mono-data"
                        style={{ color: "var(--text-2)" }}
                      >
                        {v.distance_nm} NM
                      </td>
                      <td
                        className="font-mono-data line-through"
                        style={{ color: "var(--text-4)" }}
                      >
                        {v.original_speed_knots} kn
                      </td>
                      <td className="font-mono-data font-bold text-emerald-500">
                        {v.negotiated_jit_speed_knots} kn
                      </td>
                      <td className="font-mono-data text-emerald-500 font-bold">
                        -{v.speed_reduction_pct}%
                      </td>
                      <td className="font-mono-data font-bold text-sky-500">
                        +${v.demurrage_saved_usd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
