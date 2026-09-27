import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Info, Target, Shield, Grid3X3, BarChart3 } from "lucide-react";

const PRIORITY_CONFIG = {
  high: { icon: AlertTriangle, color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)", label: "High Priority" },
  medium: { icon: Target, color: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.3)", label: "Medium Priority" },
  low: { icon: Info, color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.3)", label: "Low Priority" },
};

const TYPE_LABEL = {
  shape: "Shape & Structure",
  zones: "Zonal Occupation",
  superiority: "Superiorities",
};

const TYPE_ICON = {
  shape: Shield,
  zones: Grid3X3,
  superiority: BarChart3,
};

function AdviceCard({ item, index, selected, onSelect }) {
  const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;
  const PriorityIcon = cfg.icon;
  const TypeIcon = TYPE_ICON[item.type] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onSelect?.(item)}
      className="rounded-lg p-3 cursor-pointer transition-all duration-200"
      style={{
        border: `1px solid ${selected ? cfg.color : cfg.border}`,
        backgroundColor: selected ? cfg.bg : "transparent",
        borderLeft: `3px solid ${cfg.color}`,
        boxShadow: selected ? `0 0 24px ${cfg.color}18` : "none",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${cfg.color}15` }}>
          <TypeIcon size={13} style={{ color: cfg.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
              {TYPE_LABEL[item.type] || item.type}
            </span>
            {item.zone && (
              <span className="text-[9px] font-mono text-text-dim bg-border px-1.5 py-0.5 rounded">{item.zone}</span>
            )}
          </div>
          <div className="text-xs leading-relaxed text-[#ccc]">{item.message}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <PriorityIcon size={10} style={{ color: cfg.color }} />
            <span className="text-[8px] uppercase font-bold tracking-wider" style={{ color: cfg.color }}>
              {item.priority} priority
            </span>
          </div>
        </div>
        {selected && (
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
        )}
      </div>
    </motion.div>
  );
}

export default function AdvicePanel({ advice, loading, selectedAdvice, onSelectAdvice }) {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-text-dim">Analyzing positional play...</div>
      </div>
    );
  }

  if (!advice?.length) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <Lightbulb size={24} className="text-text-dim" />
        <div className="text-xs text-text-dim text-center max-w-xs">
          No positional advice generated yet. Select a match and run the JdP analysis to see coaching recommendations.
        </div>
      </div>
    );
  }

  const grouped = { high: [], medium: [], low: [] };
  for (const a of advice) {
    if (a.priority === "high") grouped.high.push(a);
    else if (a.priority === "medium") grouped.medium.push(a);
    else grouped.low.push(a);
  }

  const counts = { high: grouped.high.length, medium: grouped.medium.length, low: grouped.low.length, total: advice.length };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col h-full">
      <div className="px-[18px] py-3.5 bg-surface-2 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Lightbulb size={16} className="text-accent" />
            Engine Analysis &amp; Advice
          </span>
          <span className="text-[10px] text-text-dim">{counts.total} items</span>
        </div>
        <div className="flex gap-1.5 text-[10px]">
          {counts.high > 0 && (
            <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded">{counts.high} high</span>
          )}
          {counts.medium > 0 && (
            <span className="text-accent font-bold bg-accent/10 px-2 py-0.5 rounded">{counts.medium} med</span>
          )}
          {counts.low > 0 && (
            <span className="text-gray-400 font-bold bg-gray-400/10 px-2 py-0.5 rounded">{counts.low} low</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {["high", "medium", "low"].map((priority) => {
          const items = grouped[priority];
          if (!items.length) return null;
          const cfg = PRIORITY_CONFIG[priority];
          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-surface z-10 py-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <span className="text-[9px] text-text-dim">({items.length})</span>
              </div>
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <AdviceCard
                    key={`${i}`}
                    item={item}
                    index={i}
                    selected={selectedAdvice === item}
                    onSelect={(adv) => onSelectAdvice?.(selectedAdvice === adv ? null : adv)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
