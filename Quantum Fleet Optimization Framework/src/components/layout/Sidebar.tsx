import { useState, useEffect } from "react";
import {
  LayoutDashboard, Globe2, Navigation, Ship, Leaf, BarChart3,
  FileCheck2, Bell, ChevronLeft, ChevronRight, Zap, X, Shield, Lock,
  DollarSign, Users, Radio, Cpu
} from "lucide-react";
import { useSecurity } from "../../context/SecurityContext";

const navItems = [
  { id: "overview",    label: "Overview",               icon: LayoutDashboard, badge: null },
  { id: "command",     label: "Command Center",         icon: Globe2,          badge: null },
  { id: "optimizer",   label: "Voyage Optimizer",       icon: Navigation,      badge: null },
  { id: "fleet",       label: "Fleet",                  icon: Ship,            badge: "5" },
  { id: "commercial",  label: "Commercial Economics",   icon: DollarSign,      badge: "NEW" },
  { id: "swarm",       label: "Convoy Swarm",           icon: Users,           badge: "JIT" },
  { id: "edge",        label: "IoT & Edge Bridge",      icon: Radio,           badge: "LIVE" },
  { id: "fuel",        label: "Fuel & Decarbonization", icon: Leaf,            badge: null },
  { id: "benchmark",   label: "Benchmark Arena",        icon: BarChart3,       badge: null },
  { id: "compliance",  label: "Compliance & Reports",   icon: FileCheck2,      badge: "1" },
];

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  notifications: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ active, onNavigate, notifications, mobileOpen, onMobileClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, sessionAge, threatLevel } = useSecurity();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const threatColor = threatLevel === "high" ? "#ef4444" : threatLevel === "medium" ? "#f59e0b" : "#10b981";

  const handleNav = (id: string) => {
    onNavigate(id);
    onMobileClose?.();
  };

  const NavContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const expanded = forceExpanded || !collapsed;
    return (
      <>
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 border-b shrink-0"
          style={{ height: 56, borderColor: "var(--border)" }}
        >
          <div
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            <Zap size={14} className="text-white" />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <div className="font-display font-bold text-sm leading-none whitespace-nowrap" style={{ color: "var(--text-1)" }}>
                GreenFleet
              </div>
              <div className="text-xs mt-0.5 whitespace-nowrap font-semibold" style={{ color: "#06b6d4" }}>
                Quantum
              </div>
            </div>
          )}
          {/* Mobile close */}
          {forceExpanded && onMobileClose && (
            <button className="ml-auto p-1 rounded" onClick={onMobileClose} style={{ color: "var(--text-3)" }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={!expanded ? item.label : undefined}
                className="w-full flex items-center gap-3 px-3 rounded-lg transition-all duration-150"
                style={{
                  height: 38,
                  background: isActive ? "rgba(16,185,129,0.12)" : "transparent",
                  color: isActive ? "#10b981" : "var(--text-3)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={16} className="shrink-0" />
                {expanded && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left whitespace-nowrap truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: item.badge === "NEW" ? "#38bdf8" : item.badge === "JIT" ? "#a855f7" : item.badge === "LIVE" ? "#10b981" : (isActive ? "#10b981" : "var(--bg-hover)"),
                          color: "white",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t px-2 py-3 space-y-0.5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => handleNav("notifications")}
            className="w-full flex items-center gap-3 px-3 rounded-lg transition-all"
            style={{ height: 38, color: active === "notifications" ? "#f59e0b" : "var(--text-3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.06)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <div className="relative shrink-0">
              <Bell size={16} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ background: "#ef4444" }}>
                  {notifications}
                </span>
              )}
            </div>
            {expanded && <span className="text-sm font-medium">Notifications</span>}
          </button>

          {!forceExpanded && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-3 px-3 rounded-lg transition-all"
              style={{ height: 38, color: "var(--text-4)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.06)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {expanded && <span className="text-sm">Collapse</span>}
            </button>
          )}

          {/* Security & Edge status footer */}
          {expanded && (
            <div className="mt-2 mx-1 p-2 rounded-lg border" style={{ background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Shield size={10} style={{ color: threatColor }} />
                <span className="text-[9px] font-mono font-bold uppercase" style={{ color: threatColor }}>
                  {threatLevel} threat
                </span>
                <span className="w-1.5 h-1.5 rounded-full ml-auto animate-live-pulse" style={{ background: "#10b981" }} />
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono" style={{ color: "var(--text-5)" }}>
                <Lock size={8} />
                <span className="truncate">NMEA / Satcom · TLS 1.3</span>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 border-r transition-all duration-300"
        style={{
          width: collapsed ? 64 : 224,
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <NavContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r lg:hidden animate-drawer-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <NavContent forceExpanded />
          </aside>
        </>
      )}
    </>
  );
}
