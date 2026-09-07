import { useState } from "react"
import {
  LayoutDashboard,
  Globe2,
  Navigation,
  Ship,
  Leaf,
  BarChart3,
  FileCheck2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Anchor,
  X,
  Shield,
  DollarSign,
  Users,
  Radio,
  Layers,
} from "lucide-react"
import { useSecurity } from "../../context/SecurityContext"

const navItems = [
  { id: "overview", label: "Fleet Overview", icon: LayoutDashboard, badge: null },
  { id: "workflow", label: "System Workflow", icon: Layers, badge: "PIPELINE" },
  { id: "command", label: "Command Center", icon: Globe2, badge: "GIS" },
  { id: "optimizer", label: "Voyage Optimizer", icon: Navigation, badge: "HQOA" },
  { id: "fleet", label: "Vessel Registry", icon: Ship, badge: "5" },
  { id: "commercial", label: "Bunker Arbitrage", icon: DollarSign, badge: "PRO" },
  { id: "swarm", label: "Convoy Swarm", icon: Users, badge: "JIT" },
  { id: "edge", label: "IoT & Hardware", icon: Radio, badge: "LIVE" },
  { id: "fuel", label: "Fuel & Decarb", icon: Leaf, badge: null },
  { id: "benchmark", label: "Algorithm Arena", icon: BarChart3, badge: null },
  { id: "compliance", label: "IMO CII & MRV", icon: FileCheck2, badge: "AUDIT" },
]

interface Props {
  active: string
  onNavigate: (id: string) => void
  notifications: number
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({
  active,
  onNavigate,
  notifications,
  mobileOpen,
  onMobileClose,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { threatLevel } = useSecurity()

  const handleNav = (id: string) => {
    onNavigate(id)
    onMobileClose?.()
  }

  const NavContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const expanded = forceExpanded || !collapsed

    return (
      <>
        {/* Brand Header */}
        <div
          className="flex items-center gap-3 px-4 border-b shrink-0 transition-colors"
          style={{ height: 64, borderColor: "var(--border)" }}
        >
          <div
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-white shadow-md transition-transform duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #0284c7 100%)",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.35)",
            }}
          >
            <Anchor size={18} />
          </div>

          {expanded && (
            <div className="overflow-hidden">
              <div
                className="font-display font-bold text-sm leading-none tracking-tight"
                style={{ color: "var(--text-1)" }}
              >
                GreenFleet
              </div>
              <div
                className="text-xs mt-1 font-mono font-semibold text-sky-500 dark:text-sky-400"
              >
                Quantum v2.4
              </div>
            </div>
          )}

          {forceExpanded && onMobileClose && (
            <button
              className="ml-auto p-1.5 rounded-lg text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"
              onClick={onMobileClose}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Section Title */}
        {expanded && (
          <div className="px-4 pt-3.5 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Operations Center
            </span>
          </div>
        )}

        {/* Navigation Items with Sapphire Hover & Active Physics */}
        <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={!expanded ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-sky-500/10 text-blue-600 dark:text-sky-300 border-l-3 border-blue-600 dark:border-sky-400 shadow-xs"
                    : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] hover:translate-x-1"
                }`}
                style={{ height: 42 }}
              >
                <Icon size={19} className={`shrink-0 transition-transform duration-200 ${isActive ? "text-blue-600 dark:text-sky-400 scale-110" : ""}`} />
                {expanded && (
                  <>
                    <span className="flex-1 text-left whitespace-nowrap truncate text-sm">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-2xs transition-all"
                        style={{
                          background:
                            item.badge === "PRO"
                              ? "rgba(14,165,233,0.18)"
                              : item.badge === "JIT"
                                ? "rgba(99,102,241,0.18)"
                                : item.badge === "LIVE" || item.badge === "HQOA"
                                  ? "rgba(37,99,235,0.18)"
                                  : "var(--bg-card)",
                          borderColor: "var(--border)",
                          color:
                            item.badge === "PRO"
                              ? "#0284c7"
                              : item.badge === "JIT"
                                ? "#6366f1"
                                : item.badge === "LIVE" || item.badge === "HQOA"
                                  ? "#2563eb"
                                  : "var(--text-3)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="shrink-0 border-t px-2.5 py-3 space-y-1 transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => handleNav("reports")}
            className={`w-full flex items-center gap-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              active === "reports"
                ? "bg-blue-500/15 text-blue-600 dark:text-sky-400 font-bold"
                : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
            }`}
            style={{ height: 40 }}
          >
            <div className="relative shrink-0">
              <Bell size={18} />
              {notifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white bg-rose-500 animate-live-pulse"
                >
                  {notifications}
                </span>
              )}
            </div>
            {expanded && <span>Audit & Risk Alerts</span>}
          </button>

          {!forceExpanded && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-3 px-3 rounded-lg text-xs text-[var(--text-4)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-all"
              style={{ height: 36 }}
            >
              {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
              {expanded && <span>Collapse Sidebar</span>}
            </button>
          )}

          {expanded && (
            <div
              className="mt-2 p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between shadow-2xs"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-sub)",
                color: "var(--text-3)",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-sky-500" />
                <span>SIH-26138</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/30">
                PROD v2.4
              </span>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <aside
        className="hidden lg:flex flex-col shrink-0 border-r transition-all duration-300"
        style={{
          width: collapsed ? 64 : 236,
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <NavContent />
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r lg:hidden animate-fade-in shadow-2xl"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <NavContent forceExpanded />
          </aside>
        </>
      )}
    </>
  )
}
