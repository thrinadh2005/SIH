import React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Props {
  label: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral" | {
    value: number
    direction: "up" | "down" | "neutral"
  }
  trendPositive?: boolean
  accent?: string
  color?: string
  icon?: any
  loading?: boolean
  sub?: string
}

export default function KPICard({
  label,
  value,
  unit,
  change,
  changeLabel,
  trend = "neutral",
  trendPositive = true,
  accent,
  color,
  icon,
  loading,
  sub,
}: Props) {
  const cardAccent = accent || color || "#059669"

  let trendDir: "up" | "down" | "neutral" = "neutral"
  let changeVal: number | undefined = change

  if (typeof trend === "object" && trend !== null) {
    trendDir = trend.direction
    changeVal = trend.value
  } else if (typeof trend === "string") {
    trendDir = trend
  }

  const isGood = (trendDir === "up") === trendPositive
  const trendBg =
    trendDir === "neutral"
      ? "bg-slate-500/15 text-slate-700 dark:text-slate-300"
      : isGood
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
        : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"

  const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : Minus

  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) return icon
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon
      return <IconComponent size={20} />
    }
    return null
  }

  if (loading) {
    return (
      <div
        className="rounded-lg p-5 border animate-pulse"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="h-4 w-28 mb-3 rounded bg-slate-400/20" />
        <div className="h-9 w-36 mb-2 rounded bg-slate-400/20" />
        <div className="h-4 w-24 rounded bg-slate-400/20" />
      </div>
    )
  }

  return (
    <div
      className="panel-solid p-5 flex flex-col justify-between gap-3.5 transition-all hover:border-[var(--border-active)]"
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs sm:text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--text-3)" }}
        >
          {label}
        </span>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shadow-2xs"
            style={{ background: `${cardAccent}18`, color: cardAccent }}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span
            className="font-display font-bold font-mono-data tracking-tight text-2xl sm:text-3xl lg:text-4xl"
            style={{ color: "var(--text-1)" }}
          >
            {value}
          </span>
          {unit && (
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-3)" }}
            >
              {unit}
            </span>
          )}
        </div>

        {sub && (
          <p className="text-xs sm:text-sm mt-1.5 font-medium" style={{ color: "var(--text-3)" }}>
            {sub}
          </p>
        )}
      </div>

      {changeVal !== undefined && (
        <div className="flex items-center gap-2 pt-2.5 border-t" style={{ borderColor: "var(--border-sub)" }}>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold ${trendBg}`}>
            <TrendIcon size={13} />
            {trendDir === "up" ? "+" : trendDir === "down" ? "−" : ""}
            {Math.abs(changeVal)}%
          </span>
          {changeLabel && (
            <span className="text-xs font-medium" style={{ color: "var(--text-4)" }}>
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
