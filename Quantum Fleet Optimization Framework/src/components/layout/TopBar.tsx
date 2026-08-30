import { useState, useEffect } from "react";
import { Bell, Search, RefreshCw, Menu, Sun, Moon, Shield, Lock, Wifi, WifiOff, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useSecurity } from "../../context/SecurityContext";
import { wsClient } from "../../services/websocket";

interface Props {
  activePage: string;
  onNavigate: (id: string) => void;
  onMenuOpen?: () => void;
}

const pageLabels: Record<string, string> = {
  overview:      "Executive Overview",
  command:       "Global Maritime Command Center",
  optimizer:     "Voyage Optimizer",
  console:       "Quantum Optimization Console",
  results:       "Optimization Results",
  fleet:         "Fleet Management",
  fuel:          "Fuel & Decarbonization Sandbox",
  benchmark:     "Algorithm Benchmark Arena",
  compliance:    "IMO CII Compliance Monitor",
  commercial:    "Commercial Fleet Economics & Bunker Arbitrage",
  swarm:         "Convoy Swarm Optimization",
  edge:          "Maritime IoT & Edge Bridge",
  notifications: "Risk & Notifications",
  health:        "Data & Model Health",
  settings:      "Platform Settings",
  reports:       "Reports & Audit Certificates",
};

function formatSession(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TopBar({ activePage, onNavigate, onMenuOpen }: Props) {
  const { theme, toggle } = useTheme();
  const { user, sessionAge, threatLevel, logAction } = useSecurity();
  const [wsConnected, setWsConnected] = useState(true);
  const [latency, setLatency] = useState(22);
  const [alertCount, setAlertCount] = useState(2);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("just now");

  useEffect(() => {
    wsClient.connect();
    const offConn = wsClient.on<{ status: string; latency?: number }>("CONNECTION", (d) => {
      setWsConnected(d.status === "connected");
      if (d.latency) setLatency(d.latency);
    });
    const offAlert = wsClient.on<{ severity: string }>("ALERT", (a) => {
      if (a.severity === "critical" || a.severity === "warning") {
        setAlertCount((n) => n + 1);
      }
    });
    const offVessel = wsClient.on("VESSEL_UPDATE", () => {
      setLastUpdate("just now");
    });
    const latencyTimer = setInterval(() => setLatency(18 + Math.floor(Math.random() * 16)), 5000);
    const updateTimer = setInterval(() => setLastUpdate((prev) => {
      const map: Record<string, string> = { "just now": "3s ago", "3s ago": "6s ago", "6s ago": "just now" };
      return map[prev] ?? "just now";
    }), 3000);
    return () => {
      (offConn as () => void)();
      (offAlert as () => void)();
      (offVessel as () => void)();
      clearInterval(latencyTimer);
      clearInterval(updateTimer);
    };
  }, []);

  const threatColor = threatLevel === "high" ? "#ef4444" : threatLevel === "medium" ? "#f59e0b" : "#10b981";
  const sessionDanger = sessionAge > 3600;

  return (
    <>
      <header
        className="flex items-center gap-2 shrink-0 px-4 sm:px-6 border-b relative"
        style={{ height: 58, background: "var(--bg-surface)", borderColor: "var(--border)", zIndex: 20 }}
      >
        {/* Mobile hamburger */}
        <button className="flex lg:hidden p-2 rounded-xl" onClick={onMenuOpen} style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
          <Menu size={20} />
        </button>

        {/* Logo + page title */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
              <span className="text-xs font-bold text-white tracking-wider">GQ</span>
            </div>
            <span className="text-sm font-bold tracking-tight hidden md:inline" style={{ color: "var(--text-1)" }}>
              GreenFleet Quantum
            </span>
            <span className="text-xs hidden md:inline text-slate-500">/</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-display font-bold truncate" style={{ color: "var(--text-1)" }}>
              {pageLabels[activePage] || activePage}
            </h1>
          </div>
        </div>

        {/* Status Indicators & Live Telemetry Pill */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {/* WS status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold"
            style={{
              background: wsConnected ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              color: wsConnected ? "#10b981" : "#ef4444",
              border: `1px solid ${wsConnected ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}>
            {wsConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{wsConnected ? `LIVE · ${latency}ms` : "OFFLINE"}</span>
          </div>

          {/* Security status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
            style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--bg-card)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: threatColor }} />
            <span className="capitalize">{threatLevel} Level</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <button onClick={() => { setSearchOpen(!searchOpen); logAction("SEARCH_OPEN"); }}
            className="p-2 rounded-xl transition-colors" style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            title="Search Platform">
            <Search size={17} />
          </button>

          {/* Alerts */}
          <button onClick={() => { setAlertCount(0); onNavigate("reports"); logAction("VIEW_ALERTS"); }}
            className="relative p-2 rounded-xl transition-colors" style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            title="Alerts">
            <Bell size={17} />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white animate-pulse"
                style={{ background: "#ef4444" }}>
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button onClick={toggle} className="theme-toggle mx-1 shadow-sm"
            style={{ background: theme === "dark" ? "#1a3b68" : "#cbdbe9" }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            <div className="theme-toggle-thumb flex items-center justify-center" style={{ left: theme === "dark" ? 2 : 20 }}>
              {theme === "dark" ? <Moon size={11} color="#06b6d4" /> : <Sun size={11} color="#f59e0b" />}
            </div>
          </button>

          {/* User pill */}
          <div className="relative ml-1 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
                {user.avatar}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-none" style={{ color: "var(--text-1)" }}>{user.role}</p>
                <p className="text-[10px] leading-none mt-1" style={{ color: "var(--text-4)" }}>
                  Session {formatSession(sessionAge)}
                </p>
              </div>
              <ChevronDown size={12} className="hidden lg:block" style={{ color: "var(--text-3)" }} />
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl z-50 animate-fade-in-fast p-2"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{user.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-4)" }}>{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {user.role}
                    </span>
                    {user.mfaVerified && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                        MFA ✓
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 text-xs font-mono space-y-1" style={{ color: "var(--text-3)" }}>
                  <div>JWT: <span style={{ color: "#8b5cf6" }}>{user.jwtFragment}</span></div>
                  <div>Session: {formatSession(sessionAge)}</div>
                </div>
                <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <button onClick={() => setUserMenuOpen(false)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 border-b shadow-2xl z-50 animate-fade-in-fast p-4"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 border"
              style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
              <Search size={16} style={{ color: "var(--text-3)" }} />
              <input autoFocus placeholder="Search vessels, voyages, bunker hubs, alerts… (Esc to close)"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-1)" }}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)} />
              <kbd className="text-[10px] px-2 py-1 rounded font-mono" style={{ background: "var(--bg-hover)", color: "var(--text-3)" }}>ESC</kbd>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
