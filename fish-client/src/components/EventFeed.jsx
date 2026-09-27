import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import EvalBadge from "./EvalBadge.jsx";

export default function EventFeed({ graded, selectedIdx, onSelect, loading }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (selectedIdx !== null && listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIdx]);

  return (
    <div className="bg-surface rounded-xl border border-border flex flex-col h-[75vh] overflow-hidden">
      <div className="px-[18px] py-3.5 bg-surface-2 border-b border-border font-bold flex justify-between items-center text-xs">
        <span className="flex items-center gap-2">
          <Activity size={15} className="text-accent" />
          Match Notation Log
        </span>
        <span className="text-[11px] text-text-dim font-mono bg-border px-2 py-0.5 rounded">
          {graded.length} events
        </span>
      </div>

      <div ref={listRef} className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-6 text-center text-text-dim text-xs">
            <span className="inline-block w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin mr-2 align-middle" />
            Warming up engine…
          </div>
        ) : graded.length === 0 ? (
          <div className="p-6 text-center text-text-dim text-xs">
            No events loaded.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {graded.map((m, i) => {
              const isActive = selectedIdx === i;
              const g = m.grade;
              return (
                <motion.div
                  key={m.id || i}
                  data-idx={i}
                  layout
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? "#252525" : "transparent",
                    borderLeftColor: isActive ? g.color : "transparent",
                  }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onSelect(i)}
                  className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#1f1f1f] cursor-pointer border-l-3"
                  style={{ borderLeftWidth: "3px" }}
                >
                  <span className="w-6 text-text-dim text-[11px] font-mono flex-shrink-0">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#eee] truncate">
                      {m.player}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[9px] uppercase tracking-wide font-bold text-text-dim bg-border px-1.5 py-0.5 rounded">
                        {m.type}
                      </span>
                      <EvalBadge {...g} size={11} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-accent font-mono text-xs">
                      {m.move}
                    </div>
                    <div className="text-[10px] text-text-dim font-mono mt-0.5">
                      xT {m.metrics?.xT}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
