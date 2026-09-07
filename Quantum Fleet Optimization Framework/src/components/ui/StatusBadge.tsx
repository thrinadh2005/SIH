interface Props {
  status: string
  size?: "sm" | "md"
}

interface BadgeStyle {
  label: string
  className: string
  dotClass?: string
}

const statusMap: Record<string, BadgeStyle> = {
  normal: {
    label: "Normal",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  optimized: {
    label: "Optimized",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  "at-risk": {
    label: "At Risk",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    dotClass: "bg-rose-500",
  },
  "optimization-running": {
    label: "Optimizing…",
    className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
    dotClass: "bg-purple-500",
  },
  running: {
    label: "Running",
    className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
    dotClass: "bg-purple-500",
  },
  active: {
    label: "Active",
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
    dotClass: "bg-sky-500",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30",
    dotClass: "bg-slate-400",
  },
  stale: {
    label: "Stale",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  offline: {
    label: "Offline",
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30",
    dotClass: "bg-slate-400",
  },
  healthy: {
    label: "Healthy",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  degraded: {
    label: "Degraded",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  warning: {
    label: "Warning",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  critical: {
    label: "Critical",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    dotClass: "bg-rose-500",
  },
  info: {
    label: "Info",
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
    dotClass: "bg-sky-500",
  },
  pass: {
    label: "PASS",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  fail: {
    label: "FAIL",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    dotClass: "bg-rose-500",
  },
}

export default function StatusBadge({ status, size = "md" }: Props) {
  const cfg = statusMap[status] || {
    label: status,
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30",
    dotClass: "bg-slate-400",
  }
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-bold uppercase tracking-wider ${cfg.className} ${pad}`}
    >
      {cfg.dotClass && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      )}
      {cfg.label}
    </span>
  )
}

const ciiGradeStyles: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
  B: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40",
  C: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40",
  D: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/40",
  E: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40",
}

export function CIIBadge({ grade }: { grade: string }) {
  const style = ciiGradeStyles[grade] || ciiGradeStyles.C

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-display font-bold text-base border shadow-xs ${style}`}
    >
      {grade}
    </span>
  )
}
