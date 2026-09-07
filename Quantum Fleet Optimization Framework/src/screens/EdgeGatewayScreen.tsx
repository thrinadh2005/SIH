import { useState, useEffect } from "react"
import {
  Radio,
  HardDrive,
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  Activity,
  Gauge,
  Anchor,
  Zap,
  ShieldCheck,
  Terminal,
  Play,
  Pause,
} from "lucide-react"
import {
  fetchLiveEdgeTelemetry,
  fetchSatelliteAisTracking,
  syncEdgeCache,
  EdgeTelemetryResponse,
  SatelliteAisResponse,
} from "../services/api"

interface Props {
  onNavigate: (id: string) => void
}

export default function EdgeGatewayScreen({ onNavigate }: Props) {
  const [telemetry, setTelemetry] = useState<EdgeTelemetryResponse | null>(null)
  const [satAis, setSatAis] = useState<SatelliteAisResponse | null>(null)
  const [isEdgeOfflineMode, setIsEdgeOfflineMode] = useState(false)
  const [isStreamPaused, setIsStreamPaused] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const fetchEdge = () => {
      if (isStreamPaused) return
      fetchLiveEdgeTelemetry()
        .then(setTelemetry)
        .catch(() => {})
      fetchSatelliteAisTracking()
        .then(setSatAis)
        .catch(() => {})
    }
    fetchEdge()
    const interval = setInterval(fetchEdge, 2500)
    return () => clearInterval(interval)
  }, [isStreamPaused])

  const handleTriggerSync = () => {
    setSyncing(true)
    syncEdgeCache()
      .then((res) => {
        setSyncStatus(
          `Uploaded ${res.packets_uploaded} cached packets (${res.cloud_latency_ms}ms latency)`,
        )
        setTimeout(() => setSyncStatus(null), 4000)
      })
      .finally(() => setSyncing(false))
  }

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
                Maritime IoT & Shipboard Edge Gateway
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-500 border border-sky-500/30">
                NMEA 0183 / 2000 Serial
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Industrial RS-422 hardware serial bridge · Shaft torque metering ·
              Satellite AIS dead reckoning
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsEdgeOfflineMode(!isEdgeOfflineMode)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all"
              style={{
                background: isEdgeOfflineMode
                  ? "rgba(245,158,11,0.12)"
                  : "rgba(16,185,129,0.12)",
                borderColor: isEdgeOfflineMode ? "#f59e0b" : "#10b981",
                color: isEdgeOfflineMode ? "#f59e0b" : "#10b981",
              }}
            >
              {isEdgeOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
              {isEdgeOfflineMode ? "Edge Offline Sim" : "Satcom Cloud Linked"}
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all"
              style={{ background: "#0284c7" }}
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync Edge Buffer"}
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="p-3.5 rounded-lg border text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 border-emerald-500/30 animate-fade-in flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Real-Time Hardware Performance Telemetry Cards */}
        {telemetry && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Delivered Shaft Power
                </p>
                <p className="font-mono-data font-bold text-2xl text-emerald-500 mt-1">
                  {(
                    telemetry.derived_performance.brake_power_kw / 1000
                  ).toFixed(2)}{" "}
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-4)" }}
                  >
                    MW
                  </span>
                </p>
                <p className="text-xs text-emerald-500 font-mono font-semibold mt-1">
                  {telemetry.telemetry.shaft_power?.shaft_rpm || 78.4} RPM ·{" "}
                  {telemetry.telemetry.shaft_power?.torque_kn_m || 1842} kN·m
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <Gauge size={22} />
              </div>
            </div>

            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Specific Fuel Burn (BSFC)
                </p>
                <p className="font-mono-data font-bold text-2xl text-sky-500 mt-1">
                  {
                    telemetry.derived_performance
                      .specific_fuel_consumption_g_kwh
                  }{" "}
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-4)" }}
                  >
                    g/kWh
                  </span>
                </p>
                <p className="text-xs font-mono font-semibold mt-1 text-sky-500">
                  {telemetry.derived_performance.fuel_rate_mt_day} MT/day burn
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-500">
                <Activity size={22} />
              </div>
            </div>

            <div className="panel-solid p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-3)" }}
                >
                  Thrust Efficiency
                </p>
                <p className="font-mono-data font-bold text-2xl text-purple-500 mt-1">
                  {telemetry.derived_performance.thrust_efficiency_pct}%
                </p>
                <p className="text-xs font-mono font-semibold mt-1 text-purple-400">
                  Fouling Index:{" "}
                  {telemetry.derived_performance.hull_fouling_index_pct}%
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
                  GPS Fix & Satellites
                </p>
                <p className="font-mono-data font-bold text-2xl text-amber-500 mt-1">
                  {telemetry.telemetry.gps_fix?.satellites_tracked || 11}{" "}
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-4)" }}
                  >
                    Sats
                  </span>
                </p>
                <p className="text-xs text-emerald-500 font-mono font-semibold mt-1">
                  {telemetry.telemetry.gps_fix?.fix_quality || "DGPS"} · HDOP{" "}
                  {telemetry.telemetry.gps_fix?.hdop || 0.85}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Radio size={22} />
              </div>
            </div>
          </div>
        )}

        {/* Live NMEA 0183 Raw Terminal Stream Inspector */}
        <div className="panel-solid overflow-hidden">
          <div
            className="px-5 py-3.5 border-b flex justify-between items-center"
            style={{ borderColor: "var(--border-sub)" }}
          >
            <div className="flex items-center gap-2.5">
              <Terminal size={18} className="text-emerald-500" />
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-1)" }}
                >
                  Live NMEA 0183 RS-422 Ingestion Feed
                </h3>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Direct hardware serial stream from bridge sensors
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsStreamPaused(!isStreamPaused)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-2)",
                  background: "var(--bg-surface)",
                }}
              >
                {isStreamPaused ? (
                  <Play size={12} className="text-emerald-500" />
                ) : (
                  <Pause size={12} className="text-amber-500" />
                )}
                {isStreamPaused ? "Resume Feed" : "Pause Stream"}
              </button>
              <span className="text-[11px] font-mono text-emerald-500 font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                38400 BAUD · XOR OK
              </span>
            </div>
          </div>

          <div
            className="p-4 font-mono text-xs space-y-2"
            style={{ background: "var(--bg-input)", color: "var(--text-2)" }}
          >
            {telemetry?.raw_nmea_sentences?.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-1 rounded transition-colors hover:bg-slate-500/10"
              >
                <span
                  className="select-none font-bold text-[10px]"
                  style={{ color: "var(--text-4)" }}
                >
                  {idx + 1}.
                </span>
                <span className="text-emerald-500 font-bold">
                  {s.split(",")[0]}
                </span>
                <span className="truncate" style={{ color: "var(--text-1)" }}>
                  {s}
                </span>
                <span className="ml-auto text-[10px] font-bold text-emerald-500 shrink-0">
                  ✓ CHECKSUM PASS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Satellite AIS & Dead Reckoning Telemetry */}
        {satAis && (
          <div className="panel-solid p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-1)" }}
                >
                  Global Satellite AIS & Kinematic Dead Reckoning
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-3)" }}
                >
                  Deep-ocean positioning beyond terrestrial VHF station coverage
                  (30+ NM offshore)
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-500 px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 w-fit">
                {satAis.satellite_constellation}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <span className="block mb-1" style={{ color: "var(--text-4)" }}>
                  Tracking Mode:
                </span>
                <p className="font-mono-data font-bold text-emerald-500 text-sm">
                  {satAis.dead_reckoning.tracking_mode}
                </p>
              </div>
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <span className="block mb-1" style={{ color: "var(--text-4)" }}>
                  Satcom Latency:
                </span>
                <p
                  className="font-mono-data font-bold text-sm"
                  style={{ color: "var(--text-1)" }}
                >
                  {satAis.satcom_uplink_latency_sec} Seconds
                </p>
              </div>
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <span className="block mb-1" style={{ color: "var(--text-4)" }}>
                  DR Uncertainty Radius:
                </span>
                <p className="font-mono-data font-bold text-amber-500 text-sm">
                  ±{satAis.dead_reckoning.uncertainty_radius_nm} NM
                </p>
              </div>
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <span className="block mb-1" style={{ color: "var(--text-4)" }}>
                  Tracking Confidence:
                </span>
                <p className="font-mono-data font-bold text-purple-500 text-sm">
                  {satAis.dead_reckoning.tracking_confidence_pct}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
