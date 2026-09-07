import { useState, useEffect } from "react"
import {
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  ChevronDown,
  Anchor,
  ShieldCheck,
  Clock,
  Radio,
} from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { useSecurity } from "../../context/SecurityContext"
import { wsClient } from "../../services/websocket"

interface Props {
  activePage: string
  onNavigate: (id: string) => void
  onMenuOpen?: () => void
}

const pageLabels: Record<string, string> = {
  overview: "Executive Fleet Overview",
  command: "Global Maritime Command Center",
  optimizer: "Hybrid Quantum Voyage Optimizer",
  console: "Quantum Optimization Console",
  results: "Optimization Results Studio",
  fleet: "Fleet Operations Management",
  fuel: "Fuel & Lifecycle Decarbonization",
  benchmark: "Algorithm Benchmark Arena",
  compliance: "IMO CII & MARPOL Compliance",
  commercial: "Bunkering Arbitrage & Dual-Fuel ROI",
  swarm: "Convoy Swarm & Port JIT Speed",
  edge: "Maritime IoT & Hardware Gateway",
  notifications: "Operational Risk Alerts",
  health: "Data & Model Telemetry",
  settings: "Platform Settings",
  reports: "IMO Audit Certificates & Logs",
}

function formatSession(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function TopBar({ activePage, onNavigate, onMenuOpen }: Props) {
  const { theme, toggle } = useTheme()
  const { user, sessionAge, threatLevel, logAction } = useSecurity()
  const [wsConnected, setWsConnected] = useState(true)
  const [latency, setLatency] = useState(22)
  const [alertCount, setAlertCount] = useState(2)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().slice(17, 25) + " UTC")

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setUtcTime(new Date().toUTCString().slice(17, 25) + " UTC")
    }, 1000)

    wsClient.connect()
    const offConn = wsClient.on<{ status: string; latency?: number }>(
      "CONNECTION",
      (d) => {
        setWsConnected(d.status === "connected")
        if (d.latency) setLatency(d.latency)
      },
    )
    const offAlert = wsClient.on<{ severity: string }>("ALERT", (a) => {
      if (a.severity === "critical" || a.severity === "warning") {
        setAlertCount((n) => n + 1)
      }
    })
    const latencyTimer = setInterval(
      () => setLatency(16 + Math.floor(Math.random() * 12)),
      5000,
    )
    return () => {
      clearInterval(clockTimer)
      offConn()
      offAlert()
      clearInterval(latencyTimer)
    }
  }, [])

  return (
    <>
      <header
        className="flex items-center gap-3.5 shrink-0 px-4 sm:px-6 border-b relative z-30 transition-all duration-300"
        style={{
          height: 64,
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Mobile menu trigger */}
        <button
          className="flex lg:hidden p-2 rounded-lg text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
          onClick={onMenuOpen}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        {/* Brand & Active Screen Title with Sapphire Gradient */}
        <div className="flex-1 min-w-0 flex items-center gap-3.5">
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #0284c7 100%)",
                boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)",
              }}
            >
              <Anchor size={19} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span
                className="text-sm sm:text-base font-bold tracking-tight leading-none"
                style={{ color: "var(--text-1)" }}
              >
                GreenFleet Quantum
              </span>
              <span className="text-[11px] font-mono text-sky-500 dark:text-sky-400 font-semibold mt-0.5 tracking-wider">
                COMMERCIAL OPERATIONS
              </span>
            </div>
            <span
              className="text-sm hidden sm:inline font-mono"
              style={{ color: "var(--text-4)" }}
            >
              /
            </span>
          </div>

          <div className="min-w-0">
            <h1
              className="text-base sm:text-lg font-bold truncate tracking-tight animate-fade-in"
              style={{ color: "var(--text-1)" }}
            >
              {pageLabels[activePage] || activePage}
            </h1>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {/* Real-time UTC Master Clock */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border shadow-2xs transition-all"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-2)",
            }}
          >
            <Clock size={14} className="text-sky-500 animate-pulse" />
            <span>{utcTime}</span>
          </div>

          {/* Satcom Telemetry Pill with Sapphire Pulse */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all duration-300 ${
              wsConnected
                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/35 shadow-xs"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/35"
            }`}
          >
            {wsConnected ? (
              <Radio size={14} className="text-sky-500 shrink-0 animate-live-pulse" />
            ) : (
              <WifiOff size={14} className="text-rose-500 shrink-0" />
            )}
            <span>{wsConnected ? `SATCOM LINK · ${latency}ms` : "OFFLINE"}</span>
          </div>

          {/* Security Gate Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-2xs"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-2)",
              background: "var(--bg-card)",
            }}
          >
            <ShieldCheck size={14} className="text-sky-500" />
            <span>TLS 1.3 Verified</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setSearchOpen(!searchOpen)
              logAction("SEARCH_OPEN")
            }}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-all active:scale-95 text-[var(--text-2)] hover:text-sky-500"
            title="Search Platform (Ctrl+K)"
          >
            <Search size={19} />
          </button>

          {/* Alerts Trigger */}
          <button
            onClick={() => {
              setAlertCount(0)
              onNavigate("reports")
              logAction("VIEW_ALERTS")
            }}
            className="relative p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-all active:scale-95 text-[var(--text-2)] hover:text-sky-500"
            title="System Alerts"
          >
            <Bell size={19} />
            {alertCount > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white bg-rose-500 animate-live-pulse"
              >
                {alertCount}
              </span>
            )}
          </button>

          {/* Day Bridge / Night Bridge Toggle with Physics Animation */}
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold hover:border-sky-500 transition-all duration-300 ml-1 shadow-2xs hover:shadow-md active:scale-95"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-1)",
            }}
            title={theme === "dark" ? "Switch to Day Bridge Mode (Light)" : "Switch to Night Bridge Mode (Dark)"}
          >
            {theme === "dark" ? (
              <>
                <Sun size={16} className="text-amber-400 transition-transform duration-300 hover:rotate-45" />
                <span className="hidden sm:inline">Day Bridge</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-sky-800 transition-transform duration-300 hover:-rotate-12" />
                <span className="hidden sm:inline">Night Bridge</span>
              </>
            )}
          </button>

          {/* User Profile */}
          <div className="relative ml-1 pl-2.5 border-l" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-all active:scale-95"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ background: "linear-gradient(135deg, #1e40af 0%, #0369a1 100%)" }}
              >
                {user.avatar}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-none" style={{ color: "var(--text-1)" }}>
                  {user.name}
                </p>
                <p className="text-[11px] leading-none mt-1 font-mono text-sky-500 dark:text-sky-400">
                  {formatSession(sessionAge)}
                </p>
              </div>
              <ChevronDown size={14} className="hidden lg:block text-[var(--text-3)]" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-2xl z-50 p-3 panel-solid animate-fade-in"
              >
                <div className="p-3 border-b" style={{ borderColor: "var(--border-sub)" }}>
                  <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                    {user.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      {user.role}
                    </span>
                    {user.mfaVerified && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                        MFA SECURED
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 text-xs font-mono space-y-2" style={{ color: "var(--text-3)" }}>
                  <div className="flex justify-between">
                    <span>Session Clock:</span>
                    <strong className="text-[var(--text-1)]">{formatSession(sessionAge)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Hash:</span>
                    <strong className="text-sky-500">ECDSA-SHA256</strong>
                  </div>
                </div>

                <div className="p-2 border-t" style={{ borderColor: "var(--border-sub)" }}>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all text-center"
                  >
                    Lock Command Terminal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Overlay */}
        {searchOpen && (
          <div
            className="absolute top-full left-0 right-0 border-b shadow-2xl z-50 p-4 animate-fade-in"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 border max-w-3xl mx-auto shadow-inner"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border)",
              }}
            >
              <Search size={19} className="text-sky-500" />
              <input
                autoFocus
                placeholder="Search vessels by IMO/MMSI, trade lanes, bunker hubs, audit certs, or routes… (Esc to close)"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-1)" }}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              />
              <kbd
                className="text-xs px-2 py-0.5 rounded font-mono border"
                style={{
                  background: "var(--bg-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text-3)",
                }}
              >
                ESC
              </kbd>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
