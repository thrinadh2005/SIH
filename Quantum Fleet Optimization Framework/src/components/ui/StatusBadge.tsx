interface Props {
  status: string;
  size?: "sm" | "md";
}

const configs: Record<string, { label: string; bg: string; color: string; dot?: string }> = {
  normal:       { label: "Normal",     bg: "rgba(16,185,129,0.12)", color: "#10b981", dot: "#10b981" },
  optimized:    { label: "Optimized",  bg: "rgba(16,185,129,0.12)", color: "#10b981", dot: "#10b981" },
  "at-risk":    { label: "At Risk",    bg: "rgba(239,68,68,0.12)",  color: "#ef4444", dot: "#ef4444" },
  "optimization-running": { label: "Optimizing…", bg: "rgba(124,58,237,0.12)", color: "#a78bfa", dot: "#7c3aed" },
  running:      { label: "Running",    bg: "rgba(124,58,237,0.12)", color: "#a78bfa", dot: "#7c3aed" },
  active:       { label: "Active",     bg: "rgba(6,182,212,0.12)",  color: "#06b6d4", dot: "#06b6d4" },
  completed:    { label: "Completed",  bg: "rgba(16,185,129,0.12)", color: "#10b981", dot: "#10b981" },
  scheduled:    { label: "Scheduled",  bg: "rgba(100,116,139,0.12)",color: "#94a3b8", dot: "#64748b" },
  stale:        { label: "Stale",      bg: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b" },
  offline:      { label: "Offline",    bg: "rgba(100,116,139,0.12)",color: "#64748b", dot: "#64748b" },
  healthy:      { label: "Healthy",    bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  degraded:     { label: "Degraded",   bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  warning:      { label: "Warning",    bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  critical:     { label: "Critical",   bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
  info:         { label: "Info",       bg: "rgba(6,182,212,0.12)",  color: "#06b6d4" },
  pass:         { label: "PASS",       bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  fail:         { label: "FAIL",       bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
  A: { label: "A", bg: "rgba(16,185,129,0.15)",  color: "#10b981" },
  B: { label: "B", bg: "rgba(34,197,94,0.13)",   color: "#16a34a" },
  C: { label: "C", bg: "rgba(245,158,11,0.13)",  color: "#d97706" },
  D: { label: "D", bg: "rgba(249,115,22,0.13)",  color: "#ea580c" },
  E: { label: "E", bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

export default function StatusBadge({ status, size = "md" }: Props) {
  const cfg = configs[status] || { label: status, bg: "rgba(100,116,139,0.12)", color: "#94a3b8" };
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-semibold uppercase tracking-wide ${pad}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label}
    </span>
  );
}

export function CIIBadge({ grade }: { grade: string }) {
  const cfg = configs[grade] || configs.C;
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-display font-bold text-base"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}35` }}
    >
      {grade}
    </span>
  );
}
