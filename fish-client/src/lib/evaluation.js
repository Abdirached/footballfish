// ============================================================
//  FOOTBALLFISH — HEURISTIC EVALUATION ENGINE ("Stockfish" core)
//  Grades match events like chess moves using:
//    1. Delta Expected Threat (ΔxT)
//    2. Defensive Pressure (cell congestion index)
//    3. Pass Success Probability (%)
// ============================================================

import { parseCoord, parseMove, columnPhase, isZone14 } from "./coordinates.js";

/**
 * Static positional "expected threat" surface per column phase.
 * Mirrors a chess piece-square table: deeper columns carry more threat.
 * Build-Up (A-D) = low, Midfield (E-H) = medium, Attacking (I-L) = high.
 */
const XT_TABLE = {
  buildup: 0.04,
  midfield: 0.12,
  attacking: 0.28,
};

/**
 * Zone 14 bonus — the most dangerous creative cell in football.
 */
const ZONE_14_BONUS = 0.18;

/**
 * Estimate the base expected threat (xT) for a single cell.
 */
export function cellThreat(coord) {
  const p = parseCoord(coord);
  if (!p) return 0;
  let xt = XT_TABLE[columnPhase(p.col)];
  if (isZone14(coord)) xt += ZONE_14_BONUS;
  return xt;
}

/**
 * Defensive congestion index for a cell — a deterministic mock based on
 * the cell tag so the same cell always yields the same pressure band.
 * Central + attacking cells tend to be more congested.
 */
export function cellPressure(coord) {
  const p = parseCoord(coord);
  if (!p) return "Low";
  const phase = columnPhase(p.col);
  // Pseudo-deterministic hash from the coord string.
  const hash = (coord.charCodeAt(0) * 31 + coord.charCodeAt(1) * 7) % 100;
  let score = hash / 100;
  if (phase === "attacking") score += 0.35;
  if (phase === "midfield") score += 0.15;
  if (isZone14(coord)) score += 0.2;
  score = Math.min(score, 0.99);
  if (score > 0.66) return "High";
  if (score > 0.33) return "Medium";
  return "Low";
}

const PRESSURE_RISK = { Low: 0.05, Medium: 0.22, High: 0.5 };

/**
 * Estimate pass success probability (%) from start -> end.
 * Longer vectors and higher end-cell pressure reduce success.
 */
export function successProbability(from, to) {
  const a = parseCoord(from);
  const b = parseCoord(to);
  if (!a || !b) return 50;
  const dx = b.col - a.col;
  const dy = b.row - a.row;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Max possible distance across the grid (corner to corner).
  const maxDist = Math.sqrt(11 * 11 + 7 * 7);
  const distFactor = dist / maxDist; // 0..1
  const pressure = PRESSURE_RISK[cellPressure(to)] ?? 0.2;
  // Reward progressive (forward) play slightly.
  const progressive = dx > 0 ? 0.08 : -0.05;
  let prob = 0.95 - distFactor * 0.45 - pressure + progressive;
  prob = Math.max(0.05, Math.min(0.97, prob));
  return Math.round(prob * 100);
}

/**
 * Compute the full metric set for a move string "FROM -> TO".
 * @returns {{ xt: number, pressure: string, successProb: number, delta: number }}
 */
export function evaluateMove(move) {
  const parsed = parseMove(move);
  if (!parsed) {
    return { xt: 0, pressure: "Low", successProb: 50, delta: 0 };
  }
  const { from, to } = parsed;
  const xtFrom = cellThreat(from);
  const xtTo = cellThreat(to);
  const delta = +(xtTo - xtFrom).toFixed(2);
  const pressure = cellPressure(to);
  const successProb = successProbability(from, to);
  return { xt: delta, pressure, successProb, delta };
}

/**
 * Grade an event exactly like chess move notation.
 *   Brilliant (!!)  — High ΔxT, low success probability, penetrates the block.
 *   Blunder (??)    — Negative ΔxT, turnover in high-leverage defensive cells.
 *   Excellent/Good (!) — Standard progressive play keeping possession.
 *
 * @param {object} evt  event with at least { move }
 * @returns {{
 *   grade: "Brilliant" | "Blunder" | "Excellent" | "Good",
 *   symbol: "!!" | "??" | "!" | "",
 *   color: string,
 *   icon: "Sparkles" | "AlertTriangle" | "CheckCircle",
 * }}
 */
