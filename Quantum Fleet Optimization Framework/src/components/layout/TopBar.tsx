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
    <header
      className="flex items-center gap-2 shrink-0 px-3 sm:px-4 border-b relative"
      style={{ height: 52, background: "var(--bg-surface)", borderColor: "var(--border)", zIndex: 20 }}
    >
      {/* Mobile hamburger */}
      <button className="flex lg:hidden p-2 rounded-lg" onClick={onMenuOpen} style={{ color: "var(--text-3)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
        <Menu size={18} />
      </button>

      {/* Logo + page title */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
            <span className="text-[10px] font-bold text-white">EQ</span>
          </div>
          <span className="text-xs font-semibold hidden md:inline" style={{ color: "var(--text-4)" }}>Egreen Quanta</span>
          <span className="text-xs hidden md:inline" style={{ color: "var(--border)" }}>/</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-display font-semibold truncate" style={{ color: "var(--text-1)" }}>
            {pageLabels[activePage] || activePage}
          </p>
          <p className="text-[10px] hidden md:block" style={{ color: "var(--text-5)" }}>
            SIH-26138 · QPSO Maritime Optimisation
          </p>
        </div>
      </div>

      {/* Security + connection indicators */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {/* WS status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold"
          style={{ background: wsConnected ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${wsConnected ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: wsConnected ? "#10b981" : "#ef4444" }}>
          {wsConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
          <span>{wsConnected ? "AIS" : "DISC"}</span>
          {wsConnected && <span style={{ color: "var(--text-4)" }}>{latency}ms</span>}
        </div>

        {/* Live data badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-live-pulse" style={{ background: "#06b6d4" }} />
          LIVE · {lastUpdate}
        </div>

        {/* Threat level */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold"
          style={{ background: `${threatColor}12`, border: `1px solid ${threatColor}30`, color: threatColor }}>
          <Shield size={10} />
          {threatLevel.toUpperCase()}
        </div>

        {/* TLS indicator */}
        <div className="enc-indicator hidden xl:flex">
          <Lock size={8} />
          TLS 1.3 · AES-256
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Search */}
        <button onClick={() => { setSearchOpen(!searchOpen); logAction("SEARCH_OPEN"); }}
          className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
          <Search size={15} />
        </button>

        {/* Refresh */}
        <button className="hidden sm:flex p-2 rounded-lg transition-colors" style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
          <RefreshCw size={13} />
        </button>

        {/* Alerts */}
        <button onClick={() => { setAlertCount(0); onNavigate("reports"); logAction("VIEW_ALERTS"); }}
          className="relative p-2 rounded-lg transition-colors" style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
          <Bell size={15} />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white animate-glow-pulse"
              style={{ background: "#ef4444" }}>
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button onClick={toggle} className="theme-toggle mx-1"
          style={{ background: theme === "dark" ? "#0e2240" : "#d1d5db" }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
          <div className="theme-toggle-thumb flex items-center justify-center" style={{ left: theme === "dark" ? 2 : 20 }}>
            {theme === "dark" ? <Moon size={10} color="#06b6d4" /> : <Sun size={10} color="#f59e0b" />}
          </div>
        </button>

        {/* User pill */}
        <div className="relative ml-1 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-colors"
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
              {user.avatar}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-1)" }}>{user.role}</p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: "var(--text-4)" }}>
                Session {formatSession(sessionAge)}
              </p>
            </div>
            <ChevronDown size={11} style={{ color: "var(--text-4)" }} className="hidden lg:block" />
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-2xl z-50 animate-fade-in-fast"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
              <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text-1)" }}>{user.name}</p>
                <p className="text-[10px]" style={{ color: "var(--text-4)" }}>{user.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="enc-indicator"><Shield size={8} />{user.role}</span>
                  {user.mfaVerified && <span className="enc-indicator"><Lock size={8} />MFA ✓</span>}
                </div>
              </div>
              <div className="p-2 text-[10px] font-mono" style={{ color: "var(--text-4)" }}>
                <div className="px-2 py-1">JWT: <span style={{ color: "#a78bfa" }}>{user.jwtFragment}</span></div>
                <div className="px-2 py-1">Session: {formatSession(sessionAge)} {sessionDanger ? "⚠ expiring" : "✓"}</div>
                <div className="px-2 py-1">User ID: {user.id}</div>
              </div>
              <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => setUserMenuOpen(false)}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 border-b shadow-xl z-50 animate-fade-in-fast p-3"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 border"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <Search size={13} style={{ color: "var(--text-4)" }} />
            <input autoFocus placeholder="Search vessels, voyages, alerts… (Esc to close)"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-1)" }}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)} />
            <kbd className="text-[9px] px-1 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-4)" }}>ESC</kbd>
          </div>
        </div>
      )}
    </header>
  );
}
