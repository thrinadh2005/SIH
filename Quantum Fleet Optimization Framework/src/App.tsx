import { useState } from "react";
import {
  LayoutDashboard, Globe2, Navigation, Ship, Leaf, BarChart3, FileCheck2, DollarSign, Users, Radio
} from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Overview from "./screens/Overview";
import CommandCenter from "./screens/CommandCenter";
import VoyageOptimizer from "./screens/VoyageOptimizer";
import OptimizationConsole from "./screens/OptimizationConsole";
import OptimizationResults from "./screens/OptimizationResults";
import BenchmarkArena from "./screens/BenchmarkArena";
import FuelSandbox from "./screens/FuelSandbox";
import CIICompliance from "./screens/CIICompliance";
import FleetManagement from "./screens/FleetManagement";
import Reports from "./screens/Reports";
import CommercialEconomics from "./screens/CommercialEconomics";
import SwarmConvoyScreen from "./screens/SwarmConvoyScreen";
import EdgeGatewayScreen from "./screens/EdgeGatewayScreen";

type Page =
  | "overview" | "command" | "optimizer" | "console" | "results"
  | "fleet" | "commercial" | "swarm" | "edge" | "fuel" | "benchmark" | "compliance"
  | "notifications" | "health" | "settings";

const mobileNavItems = [
  { id: "overview",   label: "Overview",   icon: LayoutDashboard },
  { id: "command",    label: "Map",        icon: Globe2 },
  { id: "optimizer",  label: "Optimize",   icon: Navigation },
  { id: "commercial", label: "Commercial", icon: DollarSign },
  { id: "compliance", label: "Reports",    icon: FileCheck2 },
];

export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (id: string) => {
    setPage(id as Page);
    setMobileMenuOpen(false);
  };

  const renderScreen = () => {
    switch (page) {
      case "overview":       return <Overview onNavigate={navigate} />;
      case "command":        return <CommandCenter onNavigate={navigate} />;
      case "optimizer":      return <VoyageOptimizer onNavigate={navigate} />;
      case "console":        return <OptimizationConsole onNavigate={navigate} />;
      case "results":        return <OptimizationResults onNavigate={navigate} />;
      case "fleet":          return <FleetManagement onNavigate={navigate} />;
      case "commercial":     return <CommercialEconomics onNavigate={navigate} />;
      case "swarm":          return <SwarmConvoyScreen onNavigate={navigate} />;
      case "edge":           return <EdgeGatewayScreen onNavigate={navigate} />;
      case "fuel":           return <FuelSandbox onNavigate={navigate} />;
      case "benchmark":      return <BenchmarkArena />;
      case "compliance":     return <CIICompliance onNavigate={navigate} />;
      case "notifications":
      case "health":
      case "settings":       return <Reports onNavigate={navigate} />;
      default:               return <Overview onNavigate={navigate} />;
    }
  };

  const navPage = ["console", "results"].includes(page) ? "optimizer" : page;

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Main row: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          active={navPage}
          onNavigate={navigate}
          notifications={2}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            activePage={page}
            onNavigate={navigate}
            onMenuOpen={() => setMobileMenuOpen(true)}
          />
          {/* Screen area — bottom padding on mobile for tab bar */}
          <main className="flex-1 min-h-0 overflow-hidden pb-0 lg:pb-0"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
            <div className="h-full pb-14 lg:pb-0 overflow-auto">
              {renderScreen()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden border-t mobile-nav-safe"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = navPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all"
              style={{ color: isActive ? "#10b981" : "var(--text-4)" }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ background: "#10b981" }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