export function gradeEvent(evt) {
  // Prefer pre-supplied metrics if present (mock data contract),
  // otherwise compute from the move string.
  let delta, pressure, successProb;
  if (evt?.metrics) {
    delta = parseFloat(String(evt.metrics.xT).replace("+", "")) || 0;
    pressure = evt.metrics.pressure ?? "Low";
    const sp = String(evt.metrics.successProb).replace("%", "").trim();
    successProb = sp === "" ? 50 : parseInt(sp, 10);
  } else {
    const m = evaluateMove(evt.move);
    delta = m.delta;
    pressure = m.pressure;
    successProb = m.successProb;
  }

  const lowSuccess = successProb <= 30;
  const highSuccess = successProb >= 70;

  // Blunder: negative ΔxT into a high-pressure defensive (build-up) cell.
  const to = parseMove(evt.move)?.to;
  const toPhase = to ? columnPhase(parseCoord(to).col) : null;
  if (delta < -0.05 && pressure === "High" && toPhase === "buildup") {
    return {
      grade: "Blunder",
      symbol: "??",
      color: "#ef4444",
      icon: "AlertTriangle",
    };
  }

  // Brilliant: high ΔxT, low success probability, penetrates toward Zone 14 / final third.
  if (
    delta >= 0.2 &&
    lowSuccess &&
    (toPhase === "attacking" || (to && isZone14(to)))
  ) {
    return {
      grade: "Brilliant",
      symbol: "!!",
      color: "#10b981",
      icon: "Sparkles",
    };
  }

  // Excellent: clearly progressive, decent success.
  if (delta >= 0.1 && highSuccess) {
    return {
      grade: "Excellent",
      symbol: "!",
      color: "#facc15",
      icon: "CheckCircle",
    };
  }

  // Good: standard progressive possession play.
  if (delta >= 0) {
    return {
      grade: "Good",
      symbol: "",
      color: "#facc15",
      icon: "CheckCircle",
    };
  }

  // Default fallback — slight negative but not a full blunder.
  return {
    grade: "Good",
    symbol: "",
    color: "#facc15",
    icon: "CheckCircle",
  };
}

/**
 * Generate top N candidate next actions from a given grid cell.
 * Acts like Stockfish multi-PV mode — suggests the best continuations.
 */
export function generateCandidates(fromCoord, topN = 3) {
  const p = parseCoord(fromCoord);
  if (!p) return [];
  const cols = "ABCDEFGHIJKL".split("");
  const results = [];
  for (let c = 0; c < 12; c++) {
    for (let r = 0; r < 8; r++) {
      const toTag = `${cols[c]}${8 - r}`;
      if (toTag === fromCoord) continue;
      const moveStr = `${fromCoord} -> ${toTag}`;
      const parsed = parseMove(moveStr);
      if (!parsed) continue;
      const { from, to } = parsed;
      const xtFrom = cellThreat(from);
      const xtTo = cellThreat(to);
      const delta = +(xtTo - xtFrom).toFixed(2);
      const pressure = cellPressure(to);
      const successProb = successProbability(from, to);
      const score = delta * 100 + (100 - successProb) * 0.3;

      let grade = "Good", symbol = "", color = "#facc15", icon = "CheckCircle";
      if (delta >= 0.2 && successProb <= 30) {
        grade = "Brilliant"; symbol = "!!"; color = "#10b981"; icon = "Sparkles";
      } else if (delta < -0.05 && pressure === "High") {
        grade = "Blunder"; symbol = "??"; color = "#ef4444"; icon = "AlertTriangle";
      } else if (delta >= 0.1 && successProb >= 70) {
        grade = "Excellent"; symbol = "!"; color = "#facc15"; icon = "CheckCircle";
      }

      results.push({ move: moveStr, grade, symbol, color, icon, xt: delta, pressure, successProb, score: +score.toFixed(1) });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}

/**
 * Aggregate advantage score (0..100) for the attacking side from a list
 * of graded events. Used to drive the territorial advantage bar.
 */
export function aggregateAdvantage(events) {
  if (!events?.length) return 50;
  let score = 50;
  for (const e of events) {
    const g = gradeEvent(e);
    const m = e.metrics
      ? parseFloat(String(e.metrics.xT).replace("+", "")) || 0
      : evaluateMove(e.move).delta;
    if (g.grade === "Brilliant") score += m * 60 + 4;
    else if (g.grade === "Excellent") score += m * 40 + 2;
    else if (g.grade === "Good") score += m * 20;
    else if (g.grade === "Blunder") score += m * 50 - 3;
  }
  return Math.max(2, Math.min(98, Math.round(score)));
}
