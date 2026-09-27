import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trophy } from "lucide-react";
import EvalBadge from "./EvalBadge.jsx";

function Metric({ label, value, accent }) {
  return (
    <div className="bg-surface-2 rounded-lg p-2.5 border border-border">
      <div className="text-[9px] uppercase tracking-wider text-text-dim font-bold">
        {label}
      </div>
      <div
        className="text-lg font-extrabold font-mono mt-1"
        style={{ color: accent }}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function InsightPanel({ event, advantage }) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-[18px] py-3.5 bg-surface-2 border-b border-border font-bold flex justify-between items-center text-xs">
        <span className="flex items-center gap-2">
          <TrendingUp size={15} className="text-accent" />
          Engine Analysis
        </span>
        {event?.grade && <EvalBadge {...event.grade} />}
      </div>

      <AnimatePresence mode="wait">
        {!event ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 text-text-dim text-xs"
          >
            Select an event from the notation log to view engine analysis.
          </motion.div>
        ) : (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <div className="flex justify-between items-center pb-3.5 border-b border-border">
              <div>
                <div className="text-base font-bold text-white">{event.player}</div>
                <div className="text-[11px] text-text-dim uppercase tracking-wide mt-0.5">
                  {event.type}
                </div>
              </div>
              <div className="text-xl font-black font-mono text-accent">
                {event.move}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <Metric label="Δ Expected Threat" value={event.metrics?.xT} accent="#facc15" />
              <Metric label="Defensive Pressure" value={event.metrics?.pressure} accent="#f87171" />
              <Metric label="Pass Success" value={event.metrics?.successProb} accent="#10b981" />
              <Metric label="Advantage" value={event.advantage ?? advantage} accent="#facc15" />
            </div>

            {event.insight && (
              <div className="mt-3.5 p-3 bg-surface-2 rounded-lg border-l-3 border-l-accent">
                <div className="text-[9px] uppercase tracking-wider text-accent font-extrabold mb-1.5">
                  ENGINE INSIGHT
                </div>
                <div className="text-xs leading-relaxed text-[#ccc]">
                  {event.insight}
                </div>
              </div>
            )}

            <div className="mt-3.5">
              <div className="flex justify-between text-[10px] text-text-dim mb-1 font-mono">
                <span>BLACK</span>
                <span className="flex items-center gap-1">
                  <Trophy size={10} className="text-accent" />
                  TERRITORIAL ADVANTAGE
                </span>
                <span>WHITE</span>
              </div>
              <div className="h-1.5 bg-border rounded overflow-hidden">
                <motion.div
                  className="h-full rounded"
                  animate={{ width: `${advantage}%` }}
                  transition={{ type: "spring", stiffness: 60, damping: 20 }}
                  style={{
                    background: "linear-gradient(90deg, #1a1a1a, #facc15)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
