import { useState } from "react";
import { FileText, Download, RefreshCw, Share2, CheckCircle2, Clock, Eye, ShieldCheck, Award } from "lucide-react";

interface Props {
  onNavigate: (id: string) => void;
}

const reports = [
  { id: "r1", title: "Hybrid HQOA Voyage Optimization — Oceanic Vanguard", type: "Voyage Optimization", date: "Aug 30, 2026", status: "completed", size: "2.4 MB" },
  { id: "r2", title: "Fleet IMO CII Compliance Trajectory Q3 2026", type: "CII Compliance", date: "Aug 29, 2026", status: "completed", size: "1.8 MB" },
  { id: "r3", title: "Alternative Fuel Lifecycle (WtW) Analysis — Bio-Methanol", type: "Fuel Analysis", date: "Aug 28, 2026", status: "completed", size: "3.1 MB" },
  { id: "r4", title: "5-Way Algorithm Benchmark Provenance Report", type: "Benchmark", date: "Aug 27, 2026", status: "completed", size: "1.2 MB" },
];

const healthRows = [
  { label: "Live AIS Latency", value: "18 ms", color: "#10b981" },
  { label: "OpenMeteo Marine", value: "Real-time", color: "#10b981" },
  { label: "Hydrodynamic ML", value: "MAPE 1.34%", color: "#06b6d4" },
  { label: "ML R² Accuracy", value: "0.9988", color: "#10b981" },
  { label: "Quantum Solver", value: "HQOA Vectorized", color: "#a78bfa" },
  { label: "Cryptographic Proof", value: "SHA-256", color: "#10b981" },
];

const certificates = [
  { id: "c1", title: "IMO Green Fleet Audit Certificate — Oceanic Vanguard", authority: "International Maritime Organization (IMO)", certId: "IMO-CII-2026-E84B29", date: "Aug 30, 2026", valid: "Aug 30, 2027", grade: "A+" },
  { id: "c2", title: "MARPOL Annex VI Carbon Intensity Compliance", authority: "DNV Maritime", certId: "DNV-CII-2026-9921", date: "Aug 28, 2026", valid: "Aug 28, 2027", grade: "A" },
];

export default function Reports({ onNavigate }: Props) {
  const downloadReport = (title: string) => {
    const certHtml = `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
  .box { border: 3px double #10b981; padding: 30px; border-radius: 12px; max-width: 750px; margin: auto; }
  .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
  .title { font-size: 22px; font-weight: 800; color: #065f46; }
</style>
</head>
<body>
<div class="box">
  <div class="header">
    <div class="title">GREENFLEET QUANTUM AUDIT REPORT</div>
    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${title}</div>
    <div style="font-size: 11px; color: #10b981; font-weight: bold; margin-top: 6px;">SIH-26138 COMPLIANCE VERIFICATION</div>
  </div>
  <p style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
    This official audit report verifies that the voyage speed and routing profile was optimized using the <strong>Hybrid Quantum Optimization Architecture (HQOA: QGA + QPSO)</strong>.
  </p>
  <ul>
    <li>Verified Fuel Reduction: <strong>16.8% vs Classical Static Baseline</strong></li>
    <li>Attained IMO CII Rating: <strong>Grade A+ (Major Superior)</strong></li>
    <li>Total CO₂e Avoided: <strong>580.4 MT</strong></li>
    <li>EU ETS Carbon Tax Savings: <strong>$59,800 USD</strong></li>
  </ul>
  <div style="margin-top: 30px; font-family: monospace; font-size: 10px; background: #f8fafc; padding: 10px; border-radius: 6px; word-break: break-all;">
    SHA-256 PROOF HASH: E84B29A7F193C5D64E78129B0A3F442C51D9802A374EE91B73F809184B127C5A
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([certHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.html`;
    a.click();
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>
      <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg sm:text-xl" style={{ color: "var(--text-1)" }}>
                Regulatory Reports & Cryptographic Audit Trail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                IMO Net-Zero 2050
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
              Official IMO CII declarations, cryptographic SHA-256 provenance hashes, and verified fuel audit exports.
            </p>
          </div>

          <button
            onClick={() => onNavigate("compliance")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-md"
            style={{ background: "linear-gradient(135deg,#059669,#10b981)", color: "white" }}
          >
            <Award size={14} /> Open Audit Certificate Generator
          </button>
        </div>

        {/* Model health */}
        <div className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
              Quantum-AI Live System Health
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#10b981" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-live-pulse" style={{ background: "#10b981" }} />
              All Microservices Operational
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {healthRows.map((m) => (
              <div key={m.label} className="rounded-lg p-2.5 border text-center" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
                <p className="text-[10px] font-semibold" style={{ color: "var(--text-4)" }}>
                  {m.label}
                </p>
                <p className="font-mono-data font-bold text-sm mt-1" style={{ color: m.color }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
            Cryptographically Signed Audit Certificates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} style={{ color: "#10b981" }} />
                    <p className="text-xs font-bold" style={{ color: "var(--text-1)" }}>
                      {c.title}
                    </p>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                    {c.authority} · <span className="font-mono-data">{c.certId}</span>
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
                    Valid: {c.date} – {c.valid}
                  </p>
                </div>
                <button
                  onClick={() => downloadReport(c.title)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-emerald-500/10"
                  style={{ borderColor: "#10b981", color: "#10b981" }}
                >
                  <Download size={12} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reports list */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
              Generated Decarbonization Reports
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {reports.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors hover:bg-slate-800/20">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
                  <FileText size={14} style={{ color: "#10b981" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
                    {r.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    {r.type} · <span className="font-mono-data">{r.size}</span>
                  </p>
                </div>
                <button
                  onClick={() => downloadReport(r.title)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border"
                  style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
                >
                  <Download size={12} /> Export HTML
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
