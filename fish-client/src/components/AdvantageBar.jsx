import { motion } from "framer-motion";

export default function AdvantageBar({ score, loading = false }) {
  const clamped = Math.max(0, Math.min(100, score ?? 50));
  const whitePct = clamped;
  const blackPct = 100 - clamped;
  const label = clamped > 55 ? `+${(clamped - 50) * 0.1}`.replace(/^\+0/, "+") : "";

  return (
    <div
      className="relative h-[75vh] w-[24px] rounded-[6px] overflow-hidden border border-border bg-[#1a1a1a] flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex-shrink-0"
      title={`Engine advantage: ${clamped}`}
    >
      <motion.div
        className="bg-white w-full origin-top"
        animate={{ height: `${whitePct}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      />
      <motion.div
        className="bg-[#1a1a1a] w-full"
        animate={{ height: `${blackPct}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-accent/50 -translate-y-px" />
      {label && (
        <div className="absolute top-[6px] left-0 right-0 text-center text-[9px] font-black font-mono text-[#121212] leading-none">
          {label}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-[#121212]/60 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
