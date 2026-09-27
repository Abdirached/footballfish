import { useMemo } from "react";
import { COLS, GRID_COLS, GRID_ROWS, tagFromIndex } from "../lib/coordinates.js";

const HOME_HEAT = "#facc15";
const AWAY_HEAT = "#f87171";

function heatColor(value, baseColor) {
  if (value <= 0) return "transparent";
  const intensity = Math.min(value * 20, 0.85);
  if (baseColor === HOME_HEAT) {
    return `rgba(250, 204, 21, ${intensity})`;
  }
  return `rgba(248, 113, 113, ${intensity})`;
}

export default function ZoneHeatmap({ zoneControl, teamKey = "home" }) {
  const cells = useMemo(() => {
    if (!zoneControl) return [];
    const team = zoneControl[teamKey];
    if (!team?.zone_control) return [];
    const control = team.zone_control;
    const result = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const tag = tagFromIndex(c, r);
        const val = control[tag] || 0;
        if (val > 0) {
          result.push({
            tag,
            col: c,
            row: r,
            value: val,
          });
        }
      }
    }
    return result;
  }, [zoneControl, teamKey]);

  if (!cells.length) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {cells.map((cell) => {
        const x = ((cell.col) / GRID_COLS) * 100;
        const y = ((cell.row) / GRID_ROWS) * 100;
        const w = (1 / GRID_COLS) * 100;
        const h = (1 / GRID_ROWS) * 100;
        const color = teamKey === "home" ? HOME_HEAT : AWAY_HEAT;
        return (
          <rect
            key={cell.tag}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={heatColor(cell.value, color)}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}
