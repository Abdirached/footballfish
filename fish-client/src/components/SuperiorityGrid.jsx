import { useMemo } from "react";
import { GRID_COLS, GRID_ROWS, tagFromIndex } from "../lib/coordinates.js";

const ADV_COLOR = {
  HOME: "rgba(250, 204, 21, 0.3)",
  AWAY: "rgba(248, 113, 113, 0.3)",
  NEUTRAL: "transparent",
};

const ADV_BORDER = {
  HOME: "rgba(250, 204, 21, 0.6)",
  AWAY: "rgba(248, 113, 113, 0.6)",
  NEUTRAL: "transparent",
};

export default function SuperiorityGrid({ superiorityMoments }) {
  const zoneCounts = useMemo(() => {
    const counts = {};
    if (!superiorityMoments?.length) return counts;
    for (const m of superiorityMoments) {
      const zone = m.zone || "?";
      if (!counts[zone]) counts[zone] = { home: 0, away: 0, total: 0 };
      if (m.advantage === "HOME") counts[zone].home += 1;
      else if (m.advantage === "AWAY") counts[zone].away += 1;
      counts[zone].total += 1;
    }
    return counts;
  }, [superiorityMoments]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {Object.entries(zoneCounts).map(([tag, counts]) => {
        const match = tag.match(/^([A-L])([1-8])$/);
        if (!match) return null;
        const col = "ABCDEFGHIJKL".indexOf(match[1]);
        const row = 8 - parseInt(match[2], 10);
        if (col < 0 || row < 0) return null;

        const x = (col / GRID_COLS) * 100;
        const y = (row / GRID_ROWS) * 100;
        const w = (1 / GRID_COLS) * 100;
        const h = (1 / GRID_ROWS) * 100;

        const advantage = counts.home > counts.away ? "HOME" : counts.away > counts.home ? "AWAY" : "NEUTRAL";

        return (
          <g key={tag}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={ADV_COLOR[advantage]}
              stroke={ADV_BORDER[advantage]}
              strokeWidth={1.5}
              rx={1.5}
            />
            <text
              x={x + w / 2}
              y={y + h / 2 + 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={5}
              fontWeight="bold"
              opacity={0.9}
            >
              {counts.home}:{counts.away}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
