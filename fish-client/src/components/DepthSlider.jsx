import { Gauge } from "lucide-react";
import { motion } from "framer-motion";

export default function DepthSlider({ depth, aggression, onDepthChange, onAggressionChange }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-border rounded-md">
      <Gauge size={12} className="text-accent" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-dim font-mono">Depth</span>
        <input
          type="range"
          min={1}
          max={10}
          value={depth}
          onChange={(e) => onDepthChange(Number(e.target.value))}
          className="w-16 h-1 accent-accent bg-[#333] rounded-full appearance-none cursor-pointer"
        />
        <motion.span
          key={depth}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-[10px] font-mono font-bold text-accent w-3 text-center"
        >
          {depth}
        </motion.span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-dim font-mono">Aggr</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(aggression * 100)}
          onChange={(e) => onAggressionChange(e.target.value / 100)}
          className="w-16 h-1 accent-accent bg-[#333] rounded-full appearance-none cursor-pointer"
        />
        <motion.span
          key={aggression}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-[10px] font-mono font-bold text-accent w-6 text-center"
        >
          {(aggression * 100).toFixed(0)}%
        </motion.span>
      </div>
    </div>
  );
}
