import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";

function CandidateRow({ candidate, index }) {
  const iconMap = {
    Sparkles: TrendingUp,
    AlertTriangle: AlertTriangle,
    CheckCircle: Brain,
  };
  const Icon = iconMap[candidate.icon] || Brain;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-border"
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: candidate.color + "22" }}>
        <Icon size={11} style={{ color: candidate.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono font-bold text-accent">{candidate.move}</div>
        <div className="flex gap-2 text-[9px] text-text-dim mt-0.5">
          <span>ΔxT {candidate.xt >= 0 ? "+" : ""}{candidate.xt}</span>
          <span>• {candidate.successProb}% succ</span>
          <span>• {candidate.pressure}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold font-mono" style={{ color: candidate.color }}>
          {candidate.symbol || "✓"}
        </div>
        <div className="text-[8px] text-text-dim">{candidate.grade}</div>
      </div>
    </motion.div>
  );
}

export default function MultiLineAnalysis({ candidates = [], selectedMove }) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden h-full">
      <div className="px-4 py-3 bg-surface-2 border-b border-border font-bold flex items-center gap-2 text-xs">
        <Brain size={14} className="text-accent" />
        Engine Lines
      </div>
      <div className="p-3">
        {candidates.length === 0 ? (
          <div className="text-text-dim text-xs text-center py-6">
            {selectedMove
              ? "Loading analysis…"
              : "Select an event to see candidate actions"}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-2">
              {candidates.map((c, i) => (
                <CandidateRow key={c.move} candidate={c} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
