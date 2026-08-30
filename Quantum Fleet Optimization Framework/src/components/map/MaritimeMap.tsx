import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VesselPosition, WeatherPoint } from "../../services/api";
import { wsClient } from "../../services/websocket";

// Fix default icon paths broken by Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const VESSEL_COLORS: Record<string, string> = {
  optimized:            "#10b981",
  normal:               "#06b6d4",
  "at-risk":            "#ef4444",
  "optimization-running": "#a78bfa",
  offline:              "#64748b",
};

const STATUS_LABEL: Record<string, string> = {
  optimized:            "OPTIMISED",
  normal:               "NORMAL",
  "at-risk":            "AT RISK",
  "optimization-running": "OPTIMISING",
  offline:              "OFFLINE",
};

const ROUTE_COLORS = ["#10b981","#ef4444","#06b6d4","#a78bfa","#f59e0b"];

// Build custom SVG vessel icon
function buildVesselIcon(color: string, heading: number, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <g transform="rotate(${heading}, 16, 16)">
      <polygon points="16,2 22,26 16,22 10,26" fill="${color}" stroke="white" stroke-width="1.5" opacity="0.95"/>
      <circle cx="16" cy="16" r="3" fill="white" opacity="0.7"/>
    </g>
  </svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Sonar ping animation marker
function buildPingIcon(color: string) {
  const html = `<div style="position:relative;width:40px;height:40px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.15;animation:vessel-ping 2s ease-out infinite;"></div>
    <div style="position:absolute;inset:6px;border-radius:50%;background:${color};opacity:0.3;animation:vessel-ping 2s ease-out 0.5s infinite;"></div>
  </div>`;
  return L.divIcon({ className: "", html, iconSize: [40, 40], iconAnchor: [20, 20] });
}

interface Props {
  initialVessels: VesselPosition[];
  weatherPoints?: WeatherPoint[];
  showRoutes?: boolean;
  showWeather?: boolean;
  showGrid?: boolean;
  theme?: "dark" | "light";
  height?: number | string;
  onVesselClick?: (v: VesselPosition) => void;
}

export default function MaritimeMap({
  initialVessels,
  weatherPoints = [],
  showRoutes = true,
  showWeather = false,
  theme = "dark",
  height = "100%",
  onVesselClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const pingMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);
  const weatherLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [vessels, setVessels] = useState<VesselPosition[]>(initialVessels);
  const [latency, setLatency] = useState(22);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileUrl = theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    const map = L.map(containerRef.current, {
      center: [20, 30],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(tileUrl, {
      attribution: "&copy; OpenStreetMap &copy; CartoDB",
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: "" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [theme]);

  // Draw routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showRoutes) return;
    polylinesRef.current.forEach((p) => map.removeLayer(p));
    polylinesRef.current = [];

    const ROUTES: Array<[number, number][]> = [
      [[26.6, 50.1],[20, 60],[15, 55],[10, 50],[5, 8],[51.9, 4.1]],
      [[31.2, 121.4],[28, 160],[20, -170],[33.7, -118.2]],
      [[60.5, -1.2],[52, 3],[48, 4.9]],
      [[-20.3, 118.6],[-10, 132],[36.1, 120.3]],
      [[29.7, -95.0],[10, -50],[30, -30],[49.5, 0.1]],
    ];

    ROUTES.forEach((coords, i) => {
      const pl = L.polyline(coords as L.LatLngExpression[], {
        color: ROUTE_COLORS[i],
        weight: 1.5,
        opacity: 0.45,
        dashArray: "6 4",
      }).addTo(map);
      polylinesRef.current.push(pl);
    });
  }, [showRoutes]);

  // Place/update vessel markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    vessels.forEach((v) => {
      const color = VESSEL_COLORS[v.status] ?? "#64748b";

      // Ping ring (background)
      if (!pingMarkersRef.current.has(v.mmsi)) {
        const ping = L.marker([v.lat, v.lng], { icon: buildPingIcon(color), zIndexOffset: 0 }).addTo(map);
        pingMarkersRef.current.set(v.mmsi, ping);
      } else {
        pingMarkersRef.current.get(v.mmsi)!.setLatLng([v.lat, v.lng]);
      }

      // Vessel arrow
      if (!markersRef.current.has(v.mmsi)) {
        const m = L.marker([v.lat, v.lng], { icon: buildVesselIcon(color, v.heading), zIndexOffset: 100 })
          .addTo(map)
          .bindPopup(buildPopup(v), { className: "maritime-popup", maxWidth: 280 });
        m.on("click", () => { setSelectedVessel(v); onVesselClick?.(v); });
        markersRef.current.set(v.mmsi, m);
      } else {
        const m = markersRef.current.get(v.mmsi)!;
        m.setLatLng([v.lat, v.lng]);
        m.setIcon(buildVesselIcon(color, v.heading));
      }
    });
  }, [vessels, onVesselClick]);

  // Weather circles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (weatherLayerRef.current) map.removeLayer(weatherLayerRef.current);
    if (!showWeather || weatherPoints.length === 0) return;

    const lg = L.layerGroup();
    weatherPoints.forEach((wp) => {
      const r = 150000 + wp.windSpeed * 5000;
      const severity = wp.windSpeed > 40 ? "rgba(239,68,68,0.12)" : wp.windSpeed > 25 ? "rgba(245,158,11,0.1)" : "rgba(6,182,212,0.07)";
      L.circle([wp.lat, wp.lng], {
        radius: r,
        color: "transparent",
        fillColor: severity,
        fillOpacity: 0.6,
      }).addTo(lg).bindTooltip(`${wp.condition} · ${wp.windSpeed.toFixed(0)}km/h · Ht ${wp.waveHeight.toFixed(1)}m`, { permanent: false });
    });
    lg.addTo(map);
    weatherLayerRef.current = lg;
  }, [showWeather, weatherPoints]);

  // Live WS updates
  useEffect(() => {
    wsClient.connect();
    const off = wsClient.on<VesselPosition>("VESSEL_UPDATE", (v) => {
      setVessels((prev) => prev.map((p) => p.mmsi === v.mmsi ? { ...p, ...v } : p));
    });
    const latencyTimer = setInterval(() => setLatency(18 + Math.floor(Math.random() * 14)), 4000);
    return () => {
      (off as () => void)();
      clearInterval(latencyTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-full" style={{ height }}>
      {/* Map */}
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD overlays */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Live status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur text-xs font-mono font-semibold"
          style={{ background: "rgba(2,13,26,0.85)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981" }}>
          <span className="w-2 h-2 rounded-full animate-live-pulse" style={{ background: "#10b981" }} />
          AIS LIVE · {latency}ms · {vessels.length} vessels
        </div>
        {/* Vessel legend */}
        <div className="px-3 py-2 rounded-lg backdrop-blur text-[10px]"
          style={{ background: "rgba(2,13,26,0.85)", border: "1px solid rgba(14,34,64,0.8)" }}>
          {Object.entries(VESSEL_COLORS).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5 py-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span style={{ color: "#94a3b8" }}>{STATUS_LABEL[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected vessel panel */}
      {selectedVessel && (
        <div className="absolute bottom-4 left-3 z-[1000] w-64 rounded-xl p-3 text-xs animate-slide-up"
          style={{ background: "rgba(2,13,26,0.92)", border: `1px solid ${VESSEL_COLORS[selectedVessel.status]}60`, backdropFilter: "blur(8px)" }}>
          <div className="flex justify-between items-start mb-2">
            <p className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{selectedVessel.name}</p>
            <button onClick={() => setSelectedVessel(null)} style={{ color: "#475569", fontSize: 16 }} className="pointer-events-auto">×</button>
          </div>
          {[
            ["MMSI",    selectedVessel.mmsi],
            ["Speed",   `${selectedVessel.speed} kn`],
            ["Heading", `${selectedVessel.heading.toFixed(0)}°`],
            ["Status",  STATUS_LABEL[selectedVessel.status]],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-1 border-b" style={{ borderColor: "rgba(14,34,64,0.6)" }}>
              <span style={{ color: "#64748b" }}>{l}</span>
              <span className="font-mono" style={{ color: "#e2e8f0" }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildPopup(v: VesselPosition) {
  const color = VESSEL_COLORS[v.status] ?? "#64748b";
  return `<div style="font-family:monospace;min-width:200px;background:#071428;border:1px solid #0e2240;border-radius:8px;padding:12px;color:#e2e8f0;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;"></span>
      <strong style="font-size:13px;">${v.name}</strong>
    </div>
    <table style="width:100%;font-size:11px;border-collapse:collapse;">
      <tr><td style="color:#64748b;padding:2px 0;">MMSI</td><td style="text-align:right;color:#94a3b8;">${v.mmsi}</td></tr>
      <tr><td style="color:#64748b;padding:2px 0;">Speed</td><td style="text-align:right;color:${color};">${v.speed} kn</td></tr>
      <tr><td style="color:#64748b;padding:2px 0;">Heading</td><td style="text-align:right;color:#94a3b8;">${v.heading.toFixed(0)}°T</td></tr>
      <tr><td style="color:#64748b;padding:2px 0;">Position</td><td style="text-align:right;color:#94a3b8;">${v.lat.toFixed(3)}°N ${v.lng.toFixed(3)}°E</td></tr>
    </table>
  </div>`;
}
