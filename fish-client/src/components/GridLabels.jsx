import React from "react";
import { COLS, ROWS, GRID_COLS, GRID_ROWS } from "../lib/coordinates.js";

/**
 * GridLabels — chessboard-style axis labels for the 12×8 grid.
 *
 * Classic chess convention: letters along the bottom edge, numbers
 * along the left edge only. Each label sits in a subtle dark pill
 * for crisp readability against the green pitch.
 */
const LABEL_COLOR = "#facc15";
const PILL_FILL = "rgba(18,18,18,0.72)";

export default function GridLabels() {
  const colLabels = COLS.map((letter, i) => {
    const x = ((i + 0.5) / GRID_COLS) * 100;
    return { letter, x };
  });

  const rowLabels = ROWS.map((num, i) => {
    const y = ((i + 0.5) / GRID_ROWS) * 100;
    return { num: String(num), y };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      {/* Column letters — bottom edge only */}
      {colLabels.map(({ letter, x }) => (
        <g key={`col-${letter}`}>
          <rect
            x={x - 1.6}
            y={96.2}
            width={3.2}
            height={3.0}
            rx={0.6}
            fill={PILL_FILL}
          />
          <text
            x={x}
            y={97.7}
            fill={LABEL_COLOR}
            fontSize="1.7"
            fontWeight="900"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {letter}
          </text>
        </g>
      ))}

      {/* Row numbers — left edge only */}
      {rowLabels.map(({ num, y }) => (
        <g key={`row-${num}`}>
          <rect
            x={0.6}
            y={y - 1.5}
            width={3.0}
            height={3.0}
            rx={0.6}
            fill={PILL_FILL}
          />
          <text
            x={2.1}
            y={y}
            fill={LABEL_COLOR}
            fontSize="1.7"
            fontWeight="900"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {num}
          </text>
        </g>
      ))}
    </svg>
  );
}
