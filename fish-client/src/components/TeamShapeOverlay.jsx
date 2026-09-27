import { COLS, GRID_COLS, GRID_ROWS } from "../lib/coordinates.js";

const HOME_COLOR = "#facc15";
const AWAY_COLOR = "#f87171";

function posToPercent(col, row) {
  return {
    x: ((col + 0.5) / GRID_COLS) * 100,
    y: ((row + 0.5) / GRID_ROWS) * 100,
  };
}

function PlayerDot({ x, y, label, color, isHome }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3.2} fill={color} opacity={0.85} stroke="#000" strokeWidth={0.5} />
      <text
        x={x}
        y={y + (isHome ? 5.5 : -5.5)}
        textAnchor="middle"
        fill={color}
        fontSize={3.5}
        fontWeight="bold"
        opacity={0.9}
      >
        {label}
      </text>
    </g>
  );
}

function FormationLines({ positions, color }) {
  if (positions.length < 2) return null;
  const segments = [];
  const used = new Set();
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].col - positions[j].col;
      const dy = positions[i].row - positions[j].row;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 3.5) {
        const key = [i, j].sort().join("-");
        if (!used.has(key)) {
          used.add(key);
          segments.push(
            <line
              key={key}
              x1={posToPercent(positions[i].col, positions[i].row).x}
              y1={posToPercent(positions[i].col, positions[i].row).y}
              x2={posToPercent(positions[j].col, positions[j].row).x}
              y2={posToPercent(positions[j].col, positions[j].row).y}
              stroke={color}
              strokeWidth={0.6}
              opacity={0.4}
              strokeDasharray="2 2"
            />,
          );
        }
      }
    }
  }
  return <g>{segments}</g>;
}

export default function TeamShapeOverlay({ homePositions, awayPositions, homeName, awayName }) {
  const homeList = Object.entries(homePositions || {}).map(([name, p]) => ({ name, ...p }));
  const awayList = Object.entries(awayPositions || {}).map(([name, p]) => ({ name, ...p }));

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <FormationLines positions={awayList} color={AWAY_COLOR} />
      <FormationLines positions={homeList} color={HOME_COLOR} />

      {awayList.map((p, i) => {
        const pos = posToPercent(p.col, p.row);
        return (
          <PlayerDot
            key={`away-${i}`}
            x={pos.x}
            y={pos.y}
            label={awayName?.slice(0, 3) || "AWAY"}
            color={AWAY_COLOR}
            isHome={false}
          />
        );
      })}

      {homeList.map((p, i) => {
        const pos = posToPercent(p.col, p.row);
        const short = p.name?.split(" ").pop()?.slice(0, 3) || "H";
        return (
          <PlayerDot
            key={`home-${i}`}
            x={pos.x}
            y={pos.y}
            label={short}
            color={HOME_COLOR}
            isHome={true}
          />
        );
      })}
    </svg>
  );
}

export function teamShapeToPlayerList(shapeData, teamKey) {
  const team = shapeData?.[teamKey];
  if (!team?.avg_positions) return {};
  return team.avg_positions;
}
