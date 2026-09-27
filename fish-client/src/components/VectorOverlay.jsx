import { motion, AnimatePresence } from "framer-motion";
import { coordToPercent, parseMove } from "../lib/coordinates.js";

export default function VectorOverlay({ move }) {
  const parsed = move ? parseMove(move) : null;
  const from = parsed ? coordToPercent(parsed.from) : null;
  const to = parsed ? coordToPercent(parsed.to) : null;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-5 overflow-visible"
    >
      <defs>
        <marker
          id="ff-arrowhead"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <polygon points="0 1, 10 5, 0 9" fill="#facc15" />
        </marker>
        <filter id="ff-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence>
        {from && to && (
          <motion.g
            key={`${from.x}-${from.y}-${to.x}-${to.y}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="#facc15" strokeWidth={1.4} opacity={0.18} strokeLinecap="round"
            />
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="#facc15" strokeWidth={0.5} strokeLinecap="round"
              strokeDasharray="2,1.2" markerEnd="url(#ff-arrowhead)"
              filter="url(#ff-glow)"
              style={{ animation: "ff-dash 1s linear infinite" }}
            />
            <circle cx={from.x} cy={from.y} r={1.1} fill="#facc15" stroke="#fff" strokeWidth={0.2} />
            <circle cx={from.x} cy={from.y} r={2} fill="none" stroke="#facc15" strokeWidth={0.18} opacity={0.4} />
            <circle cx={to.x} cy={to.y} r={0.9} fill="#f87171" stroke="#fff" strokeWidth={0.2} />
            <circle cx={to.x} cy={to.y} r={1.7} fill="none" stroke="#f87171" strokeWidth={0.18} opacity={0.4} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
