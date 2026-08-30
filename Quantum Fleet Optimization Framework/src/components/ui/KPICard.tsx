import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  trendPositive?: boolean;
  accent?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  sub?: string;
}

export default function KPICard({
  label, value, unit, change, changeLabel, trend = "neutral",
  trendPositive = true, accent = "#10b981", icon, loading, sub,
}: Props) {
  const trendColor =
    trend === "neutral" ? "var(--text-3)"
    : (trend === "up") === trendPositive ? "#10b981"
    : "#ef4444";

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

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
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent + "60"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
          {label}
        </span>
        {icon && <div style={{ color: accent }}>{icon}</div>}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-display font-bold font-mono-data leading-none" style={{ fontSize: 26, color: "var(--text-1)" }}>
          {value}
        </span>
        {unit && <span className="text-sm mb-0.5 font-medium" style={{ color: "var(--text-3)" }}>{unit}</span>}
      </div>
      {sub && <p className="text-xs" style={{ color: "var(--text-4)" }}>{sub}</p>}
      {change !== undefined && (
        <div className="flex items-center gap-1">
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span className="text-xs font-mono-data font-medium" style={{ color: trendColor }}>
            {change > 0 ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-xs" style={{ color: "var(--text-4)" }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
