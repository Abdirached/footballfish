import React from "react";

/**
 * PitchMarkings — FIFA-accurate pitch line overlay.
 *
 * All dimensions are derived from real FIFA pitch regulations:
 *   Pitch: 105m × 68m
 *   Penalty box: 16.5m deep × 40.3m wide
 *   Goal area: 5.5m deep × 18.3m wide
 *   Center circle radius: 9.15m
 *   Penalty spot: 11m from goal line
 *   Penalty arc radius: 9.15m
 *   Corner arc radius: 1m
 *   Goal: 7.32m wide × ~2m deep
 *
 * Uses the same 0..100 viewBox as the VectorOverlay so everything
 * aligns perfectly with the DOM grid beneath.
 */

// Real FIFA pitch dimensions in meters
const PITCH_LEN = 105;
const PITCH_WID = 68;

// Convert meters → viewBox percentage units
const mx = (m) => (m / PITCH_LEN) * 100; // along length (x)
const my = (m) => (m / PITCH_WID) * 100; // along width (y)

// Boundary margin (viewBox units)
const M = 2;

// Derived dimensions
const pbDepth = mx(16.5); // penalty box depth
const pbWidth = my(40.3); // penalty box width
const pbY = (100 - pbWidth) / 2; // penalty box top y

const gaDepth = mx(5.5); // goal area depth
const gaWidth = my(18.3); // goal area width
const gaY = (100 - gaWidth) / 2; // goal area top y

const psDist = mx(11); // penalty spot distance from goal line
const ccRx = mx(9.15); // center circle x-radius
const ccRy = my(9.15); // center circle y-radius

const paRx = mx(9.15); // penalty arc x-radius
const paRy = my(9.15); // penalty arc y-radius

const caRx = mx(1); // corner arc x-radius
const caRy = my(1); // corner arc y-radius

const goalDepth = mx(2); // goal depth
const goalWidth = my(7.32); // goal width
const goalY = (100 - goalWidth) / 2; // goal top y

// Penalty arc intersection with box edge
const arcOffset = paRy * Math.sqrt(1 - Math.pow((pbDepth - psDist) / paRx, 2));

const LINE = "rgba(255,255,255,0.55)";
const SW = 0.3; // stroke width
const SPOT_R = 0.5; // spot radius

export default function PitchMarkings() {
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
        zIndex: 4,
      }}
    >
      {/* ===== Boundary (touchlines + goal lines) ===== */}
      <rect
        x={M}
        y={M}
        width={100 - 2 * M}
        height={100 - 2 * M}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Halfway line ===== */}
      <line
        x1={50}
        y1={M}
        x2={50}
        y2={100 - M}
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Center circle ===== */}
      <ellipse
        cx={50}
        cy={50}
        rx={ccRx}
        ry={ccRy}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Center spot ===== */}
      <circle cx={50} cy={50} r={SPOT_R} fill={LINE} />

      {/* ===== Left penalty box ===== */}
      <rect
        x={M}
        y={pbY}
        width={pbDepth}
        height={pbWidth}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Left goal area ===== */}
      <rect
        x={M}
        y={gaY}
        width={gaDepth}
        height={gaWidth}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Left penalty spot ===== */}
      <circle cx={M + psDist} cy={50} r={SPOT_R} fill={LINE} />

      {/* ===== Left penalty arc ===== */}
      <path
        d={`M ${M + pbDepth} ${50 - arcOffset} A ${paRx} ${paRy} 0 0 1 ${M + pbDepth} ${50 + arcOffset}`}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Right penalty box ===== */}
      <rect
        x={100 - M - pbDepth}
        y={pbY}
        width={pbDepth}
        height={pbWidth}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Right goal area ===== */}
      <rect
        x={100 - M - gaDepth}
        y={gaY}
        width={gaDepth}
        height={gaWidth}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Right penalty spot ===== */}
      <circle cx={100 - M - psDist} cy={50} r={SPOT_R} fill={LINE} />

      {/* ===== Right penalty arc ===== */}
      <path
        d={`M ${100 - M - pbDepth} ${50 - arcOffset} A ${paRx} ${paRy} 0 0 0 ${100 - M - pbDepth} ${50 + arcOffset}`}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Corner arcs ===== */}
      {/* Top-left */}
      <path
        d={`M ${M + caRx} ${M} A ${caRx} ${caRy} 0 0 1 ${M} ${M + caRy}`}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />
      {/* Top-right */}
      <path
        d={`M ${100 - M - caRx} ${M} A ${caRx} ${caRy} 0 0 0 ${100 - M} ${M + caRy}`}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />
      {/* Bottom-left */}
      <path
        d={`M ${M} ${100 - M - caRy} A ${caRx} ${caRy} 0 0 1 ${M + caRx} ${100 - M}`}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />
      {/* Bottom-right */}
      <path
        d={`M ${100 - M} ${100 - M - caRy} A ${caRx} ${caRy} 0 0 0 ${100 - M - caRx} ${100 - M}`}
        fill="none"
        stroke={LINE}
        strokeWidth={SW}
      />

      {/* ===== Goals ===== */}
      {/* Left goal */}
      <rect
        x={M - goalDepth}
        y={goalY}
        width={goalDepth}
        height={goalWidth}
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={SW * 0.8}
      />
      {/* Right goal */}
      <rect
        x={100 - M}
        y={goalY}
        width={goalDepth}
        height={goalWidth}
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={SW * 0.8}
      />
    </svg>
  );
}
