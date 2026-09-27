// ============================================================
//  FOOTBALLFISH — SPATIAL DISCRETIZATION MATH LAYER
//  The pitch is an explicit 12x8 matrix.
//  Columns A-L horizontally (A left, L right).
//  Rows 8-1 vertically (8 top, 1 bottom) — A8 top-left, L1 bottom-right.
// ============================================================

export const COLS = "ABCDEFGHIJKL".split(""); // 12 columns
export const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]; // top -> bottom
export const GRID_COLS = 12;
export const GRID_ROWS = 8;

/**
 * Parse a discrete cell tag (e.g. "F4", "A8", "L1") into zero-based
 * grid indices. Column index 0 = A (left). Row index 0 = row 8 (top).
 *
 * @param {string} coord  e.g. "F4"
 * @returns {{ col: number, row: number } | null}
 */
export function parseCoord(coord) {
  if (typeof coord !== "string") return null;
  const m = coord
    .trim()
    .toUpperCase()
    .match(/^([A-L])([1-8])$/);
  if (!m) return null;
  const col = COLS.indexOf(m[1]);
  const row = 8 - parseInt(m[2], 10); // row 8 -> index 0 (top)
  return { col, row };
}

/**
 * Convert a discrete cell tag to its exact absolute cell-center
 * percentage coordinates inside the pitch container.
 *
 * The SVG overlay uses a 0..100 viewBox, so these percentages map
 * 1:1 to SVG user units and align flawlessly with the DOM grid.
 *
 * @param {string} coord  e.g. "F4"
 * @returns {{ x: number, y: number } | null}  values in 0..100
 */
export function coordToPercent(coord) {
  const p = parseCoord(coord);
  if (!p) return null;
  return {
    x: ((p.col + 0.5) / GRID_COLS) * 100,
    y: ((p.row + 0.5) / GRID_ROWS) * 100,
  };
}

/**
 * Parse a move string of the form "D4 -> I5" into start/end coords.
 * @param {string} move
 * @returns {{ from: string, to: string } | null}
 */
export function parseMove(move) {
  if (typeof move !== "string") return null;
  const parts = move.split(/\s*->\s*/);
  if (parts.length < 2) return null;
  const from = parts[0].trim().toUpperCase();
  const to = parts[1].trim().toUpperCase();
  if (!parseCoord(from) || !parseCoord(to)) return null;
  return { from, to };
}

/**
 * Return the alphanumeric tag for a given col/row index pair.
 * Inverse of parseCoord.
 */
export function tagFromIndex(col, row) {
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
  return `${COLS[col]}${8 - row}`;
}

// ---- Phase / zone classification (used for shading + heuristics) ----

/**
 * Column phase band:
 *  A-D = Build-Up, E-H = Midfield Consolidation, I-L = Attacking (Final Third)
 */
export function columnPhase(col) {
  if (col <= 3) return "buildup";
  if (col <= 7) return "midfield";
  return "attacking";
}

/**
 * Row band classification for positional play shading.
 *  Rows 1 & 8 (index 0,7)  -> Flanks/Wings
 *  Rows 2 & 7 (index 1,6)  -> Half-Spaces
 *  Rows 3-6  (index 2-5)   -> Central Axis
 */
export function rowBand(row) {
  if (row === 0 || row === 7) return "wing";
  if (row === 1 || row === 6) return "halfspace";
  return "central";
}

/**
 * Zone 14 — the explicitly highlighted central attacking cells.
 * Spec: I4, I5, J4, J5.
 */
export const ZONE_14 = new Set(["I4", "I5", "J4", "J5"]);

export function isZone14(tag) {
  return ZONE_14.has(tag);
}

/**
 * Base cell color per the tactical grid spec.
 */
export function cellBaseColor(tag, col, row) {
  if (isZone14(tag)) return "#3a9c40";
  const band = rowBand(row);
  if (band === "wing") return "#276e2b";
  if (band === "halfspace") return "#338a38";
  return "#2e7d32"; // central
}
