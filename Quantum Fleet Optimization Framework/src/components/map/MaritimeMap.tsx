import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VesselPosition, WeatherPoint, fetchSatelliteAisTracking, SatelliteAisResponse, fetchGlobalPorts, GlobalPort } from "../../services/api";
import { wsClient } from "../../services/websocket";
import { Layers, Compass, Radio, Shield, Waves, Anchor, Eye, EyeOff, MapPin, Globe, Fuel } from "lucide-react";

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
  "optimization-running": "#8b5cf6",
  offline:              "#64748b",
};

const ROUTE_COLORS = ["#10b981", "#ef4444", "#06b6d4", "#8b5cf6", "#f59e0b"];

// Build custom SVG vessel icon with heading arrow
function buildVesselIcon(color: string, heading: number, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <g transform="rotate(${heading}, 16, 16)">
      <polygon points="16,2 22,26 16,22 10,26" fill="${color}" stroke="#ffffff" stroke-width="1.8" opacity="0.95"/>
      <circle cx="16" cy="16" r="3.5" fill="#ffffff" opacity="0.9"/>
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

function buildPingIcon(color: string) {
  const html = `<div style="position:relative;width:40px;height:40px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:vessel-ping 2s ease-out infinite;"></div>
    <div style="position:absolute;inset:6px;border-radius:50%;background:${color};opacity:0.45;animation:vessel-ping 2s ease-out 0.5s infinite;"></div>
  </div>`;
  return L.divIcon({ className: "", html, iconSize: [40, 40], iconAnchor: [20, 20] });
}

function buildPortIcon(code: string) {
  const html = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
    <div style="width:24px;height:24px;border-radius:50%;background:#f59e0b;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(245,158,11,0.8);">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      </svg>
    </div>
    <span style="font-family:monospace;font-size:9px;font-weight:bold;color:#ffffff;background:rgba(5,12,24,0.85);padding:1px 4px;border-radius:4px;margin-top:2px;border:1px solid rgba(245,158,11,0.4);white-space:nowrap;">
      ${code}
    </span>
  </div>`;
  return L.divIcon({ className: "", html, iconSize: [48, 40], iconAnchor: [24, 12], popupAnchor: [0, -14] });
}

interface Props {
  initialVessels?: VesselPosition[];
  vessels?: VesselPosition[];
  selectedVessel?: VesselPosition | null;
  onSelectVessel?: (v: VesselPosition) => void;
  weatherPoints?: WeatherPoint[];
  showRoutes?: boolean;
  showWeather?: boolean;
  showGrid?: boolean;
  theme?: "dark" | "light";
  height?: number | string;
  onVesselClick?: (v: VesselPosition) => void;
  layers?: any;
}

export default function MaritimeMap({
  initialVessels = [],
  vessels: incomingVessels,
  selectedVessel: propSelectedVessel,
  onSelectVessel,
  weatherPoints = [],
  showRoutes = true,
  showWeather = false,
  theme = "dark",
  height = "100%",
  onVesselClick,
  layers,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const refTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const pingMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);
  const portsLayerRef = useRef<L.LayerGroup | null>(null);
  const encLayerRef = useRef<L.LayerGroup | null>(null);
  const tssLayerRef = useRef<L.LayerGroup | null>(null);
  const drLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(propSelectedVessel || null);
  const [vessels, setVessels] = useState<VesselPosition[]>(incomingVessels || initialVessels || []);
  const [ports, setPorts] = useState<GlobalPort[]>([]);
  const [latency, setLatency] = useState(22);
  const [satAis, setSatAis] = useState<SatelliteAisResponse | null>(null);

  // Basemap style state
  const [basemapStyle, setBasemapStyle] = useState<"esri_dark" | "esri_ocean" | "osm">("esri_dark");

  // GIS Layer Toggles
  const [showPorts, setShowPorts] = useState(true);
  const [showENC, setShowENC] = useState(true);
  const [showTSS, setShowTSS] = useState(true);
  const [showDeadReckoning, setShowDeadReckoning] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Synchronize incoming vessels prop
  useEffect(() => {
    if (incomingVessels && incomingVessels.length > 0) {
      setVessels(incomingVessels);
    } else if (initialVessels && initialVessels.length > 0) {
      setVessels(initialVessels);
    }
  }, [incomingVessels, initialVessels]);

  useEffect(() => {
    if (propSelectedVessel) {
      setSelectedVessel(propSelectedVessel);
    }
  }, [propSelectedVessel]);

  // Fetch all global maritime ports
  useEffect(() => {
    fetchGlobalPorts()
      .then((data) => setPorts(data.ports))
      .catch(() => {});
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [18, 55],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch Tile Basemaps (Watermark-free Commercial Maritime Tiles)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (refTileLayerRef.current) {
      map.removeLayer(refTileLayerRef.current);
      refTileLayerRef.current = null;
    }

    if (basemapStyle === "esri_dark") {
      baseTileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, opacity: 1.0 }
      ).addTo(map);

      refTileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, opacity: 0.85 }
      ).addTo(map);
    } else if (basemapStyle === "esri_ocean") {
      baseTileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 13, opacity: 1.0 }
      ).addTo(map);

      refTileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 13, opacity: 0.9 }
      ).addTo(map);
    } else {
      baseTileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 18, opacity: 0.9 }
      ).addTo(map);
    }
  }, [basemapStyle]);

  // Global Maritime Ports Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (portsLayerRef.current) {
      map.removeLayer(portsLayerRef.current);
      portsLayerRef.current = null;
    }

    if (!showPorts || ports.length === 0) return;

    const lg = L.layerGroup();

    ports.forEach((p) => {
      const vlsfo = p.prices_usd_mt?.VLSFO ?? 610;
      const lng = p.prices_usd_mt?.LNG ?? 580;
      const meoh = p.prices_usd_mt?.GREEN_METHANOL ?? 820;

      const popupHtml = `
        <div style="font-family:system-ui,sans-serif;min-width:240px;background:#0e203c;border:1px solid #f59e0b;border-radius:12px;padding:12px;color:#f8fafc;box-shadow:0 12px 30px rgba(0,0,0,0.6);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1px solid #1a3b68;padding-bottom:6px;">
            <div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></div>
            <div>
              <strong style="font-size:14px;color:#ffffff;display:block;">${p.name}</strong>
              <span style="font-size:10px;color:#93c5fd;font-family:monospace;">${p.country} · UN/LOCODE: ${p.code}</span>
            </div>
          </div>
          <table style="width:100%;font-size:11px;border-collapse:collapse;margin-bottom:8px;">
            <tr><td style="color:#94a3b8;padding:2px 0;">Max Draft:</td><td style="text-align:right;color:#f8fafc;font-weight:bold;">${p.max_draft_m} m</td></tr>
            <tr><td style="color:#94a3b8;padding:2px 0;">Avg Berth Wait:</td><td style="text-align:right;color:#38bdf8;font-weight:bold;">${p.avg_berth_wait_hrs} hrs</td></tr>
            <tr><td style="color:#94a3b8;padding:2px 0;">Port Fee:</td><td style="text-align:right;color:#e2e8f0;">$${p.port_call_fee_usd.toLocaleString()}</td></tr>
          </table>
          <div style="background:rgba(15,23,42,0.8);border-radius:8px;padding:6px 8px;border:1px solid #1a3b68;font-size:10px;font-family:monospace;">
            <span style="color:#f59e0b;font-weight:bold;display:block;margin-bottom:2px;">BUNKER SPOT PRICES ($/MT):</span>
            <div style="display:flex;justify-content:space-between;color:#cbd5e1;">
              <span>VLSFO: <b style="color:#10b981;">$${vlsfo}</b></span>
              <span>LNG: <b style="color:#06b6d4;">$${lng}</b></span>
              <span>e-MeOH: <b style="color:#a855f7;">$${meoh}</b></span>
            </div>
          </div>
        </div>
      `;

      L.marker([p.lat, p.lng], { icon: buildPortIcon(p.code), zIndexOffset: 200 })
        .addTo(lg)
        .bindPopup(popupHtml, { className: "maritime-popup", maxWidth: 280 });
    });

    lg.addTo(map);
    portsLayerRef.current = lg;
  }, [showPorts, ports]);

  // S-57 Bathymetry Shallow Hazard Zones
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (encLayerRef.current) {
      map.removeLayer(encLayerRef.current);
      encLayerRef.current = null;
    }

    if (!showENC) return;

    const lg = L.layerGroup();
    const shallowHazards = [
      { name: "Malacca Strait Sandbanks (<14m Draft)", bounds: [[1.8, 102.0], [2.6, 102.8]], color: "#f59e0b" },
      { name: "Dover Strait Shallows (<15m Draft)", bounds: [[50.9, 1.2], [51.4, 1.7]], color: "#f59e0b" },
      { name: "Bab-el-Mandeb Reef Corridor (<16m Draft)", bounds: [[12.4, 43.2], [12.9, 43.6]], color: "#f59e0b" }
    ];

    shallowHazards.forEach((hz) => {
      L.rectangle(hz.bounds as L.LatLngBoundsExpression, {
        color: hz.color,
        weight: 1.5,
        fillColor: hz.color,
        fillOpacity: 0.18,
        dashArray: "4 4"
      }).addTo(lg).bindTooltip(`S-57 Shallow Hazard: ${hz.name}`, { sticky: true });
    });

    lg.addTo(map);
    encLayerRef.current = lg;
  }, [showENC]);

  // IMO Traffic Separation Schemes (TSS)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tssLayerRef.current) {
      map.removeLayer(tssLayerRef.current);
      tssLayerRef.current = null;
    }

    if (!showTSS) return;

    const lg = L.layerGroup();
    const tssLanes = [
      {
        name: "Singapore Strait TSS Lane",
        coords: [[1.2, 103.6], [1.25, 103.85], [1.32, 104.2], [1.4, 104.45]],
        color: "#8b5cf6",
        vsrLimit: "12 kn Max (IMO Mandatory)"
      },
      {
        name: "English Channel TSS Lane",
        coords: [[50.5, 0.5], [51.0, 1.4], [51.3, 1.8], [51.6, 2.3]],
        color: "#8b5cf6",
        vsrLimit: "10 kn Max (VSR Whale Protection)"
      },
      {
        name: "Suez Canal Approach TSS",
        coords: [[27.5, 34.2], [28.5, 33.5], [29.8, 32.6]],
        color: "#8b5cf6",
        vsrLimit: "11 kn Convoys Only"
      }
    ];

    tssLanes.forEach((lane) => {
      L.polyline(lane.coords as L.LatLngExpression[], {
        color: lane.color,
        weight: 4,
        opacity: 0.85,
        dashArray: "8 5"
      }).addTo(lg).bindTooltip(`IMO TSS Corridor: ${lane.name} · ${lane.vsrLimit}`, { sticky: true });
    });

    lg.addTo(map);
    tssLayerRef.current = lg;
  }, [showTSS]);

  // Satellite AIS Dead Reckoning Kinematic Cones
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drLayerRef.current) {
      map.removeLayer(drLayerRef.current);
      drLayerRef.current = null;
    }

    if (!showDeadReckoning || !vessels || vessels.length === 0) return;

    const lg = L.layerGroup();

    (vessels || []).forEach((v) => {
      const dist_deg = ((v.speed || 14) * 2.0) / 60.0;
      const head_rad = ((v.heading || 0) * Math.PI) / 180.0;
      const proj_lat = v.lat + dist_deg * Math.cos(head_rad);
      const proj_lng = v.lng + (dist_deg * Math.sin(head_rad)) / Math.cos((v.lat * Math.PI) / 180.0);

      L.polyline([[v.lat, v.lng], [proj_lat, proj_lng]], {
        color: "#38bdf8",
        weight: 2,
        dashArray: "4 4",
        opacity: 0.8
      }).addTo(lg);

      L.circle([proj_lat, proj_lng], {
        radius: 12000,
        color: "#38bdf8",
        weight: 1.5,
        fillColor: "#38bdf8",
        fillOpacity: 0.12,
      }).addTo(lg).bindTooltip(`${v.name} +2h Satellite AIS DR Vector · ${v.speed}kn @ ${(v.heading || 0).toFixed(0)}°`, { sticky: true });
    });

    lg.addTo(map);
    drLayerRef.current = lg;
  }, [showDeadReckoning, vessels]);

  // Draw Routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showRoutes) return;
    polylinesRef.current.forEach((p) => map.removeLayer(p));
    polylinesRef.current = [];

    const ROUTES: Array<[number, number][]> = [
      [[1.29, 103.85], [5.5, 95.0], [12.0, 60.0], [12.8, 45.0], [27.8, 34.0], [36.0, -5.3], [51.95, 4.02]],
      [[31.2, 121.4], [28, 160], [20, -170], [33.7, -118.2]],
      [[51.95, 4.02], [50.0, -10.0], [44.0, -38.0], [40.7, -74.0]],
      [[-20.3, 118.6], [-5.0, 118.0], [15.0, 118.0], [31.2, 121.4]],
      [[29.7, -95.0], [25.0, -75.0], [32.0, -55.0], [51.29, 4.25]],
    ];

    ROUTES.forEach((coords, i) => {
      const pl = L.polyline(coords as L.LatLngExpression[], {
        color: ROUTE_COLORS[i],
        weight: 2.5,
        opacity: 0.7,
        dashArray: "6 4",
      }).addTo(map);
      polylinesRef.current.push(pl);
    });
  }, [showRoutes]);

  // Place/update vessel markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !vessels) return;

    (vessels || []).forEach((v) => {
      const color = VESSEL_COLORS[v.status] ?? "#64748b";

      if (!pingMarkersRef.current.has(v.mmsi || v.id)) {
        const ping = L.marker([v.lat, v.lng], { icon: buildPingIcon(color), zIndexOffset: 0 }).addTo(map);
        pingMarkersRef.current.set(v.mmsi || v.id, ping);
      } else {
        pingMarkersRef.current.get(v.mmsi || v.id)!.setLatLng([v.lat, v.lng]);
      }

      if (!markersRef.current.has(v.mmsi || v.id)) {
        const m = L.marker([v.lat, v.lng], { icon: buildVesselIcon(color, v.heading || 0), zIndexOffset: 100 })
          .addTo(map)
          .bindPopup(buildPopup(v), { className: "maritime-popup", maxWidth: 280 });
        m.on("click", () => {
          setSelectedVessel(v);
          onVesselClick?.(v);
          onSelectVessel?.(v);
        });
        markersRef.current.set(v.mmsi || v.id, m);
      } else {
        const m = markersRef.current.get(v.mmsi || v.id)!;
        m.setLatLng([v.lat, v.lng]);
        m.setIcon(buildVesselIcon(color, v.heading || 0));
      }
    });
  }, [vessels, onVesselClick, onSelectVessel]);

  // Fetch satellite tracking for selected vessel
  useEffect(() => {
    if (selectedVessel) {
      fetchSatelliteAisTracking({
        vessel_id: selectedVessel.id || "V-01",
        lat: selectedVessel.lat,
        lng: selectedVessel.lng,
        speed: selectedVessel.speed,
        heading: selectedVessel.heading
      }).then(setSatAis).catch(() => {});
    }
  }, [selectedVessel]);

  // Live WS updates
  useEffect(() => {
    wsClient.connect();
    const off = wsClient.on<VesselPosition>("VESSEL_UPDATE", (v) => {
      setVessels((prev) => (prev || []).map((p) => (p.mmsi === v.mmsi || p.id === v.id) ? { ...p, ...v } : p));
    });
    const latencyTimer = setInterval(() => setLatency(16 + Math.floor(Math.random() * 12)), 4000);
    return () => {
      (off as () => void)();
      clearInterval(latencyTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-full" style={{ height }}>
      {/* Leaflet Map Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Left HUD overlays */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Live Satellite AIS Status Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur text-xs font-mono font-bold"
          style={{ background: "rgba(5,12,24,0.92)", border: "1px solid rgba(16,185,129,0.5)", color: "#10b981" }}>
          <span className="w-2.5 h-2.5 rounded-full animate-live-pulse" style={{ background: "#10b981" }} />
          <span>SATELLITE AIS + NMEA BRIDGE · {latency}ms · {(vessels || []).length} vessels</span>
        </div>

        {/* Global Ports Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl backdrop-blur text-[11px] font-mono font-semibold"
          style={{ background: "rgba(5,12,24,0.88)", border: "1px solid rgba(245,158,11,0.5)", color: "#f59e0b" }}>
          <Anchor size={12} className="text-amber-400" />
          <span>{ports.length} GLOBAL COMMERCIAL PORTS LOADED</span>
        </div>
      </div>

      {/* Top Right GIS & Basemap Layer Controls */}
      <div className="absolute top-3 right-12 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xl transition-all hover:scale-105"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-1)" }}
          >
            <Layers size={14} className="text-cyan-500" />
            <span>GIS & Basemaps</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-10 w-64 rounded-2xl p-4 border shadow-2xl space-y-3 backdrop-blur-xl animate-fade-in-fast glass-card"
              style={{ borderColor: "var(--border)" }}>
              
              {/* Basemap Selection */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 mb-1.5">Nautical Basemap</p>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border text-[11px]" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                  <button
                    onClick={() => setBasemapStyle("esri_dark")}
                    className={`py-1.5 rounded-lg font-bold transition-all ${basemapStyle === "esri_dark" ? "bg-cyan-500 text-white shadow" : "hover:text-cyan-500"}`}
                    style={{ color: basemapStyle === "esri_dark" ? "#ffffff" : "var(--text-3)" }}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setBasemapStyle("esri_ocean")}
                    className={`py-1.5 rounded-lg font-bold transition-all ${basemapStyle === "esri_ocean" ? "bg-cyan-500 text-white shadow" : "hover:text-cyan-500"}`}
                    style={{ color: basemapStyle === "esri_ocean" ? "#ffffff" : "var(--text-3)" }}
                  >
                    Ocean
                  </button>
                  <button
                    onClick={() => setBasemapStyle("osm")}
                    className={`py-1.5 rounded-lg font-bold transition-all ${basemapStyle === "osm" ? "bg-cyan-500 text-white shadow" : "hover:text-cyan-500"}`}
                    style={{ color: basemapStyle === "osm" ? "#ffffff" : "var(--text-3)" }}
                  >
                    Standard
                  </button>
                </div>
              </div>

              <div className="border-t pt-2 space-y-1.5" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>Navigation Overlays</p>
                
                <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-500/10" style={{ color: "var(--text-2)" }}>
                  <span className="flex items-center gap-2">
                    <Anchor size={13} className="text-amber-500" /> Commercial Ports ({ports.length})
                  </span>
                  <input
                    type="checkbox"
                    checked={showPorts}
                    onChange={(e) => setShowPorts(e.target.checked)}
                    className="rounded accent-emerald-500 cursor-pointer w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-500/10" style={{ color: "var(--text-2)" }}>
                  <span className="flex items-center gap-2">
                    <Waves size={13} className="text-amber-500" /> S-57 Bathymetry
                  </span>
                  <input
                    type="checkbox"
                    checked={showENC}
                    onChange={(e) => setShowENC(e.target.checked)}
                    className="rounded accent-emerald-500 cursor-pointer w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-500/10" style={{ color: "var(--text-2)" }}>
                  <span className="flex items-center gap-2">
                    <Shield size={13} className="text-purple-500" /> IMO TSS Lanes
                  </span>
                  <input
                    type="checkbox"
                    checked={showTSS}
                    onChange={(e) => setShowTSS(e.target.checked)}
                    className="rounded accent-emerald-500 cursor-pointer w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-500/10" style={{ color: "var(--text-2)" }}>
                  <span className="flex items-center gap-2">
                    <Radio size={13} className="text-sky-500" /> Dead Reckoning (+2h)
                  </span>
                  <input
                    type="checkbox"
                    checked={showDeadReckoning}
                    onChange={(e) => setShowDeadReckoning(e.target.checked)}
                    className="rounded accent-emerald-500 cursor-pointer w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Vessel Floating Telemetry Panel */}
      {selectedVessel && (
        <div className="absolute bottom-5 left-5 z-[1000] w-80 rounded-2xl p-4 border shadow-2xl backdrop-blur-xl animate-fade-in-fast space-y-3 glass-card"
          style={{ borderColor: "rgba(16,185,129,0.5)" }}>
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <Anchor size={16} className="text-emerald-500" />
              <div>
                <strong className="text-sm font-bold block" style={{ color: "var(--text-1)" }}>{selectedVessel.name}</strong>
                <span className="text-[11px] font-mono" style={{ color: "var(--text-3)" }}>MMSI: {selectedVessel.mmsi || selectedVessel.id}</span>
              </div>
            </div>
            <button onClick={() => setSelectedVessel(null)} className="text-sm font-bold px-1.5 py-0.5 rounded hover:bg-slate-500/20" style={{ color: "var(--text-3)" }}>✕</button>
          </div>

          <div className="space-y-1.5">
            {[
              ["Speed Over Ground", `${(selectedVessel.speed || 14).toFixed(1)} knots`],
              ["True Heading", `${(selectedVessel.heading || 0).toFixed(0)}°T`],
              ["Coordinates", `${(selectedVessel.lat || 0).toFixed(3)}°N, ${(selectedVessel.lng || 0).toFixed(3)}°E`],
              ["Fuel Rate", `${selectedVessel.fuel_rate_mt_day || 38.2} MT/day`],
              ["CII Rating", `Grade ${selectedVessel.cii_grade || selectedVessel.cii || "A"}`],
              ["Tracking Mode", satAis?.dead_reckoning?.tracking_mode || "SATELLITE_AIS_HYBRID"]
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-0.5 text-xs">
                <span style={{ color: "var(--text-3)" }}>{l}</span>
                <span className="font-mono font-bold" style={{ color: "var(--text-1)" }}>{v}</span>
              </div>
            ))}
          </div>

          {satAis && (
            <div className="p-2.5 rounded-xl border text-[11px] font-mono space-y-0.5" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
              <span className="text-sky-500 font-bold block">SATELLITE AIS TELEMETRY:</span>
              <p style={{ color: "var(--text-2)" }}>Constellation: {satAis.satellite_constellation}</p>
              <p className="text-emerald-500">Satcom Latency: {satAis.satcom_uplink_latency_sec}s</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildPopup(v: VesselPosition) {
  const color = VESSEL_COLORS[v.status] ?? "#64748b";
  return `<div style="font-family:monospace;min-width:220px;background:#0e203c;border:1px solid #1a3b68;border-radius:10px;padding:12px;color:#f8fafc;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1px solid #1a3b68;padding-bottom:6px;">
      <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;box-shadow:0 0 8px ${color};"></span>
      <strong style="font-size:14px;color:#ffffff;">${v.name}</strong>
    </div>
    <table style="width:100%;font-size:12px;border-collapse:collapse;">
      <tr><td style="color:#93c5fd;padding:2px 0;">MMSI</td><td style="text-align:right;color:#cbd5e1;">${v.mmsi || v.id}</td></tr>
      <tr><td style="color:#93c5fd;padding:2px 0;">Speed</td><td style="text-align:right;color:${color};font-weight:bold;">${v.speed} kn</td></tr>
      <tr><td style="color:#93c5fd;padding:2px 0;">Heading</td><td style="text-align:right;color:#cbd5e1;">${(v.heading || 0).toFixed(0)}°T</td></tr>
      <tr><td style="color:#93c5fd;padding:2px 0;">CII Grade</td><td style="text-align:right;color:#10b981;font-weight:bold;">${v.cii_grade || v.cii || "A"}</td></tr>
      <tr><td style="color:#93c5fd;padding:2px 0;">Satcom</td><td style="text-align:right;color:#38bdf8;">SPIRE LEO</td></tr>
    </table>
  </div>`;
}
