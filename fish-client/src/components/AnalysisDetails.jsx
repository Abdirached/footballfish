import { Shield, Grid3X3, BarChart3, TrendingUp, Target, Layout, Minimize2, Maximize2 } from "lucide-react";

const METRIC_STYLE = "bg-surface-2 rounded-lg p-2.5 border border-border";

function DetailRow({ label, home, away, fmt }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-xs">
      <span className="text-text-dim text-[10px]">{label}</span>
      <div className="flex items-center gap-2 font-mono">
        <span className="text-accent">{fmt ? fmt(home) : home ?? "—"}</span>
        <span className="text-text-dim text-[9px]">vs</span>
        <span className="text-red-400">{fmt ? fmt(away) : away ?? "—"}</span>
      </div>
    </div>
  );
}

function ShapeDetails({ jdp, match }) {
  const s = jdp?.shape || {};
  const homeS = s.home || {};
  const awayS = s.away || {};

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield size={13} className="text-accent" />
        <span className="text-xs font-bold">Shape &amp; Structure</span>
      </div>

      <div className={METRIC_STYLE}>
        <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Detected Formation</div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-accent">{match?.home}: {homeS.formation || "?"}</span>
          <span className="text-red-400">{match?.away}: {awayS.formation || "?"}</span>
        </div>
      </div>

      <div className={METRIC_STYLE}>
        <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Compactness (lower = more compact)</div>
        <DetailRow label="Std Dev from Centroid" home={homeS.compactness} away={awayS.compactness} fmt={(v) => typeof v === "number" ? v.toFixed(2) : v} />
      </div>

      {homeS.stretch && (
        <div className={METRIC_STYLE}>
          <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Stretch</div>
          <DetailRow label="Vertical" home={homeS.stretch?.vertical} away={awayS.stretch?.vertical} fmt={(v) => typeof v === "number" ? v.toFixed(2) : v} />
          <DetailRow label="Horizontal" home={homeS.stretch?.horizontal} away={awayS.stretch?.horizontal} fmt={(v) => typeof v === "number" ? v.toFixed(2) : v} />
        </div>
      )}

      {homeS.line_distances?.length > 0 && (
        <div className={METRIC_STYLE}>
          <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Line Distances</div>
          <div className="text-[9px] text-text-dim mb-1">Gap between team lines (avg Y)</div>
          {homeS.line_distances.map((line, i) => (
            <DetailRow
              key={i}
              label={`${line.phase} phase`}
              home={line.avg_y}
              away={awayS.line_distances?.[i]?.avg_y}
              fmt={(v) => typeof v === "number" ? v.toFixed(1) : v}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ZonesDetails({ jdp, match }) {
  const z = jdp?.zones || {};
  const homeZ = z.home || {};
  const awayZ = z.away || {};

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Grid3X3 size={13} className="text-accent" />
        <span className="text-xs font-bold">Zonal Occupation</span>
      </div>

      <div className={METRIC_STYLE}>
        <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Key Metrics</div>
        <DetailRow label="Half-Space %" home={homeZ.halfspace_pct} away={awayZ.halfspace_pct} fmt={(v) => typeof v === "number" ? `${v}%` : v} />
        <DetailRow label="Wing %" home={homeZ.wing_pct} away={awayZ.wing_pct} fmt={(v) => typeof v === "number" ? `${v}%` : v} />
        <DetailRow label="Central %" home={homeZ.central_pct} away={awayZ.central_pct} fmt={(v) => typeof v === "number" ? `${v}%` : v} />
        <DetailRow label="Zone 14 Entries" home={homeZ.zone14_entries} away={awayZ.zone14_entries} />
      </div>

      <div className={METRIC_STYLE}>
        <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Attacking Shape</div>
        <DetailRow label="Width (attack)" home={homeZ.width_attack} away={awayZ.width_attack} fmt={(v) => typeof v === "number" ? v.toFixed(2) : v} />
        <DetailRow label="Depth (attack)" home={homeZ.depth_attack} away={awayZ.depth_attack} fmt={(v) => typeof v === "number" ? v.toFixed(2) : v} />
      </div>

      {homeZ.per_phase_volume && (
        <div className={METRIC_STYLE}>
          <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Phase Volume</div>
          {["buildup", "midfield", "attacking"].map((phase) => (
            <DetailRow
              key={phase}
              label={phase}
              home={homeZ.per_phase_volume?.[phase]}
              away={awayZ.per_phase_volume?.[phase]}
              fmt={(v) => typeof v === "number" ? `${v}%` : v}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SuperiorityDetails({ jdp, match }) {
  const sup = jdp?.superiority || {};
  const moments = sup.moments || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 size={13} className="text-accent" />
        <span className="text-xs font-bold">Superiorities</span>
      </div>

      <div className={METRIC_STYLE}>
        <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Overview</div>
        <DetailRow label="Avg Home Players" home={sup.avg_superiority?.home} away={sup.avg_superiority?.away} fmt={(v) => typeof v === "number" ? v.toFixed(1) : v} />
        <DetailRow label="Triangles" home={sup.triangles?.home} away={sup.triangles?.away} />
        <div className="flex justify-between items-center py-1.5 text-xs">
          <span className="text-text-dim text-[10px]">Total Superiority Moments</span>
          <span className="font-mono text-accent">{sup.total_superiority_moments ?? "—"}</span>
        </div>
      </div>

      {moments.length > 0 && (
        <div className={METRIC_STYLE}>
          <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold mb-1.5">Superiority Moments</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {moments.slice(0, 20).map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border last:border-0 text-[10px]">
                <span className="font-mono text-text-dim">{m.minute}&apos;</span>
                <span className="font-mono text-text-dim">{m.zone}</span>
                <span className={`font-mono font-bold ${m.advantage === "HOME" ? "text-accent" : "text-red-400"}`}>
                  {m.home_players}:{m.away_players}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {moments.length === 0 && (
        <div className="text-[10px] text-text-dim text-center py-4">
          360 frame data provides the best superiority analysis. Select a match with 360&deg; data for detailed superiority moments.
        </div>
      )}
    </div>
  );
}

export default function AnalysisDetails({ jdp, selectedAdvice, match }) {
  if (!jdp) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <BarChart3 size={24} className="text-text-dim" />
        <div className="text-xs text-text-dim text-center max-w-xs">
          No analysis data loaded. Select a match and wait for the engine to process.
        </div>
      </div>
    );
  }

  const adviceType = selectedAdvice?.type || null;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col h-full">
      <div className="px-[18px] py-3.5 bg-surface-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Target size={15} className="text-accent" />
          <span>Analysis Details</span>
        </div>
        {selectedAdvice && (
          <div className="text-[9px] text-text-dim mt-1 capitalize">
            Showing data for: {selectedAdvice.type} — {selectedAdvice.priority} priority
          </div>
        )}
        {!selectedAdvice && (
          <div className="text-[9px] text-text-dim mt-1">
            Click an advice item to see detailed supporting data
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {(!adviceType || adviceType === "shape") && <ShapeDetails jdp={jdp} match={match} />}
        {(!adviceType || adviceType === "zones") && <ZonesDetails jdp={jdp} match={match} />}
        {(!adviceType || adviceType === "superiority") && <SuperiorityDetails jdp={jdp} match={match} />}
      </div>
    </div>
  );
}
