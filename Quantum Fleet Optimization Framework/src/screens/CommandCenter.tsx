import { useState, useEffect, lazy, Suspense } from "react"
import {
  Layers,
  ChevronDown,
  Ship,
  Zap,
} from "lucide-react"
import {
  fetchFleetList,
  fetchLiveWeather,
  WeatherPoint,
} from "../services/api"
import { wsClient } from "../services/websocket"
import StatusBadge, { CIIBadge } from "../components/ui/StatusBadge"

const MaritimeMap = lazy(() => import("../components/map/MaritimeMap"))

interface Props {
  onNavigate: (id: string) => void
}

export default function CommandCenter({ onNavigate }: Props) {
  const [fleet, setFleet] = useState<any[]>([])
  const [layers, setLayers] = useState({
    ais: true,
    routes: true,
    weather: false,
    cii: true,
    ports: true,
  })
  const [layersOpen, setLayersOpen] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<any>(null)
  const [weatherData, setWeatherData] = useState<WeatherPoint[]>([])
  const [wsLatency, setWsLatency] = useState(18)
  const [lastSync, setLastSync] = useState(Date.now())

  useEffect(() => {
    fetchFleetList().then((res) => {
      setFleet(res)
      if (res.length > 0) setSelectedVessel(res[0])
    })

    wsClient.connect()
    const offVessel = wsClient.on<any>("VESSEL_UPDATE", (v) => {
      setFleet((prev) => {
        const idx = prev.findIndex((p) => p.mmsi === v.mmsi || p.id === v.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], ...v }
          return updated
        }
        return prev
      })
      setLastSync(Date.now())
    })

    return () => {
      offVessel()
    }
  }, [])

  useEffect(() => {
    if (!layers.weather || fleet.length === 0) return
    Promise.all(
      fleet.map((v) =>
        fetchLiveWeather(v.lat || 12.6, v.lng || 43.4).catch(() => null),
      ),
    )
      .then((res) => {
        setWeatherData(res.filter(Boolean) as WeatherPoint[])
      })
      .catch(() => {})
  }, [layers.weather, fleet])

  const timeSince = Math.round((Date.now() - lastSync) / 1000)

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Top Map Control Bar */}
      <div
        className="shrink-0 flex flex-wrap items-center gap-3 px-4 sm:px-6 py-2.5 border-b transition-colors"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/35 shadow-xs"
        >
          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-live-pulse"
          />
          LIVE AIS STREAM · {wsLatency}ms · {timeSince}s ago
        </div>

        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all hover:border-sky-500 active:scale-95 shadow-2xs"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-2)",
              background: "var(--bg-card)",
            }}
          >
            <Layers size={15} className="text-sky-500" /> <span>GIS Layers</span>{" "}
            <ChevronDown size={13} />
          </button>
          {layersOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-56 rounded-xl border shadow-2xl z-50 p-2.5 panel-solid animate-fade-in"
            >
              {Object.entries(layers).map(([k, v]) => (
                <label
                  key={k}
                  className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <span
                    className="text-xs sm:text-sm font-semibold capitalize"
                    style={{ color: "var(--text-2)" }}
                  >
                    {k} Layer
                  </span>
                  <input
                    type="checkbox"
                    checked={v}
                    onChange={() => setLayers((l) => ({ ...l, [k]: !v }))}
                    className="accent-blue-600 rounded cursor-pointer w-4 h-4"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-1 justify-end">
          <button
            onClick={() => onNavigate("optimizer")}
            className="btn-primary-action flex items-center gap-2 px-4 py-2 text-xs sm:text-sm"
          >
            <Zap size={15} /> Optimize Corridor Route
          </button>
        </div>
      </div>

      {/* Main Map Viewport + Vessel Inspector */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative">
          <Suspense
            fallback={
              <div
                className="h-full flex items-center justify-center text-sm font-medium"
                style={{ color: "var(--text-3)" }}
              >
                Loading maritime GIS map…
              </div>
            }
          >
            <MaritimeMap
              initialVessels={fleet.map((v) => ({
                id: v.id,
                name: v.name,
                lat: v.lat || 12.6,
                lng: v.lng || 43.4,
                speed: v.speed || 15.0,
                heading: v.heading || 280,
                status: v.status || "optimized",
                type: v.type || "Commercial",
              }))}
              vessels={fleet.map((v) => ({
                id: v.id,
                name: v.name,
                lat: v.lat || 12.6,
                lng: v.lng || 43.4,
                speed: v.speed || 15.0,
                heading: v.heading || 280,
                status: v.status || "optimized",
                type: v.type || "Commercial",
              }))}
              selectedVessel={selectedVessel}
              onSelectVessel={(v) => {
                const found = fleet.find(
                  (f) => f.id === v.id || f.name === v.name,
                )
                if (found) setSelectedVessel(found)
              }}
              layers={layers}
              weatherPoints={weatherData}
            />
          </Suspense>
        </div>

        {/* Selected Vessel Telemetry Side Drawer */}
        {selectedVessel && (
          <div
            className="hidden md:flex w-88 border-l flex-col p-5 space-y-5 overflow-y-auto shrink-0 shadow-2xl transition-all duration-300"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: "var(--border-sub)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-sky-400 shadow-xs">
                  <Ship size={20} />
                </div>
                <div>
                  <p
                    className="font-bold text-sm sm:text-base"
                    style={{ color: "var(--text-1)" }}
                  >
                    {selectedVessel.name}
                  </p>
                  <p
                    className="text-xs font-mono text-sky-500 dark:text-sky-400"
                  >
                    IMO {selectedVessel.imo || "9834211"}
                  </p>
                </div>
              </div>
              <CIIBadge
                grade={selectedVessel.cii || selectedVessel.cii_grade || "A"}
              />
            </div>

            <div className="panel-solid p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-3)" }}>
                  Speed Over Ground (SOG)
                </span>
                <span className="font-mono-data font-bold text-sky-600 dark:text-sky-400 text-sm sm:text-base">
                  {selectedVessel.speed} kn
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-3)" }}>True Heading</span>
                <span
                  className="font-mono-data font-semibold"
                  style={{ color: "var(--text-1)" }}
                >
                  {selectedVessel.heading}° True
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-3)" }}>Fuel Burn Rate</span>
                <span className="font-mono-data font-bold text-blue-600 dark:text-sky-300 text-sm">
                  {selectedVessel.fuel_rate_mt_day || 38.2} MT/d
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-3)" }}>
                  Shaft Power Output
                </span>
                <span
                  className="font-mono-data font-semibold"
                  style={{ color: "var(--text-2)" }}
                >
                  {selectedVessel.power_kw
                    ? `${selectedVessel.power_kw} kW`
                    : "18,200 kW"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-3)" }}>Engine MCR Load</span>
                <span
                  className="font-mono-data font-semibold"
                  style={{ color: "var(--text-2)" }}
                >
                  {selectedVessel.engine_load_pct || 68.5}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-3)" }}>
                  Navigation Status
                </span>
                <StatusBadge status={selectedVessel.status || "optimized"} />
              </div>
            </div>

            <div className="panel-solid p-4 text-xs sm:text-sm space-y-2">
              <span
                className="font-bold uppercase tracking-wider text-[11px] block text-sky-500 dark:text-sky-400"
              >
                Active Voyage Corridor
              </span>
              <p
                className="font-bold text-sm"
                style={{ color: "var(--text-1)" }}
              >
                {selectedVessel.route_name || "Singapore → Rotterdam"}
              </p>
              <div
                className="flex justify-between text-xs pt-1.5 font-medium"
                style={{ color: "var(--text-3)" }}
              >
                <span>Progress: {selectedVessel.progress || 48}%</span>
                <span>ETA: {selectedVessel.eta || "3d 14h"}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("optimizer")}
              className="btn-primary-action w-full py-3 text-sm mt-auto"
            >
              Configure Voyage Optimization
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
