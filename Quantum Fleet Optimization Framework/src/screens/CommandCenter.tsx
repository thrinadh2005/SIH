import { useState, useEffect, lazy, Suspense } from "react";
import { Layers, ChevronDown, Activity, Ship, RefreshCw } from "lucide-react";
import { fetchFleetList, fetchLiveWeather, WeatherPoint, VesselPosition } from "../services/api";
import { wsClient } from "../services/websocket";
import StatusBadge, { CIIBadge } from "../components/ui/StatusBadge";

const MaritimeMap = lazy(() => import("../components/map/MaritimeMap"));

interface Props {
  onNavigate: (id: string) => void;
}

export default function CommandCenter({ onNavigate }: Props) {
  const [fleet, setFleet] = useState<any[]>([]);
  const [layers, setLayers] = useState({ ais: true, routes: true, weather: false, cii: true, ports: true });
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<WeatherPoint[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [wsLatency, setWsLatency] = useState(18);
  const [lastSync, setLastSync] = useState(Date.now());

  useEffect(() => {
    fetchFleetList().then((res) => {
      setFleet(res);
      if (res.length > 0) setSelectedVessel(res[0]);
    });

    wsClient.connect();
    const offVessel = wsClient.on<any>("VESSEL_UPDATE", (v) => {
      setFleet((prev) => {
        const idx = prev.findIndex((p) => p.mmsi === v.mmsi || p.id === v.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...v };
          return updated;
        }
        return prev;
      });
      setLastSync(Date.now());
    });

    return () => {
      (offVessel as () => void)();
    };
  }, []);

  useEffect(() => {
    if (!layers.weather || fleet.length === 0) return;
    setLoadingWeather(true);
    Promise.all(fleet.map((v) => fetchLiveWeather(v.lat || 12.6, v.lng || 43.4).catch(() => null)))
      .then((res) => {
        setWeatherData(res.filter(Boolean) as WeatherPoint[]);
        setLoadingWeather(false);
      })
      .catch(() => setLoadingWeather(false));
  }, [layers.weather, fleet]);

  const timeSince = Math.round((Date.now() - lastSync) / 1000);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Top Map Control Bar */}
      <div
        className="shrink-0 flex flex-wrap items-center gap-2 px-4 sm:px-5 py-2.5 border-b"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-live-pulse" style={{ background: "#10b981" }} />
          WS LIVE · {wsLatency}ms · {timeSince}s ago
        </div>

        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--bg-card)" }}
          >
            <Layers size={12} /> <span className="hidden sm:inline">Map Layers</span> <ChevronDown size={10} />
          </button>
          {layersOpen && (
            <div
              className="absolute top-full left-0 mt-1 w-52 rounded-xl border shadow-xl z-50 p-2 animate-fade-in-fast"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              {Object.entries(layers).map(([k, v]) => (
                <label key={k} className="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-800/30">
                  <span className="text-xs font-medium capitalize" style={{ color: "var(--text-2)" }}>
                    {k} Layer
                  </span>
                  <div
                    className="relative w-8 h-4 rounded-full cursor-pointer"
                    style={{ background: v ? "#10b981" : "var(--border)" }}
                    onClick={() => setLayers((l) => ({ ...l, [k]: !v }))}
                  >
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all" style={{ left: v ? 16 : 2 }} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 flex-1 justify-end">
          <button
            onClick={() => onNavigate("optimizer")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <Activity size={11} /> <span className="hidden sm:inline">Quantum Optimizer</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="flex-1 relative flex">
        <div className="flex-1 relative">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center text-xs" style={{ color: "var(--text-3)" }}>
                Loading live maritime map…
              </div>
            }
          >
            <MaritimeMap
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
                const found = fleet.find((f) => f.id === v.id || f.name === v.name);
                if (found) setSelectedVessel(found);
              }}
              layers={layers}
              weatherPoints={weatherData}
            />
          </Suspense>
        </div>

        {/* Selected Vessel Telemetry Side Card */}
        {selectedVessel && (
          <div
            className="hidden md:flex w-80 border-l flex-col p-4 space-y-4 overflow-y-auto"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Ship size={18} className="text-emerald-400" />
              <div>
                <p className="font-bold text-sm text-white">{selectedVessel.name}</p>
                <p className="text-xs text-slate-400">{selectedVessel.type}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border space-y-2 text-xs" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Speed:</span>
                <span className="font-mono-data font-bold text-sky-400">{selectedVessel.speed} kn</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heading:</span>
                <span className="font-mono-data text-white">{selectedVessel.heading}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Fuel Rate:</span>
                <span className="font-mono-data font-bold text-emerald-400">{selectedVessel.fuel_rate_mt_day || 38.2} MT/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IMO Rating:</span>
                <CIIBadge grade={selectedVessel.cii || selectedVessel.cii_grade || "A"} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <StatusBadge status={selectedVessel.status || "optimized"} />
              </div>
            </div>

            <button
              onClick={() => onNavigate("optimizer")}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-emerald-500 rounded-lg text-xs font-bold text-white shadow-md"
            >
              Optimize Voyage Speed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
