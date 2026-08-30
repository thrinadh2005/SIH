import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral" | { value: number; direction: "up" | "down" | "neutral" };
  trendPositive?: boolean;
  accent?: string;
  color?: string;
  icon?: any;
  loading?: boolean;
  sub?: string;
}

export default function KPICard({
  label, value, unit, change, changeLabel, trend = "neutral",
  trendPositive = true, accent, color, icon, loading, sub,
}: Props) {
  const cardAccent = accent || color || "#10b981";

  // Normalize trend & change
  let trendDir: "up" | "down" | "neutral" = "neutral";
  let changeVal: number | undefined = change;

  if (typeof trend === "object" && trend !== null) {
    trendDir = trend.direction;
    changeVal = trend.value;
  } else if (typeof trend === "string") {
    trendDir = trend;
  }

  const trendColor =
    trendDir === "neutral" ? "var(--text-3)"
    : (trendDir === "up") === trendPositive ? "#10b981"
    : "#ef4444";

  const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : Minus;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon;
      return <IconComponent size={16} />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="skeleton h-3 w-24 mb-3 rounded" />
        <div className="skeleton h-8 w-20 mb-2 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-2 transition-all duration-150 cursor-default"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = cardAccent + "60"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
          {label}
        </span>
        {icon && <div style={{ color: cardAccent }}>{renderIcon()}</div>}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-display font-bold font-mono-data leading-none" style={{ fontSize: 26, color: "var(--text-1)" }}>
          {value}
        </span>
        {unit && <span className="text-sm mb-0.5 font-medium" style={{ color: "var(--text-3)" }}>{unit}</span>}
      </div>
      {sub && <p className="text-xs" style={{ color: "var(--text-4)" }}>{sub}</p>}
      {changeVal !== undefined && (
        <div className="flex items-center gap-1">
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span className="text-xs font-mono-data font-medium" style={{ color: trendColor }}>
            {trendDir === "up" ? "+" : trendDir === "down" ? "−" : ""}{Math.abs(changeVal)}%
          </span>
          {changeLabel && <span className="text-xs" style={{ color: "var(--text-4)" }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
