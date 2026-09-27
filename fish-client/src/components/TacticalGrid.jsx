import { motion, AnimatePresence } from "framer-motion";
import { GRID_COLS, GRID_ROWS, tagFromIndex, isZone14 } from "../lib/coordinates.js";

const FLAT_GREEN = "#2e7d32";

function Cell({ isActiveFrom, isActiveTo, zone14 }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: FLAT_GREEN, border: "1px solid rgba(250,204,21,0.35)" }}
    >
      {zone14 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(250,204,21,0.08)",
            boxShadow: "inset 0 0 0 1px rgba(250,204,21,0.25)",
          }}
        />
      )}
      <AnimatePresence>
        {isActiveFrom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, rgba(250,204,21,0.5) 0%, rgba(250,204,21,0.1) 70%)",
              animation: "ff-pulse 1.6s ease-in-out infinite",
            }}
          />
        )}
        {isActiveTo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, rgba(248,113,113,0.5) 0%, rgba(248,113,113,0.12) 70%)",
              animation: "ff-pulse 1.6s ease-in-out infinite",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TacticalGrid({ activeFrom, activeTo }) {
  const cells = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tag = tagFromIndex(c, r);
      cells.push(
        <Cell
          key={tag}
          tag={tag}
          isActiveFrom={activeFrom === tag}
          isActiveTo={activeTo === tag}
          zone14={isZone14(tag)}
        />,
      );
    }
  }

  return (
    <div
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
}
