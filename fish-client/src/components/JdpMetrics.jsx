import { BarChart3, Shield, Grid3X3, TrendingUp, Trophy, Users, Crosshair, Layout } from "lucide-react";

const METRIC_STYLE = "bg-surface-2 rounded-lg p-2.5 border border-border";

export default function JdpMetrics({ jdp, matchMeta }) {
  if (!jdp) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <BarChart3 size={24} className="text-text-dim" />
        <div className="text-xs text-text-dim text-center max-w-xs">
          No match data loaded. Select a match to begin analysis.
        </div>
      </div>
    );
  }

  const shape = jdp.shape || {};
  const zones = jdp.zones || {};
  const superiority = jdp.superiority || {};
  const homeZ = zones.home || {};
  const awayZ = zones.away || {};
  const homeS = shape.home || {};
  const awayS = shape.away || {};
  const match = jdp.match || {};

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col h-full">
      <div className="px-[18px] py-3.5 bg-surface-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold mb-1">
          <Trophy size={15} className="text-accent" />
          <span>Match Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-accent">{match.home || matchMeta?.home || "?"}</span>
          <span className="text-[9px] text-text-dim">vs</span>
          <span className="text-xs font-bold text-red-400">{match.away || matchMeta?.away || "?"}</span>
          {jdp.has_360 && (
            <span className="bg-green-900/40 text-green-400 text-[8px] px-1.5 py-0.5 rounded-full border border-green-800 font-bold ml-1">
              360&deg;
            </span>
          )}
        </div>
        <div className="text-[9px] text-text-dim mt-0.5">{match.competition || matchMeta?.competition || ""}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {match.home_formation && (
          <div className={METRIC_STYLE}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={11} className="text-accent" />
              <span className="text-[9px] uppercase tracking-wider text-text-dim font-bold">Formations</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-accent">{match.home}: {match.home_formation}</span>
              <span className="text-red-400">{match.away}: {match.away_formation || "?"}</span>
            </div>
          </div>
        )}

        <div className={METRIC_STYLE}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield size={11} className="text-accent" />
            <span className="text-[9px] uppercase tracking-wider text-text-dim font-bold">Compactness</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-accent">{typeof homeS.compactness === "number" ? homeS.compactness.toFixed(2) : "—"}</span>
            <span className="text-red-400">{typeof awayS.compactness === "number" ? awayS.compactness.toFixed(2) : "—"}</span>
          </div>
        </div>

        <div className={METRIC_STYLE}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Grid3X3 size={11} className="text-accent" />
            <span className="text-[9px] uppercase tracking-wider text-text-dim font-bold">Zonal Control</span>
          </div>
          <div className="space-y-1">
            {[
              { label: "Half-Space %", home: homeZ.halfspace_pct, away: awayZ.halfspace_pct, fmt: (v) => `${v}%` },
              { label: "Zone 14 Entries", home: homeZ.zone14_entries, away: awayZ.zone14_entries },
              { label: "Width (attack)", home: homeZ.width_attack, away: awayZ.width_attack, fmt: (v) => v?.toFixed(2) },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between text-[10px]">
                <span className="text-text-dim">{m.label}</span>
                <div className="font-mono">
                  <span className="text-accent">{m.home != null ? (m.fmt ? m.fmt(m.home) : m.home) : "—"}</span>
                  <span className="text-text-dim mx-1">vs</span>
                  <span className="text-red-400">{m.away != null ? (m.fmt ? m.fmt(m.away) : m.away) : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {homeZ.per_phase_volume && (
          <div className={METRIC_STYLE}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layout size={11} className="text-accent" />
              <span className="text-[9px] uppercase tracking-wider text-text-dim font-bold">Phase Volume</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["buildup", "midfield", "attacking"].map((phase) => {
                const h = homeZ.per_phase_volume?.[phase] ?? 0;
                const a = awayZ.per_phase_volume?.[phase] ?? 0;
                return (
                  <div key={phase} className="text-center">
                    <div className="text-[7px] uppercase text-text-dim">{phase}</div>
                    <div className="text-[10px] font-mono mt-0.5">
                      <span className="text-accent">{h}%</span>
                      <span className="text-text-dim mx-0.5">/</span>
                      <span className="text-red-400">{a}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={METRIC_STYLE}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp size={11} className="text-accent" />
            <span className="text-[9px] uppercase tracking-wider text-text-dim font-bold">Superiority</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-dim">Avg Numerical</span>
              <div className="font-mono">
                <span className="text-accent">{superiority.avg_superiority?.home?.toFixed(1) ?? "—"}</span>
                <span className="text-text-dim mx-1">vs</span>
                <span className="text-red-400">{superiority.avg_superiority?.away?.toFixed(1) ?? "—"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-dim">Triangles</span>
              <div className="font-mono">
                <span className="text-accent">{superiority.triangles?.home ?? "—"}</span>
                <span className="text-text-dim mx-1">vs</span>
                <span className="text-red-400">{superiority.triangles?.away ?? "—"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-dim">Superiority Moments</span>
              <span className="font-mono text-accent">{superiority.total_superiority_moments ?? "—"}</span>
            </div>
          </div>
        </div>

        {(jdp.total_events || jdp.total_events_with_ff) && (
          <div className={METRIC_STYLE}>
            <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1">Analysis Stats</div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-text-dim">Events Analyzed</span>
                <span className="font-mono text-accent">{jdp.total_events}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">With 360 Frames</span>
                <span className="font-mono text-accent">{jdp.total_events_with_ff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Advice Items</span>
                <span className="font-mono text-accent">{jdp.advice?.length || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
