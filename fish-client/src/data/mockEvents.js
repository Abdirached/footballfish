// ============================================================
//  FOOTBALLFISH — MOCK MATCH EVENT FEED
//  Schema contract:
//  {
//    "id": "evt_002",
//    "player": "Messi",
//    "type": "Line-Breaking Pass",
//    "move": "D4 -> I5",
//    "evaluation": "Brilliant",
//    "advantage": 78,
//    "metrics": { "xT": "+0.45", "pressure": "High", "successProb": "14%" },
//    "insight": "Brilliant (!!) vertical space penetration directly unlocks Zone 14 under intense horizontal pressing lines."
//  }
// ============================================================

export const MATCH_META = {
  home: "ARG",
  away: "FRA",
  competition: "FIFA World Cup 2022 — Final",
};

export const mockEvents = [
  {
    id: "evt_001",
    player: "Mac Allister",
    type: "Progressive Pass",
    move: "B5 -> F4",
    evaluation: "Good",
    advantage: 52,
    metrics: { xT: "+0.08", pressure: "Low", successProb: "81%" },
    insight:
      "Good (!) circulation out of the build-up phase, shifting the point of attack across the half-space to consolidate midfield structure.",
  },
  {
    id: "evt_002",
    player: "Messi",
    type: "Line-Breaking Pass",
    move: "D4 -> I5",
    evaluation: "Brilliant",
    advantage: 78,
    metrics: { xT: "+0.45", pressure: "High", successProb: "14%" },
    insight:
      "Brilliant (!!) vertical space penetration directly unlocks Zone 14 under intense horizontal pressing lines.",
  },
  {
    id: "evt_003",
    player: "Mbappé",
    type: "Transition Sprint",
    move: "L2 -> G6",
    evaluation: "Blunder",
    advantage: 41,
    metrics: { xT: "-0.31", pressure: "High", successProb: "22%" },
    insight:
      "Blunder (??) — negative ΔxT transition into a congested defensive corridor surrenders leverage in a high-leverage cell.",
  },
  {
    id: "evt_004",
    player: "De Paul",
    type: "Half-Space Switch",
    move: "E3 -> H6",
    evaluation: "Excellent",
    advantage: 64,
    metrics: { xT: "+0.16", pressure: "Medium", successProb: "73%" },
    insight:
      "Excellent (!) diagonal into the half-space maintains possession while advancing the central axis corridor.",
  },
  {
    id: "evt_005",
    player: "Griezmann",
    type: "Recovery Pass",
    move: "K4 -> G7",
    evaluation: "Blunder",
    advantage: 38,
    metrics: { xT: "-0.22", pressure: "High", successProb: "29%" },
    insight:
      "Blunder (??) turnover risk in the high-leverage defensive block — negative ΔxT retreat under pressure.",
  },
  {
    id: "evt_006",
    player: "Álvarez",
    type: "Final Third Entry",
    move: "H5 -> J4",
    evaluation: "Brilliant",
    advantage: 81,
    metrics: { xT: "+0.24", pressure: "High", successProb: "19%" },
    insight:
      "Brilliant (!!) penetration into Zone 14 with a low success probability — the engine rewards high-leverage creative risk.",
  },
  {
    id: "evt_007",
    player: "Tchouaméni",
    type: "Screening Intercept",
    move: "I4 -> E5",
    evaluation: "Good",
    advantage: 49,
    metrics: { xT: "-0.04", pressure: "Medium", successProb: "66%" },
    insight:
      "Good (!) defensive screen recycles possession from the final third back into midfield consolidation.",
  },
  {
    id: "evt_008",
    player: "Di María",
    type: "Wing Isolation",
    move: "A8 -> D7",
    evaluation: "Excellent",
    advantage: 58,
    metrics: { xT: "+0.11", pressure: "Low", successProb: "78%" },
    insight:
      "Excellent (!) wing isolation carries the flank into the half-space with a high success probability.",
  },
  {
    id: "evt_009",
    player: "Otamendi",
    type: "Long Diagonal",
    move: "C2 -> K7",
    evaluation: "Good",
    advantage: 55,
    metrics: { xT: "+0.09", pressure: "Medium", successProb: "44%" },
    insight:
      "Good (!) cross-field diagonal switches play to the attacking flank, stretching the defensive block horizontally.",
  },
  {
    id: "evt_010",
    player: "Messi",
    type: "Zone 14 Drop",
    move: "J5 -> I5",
    evaluation: "Excellent",
    advantage: 72,
    metrics: { xT: "+0.02", pressure: "High", successProb: "71%" },
    insight:
      "Excellent (!) controlled rotation inside Zone 14 — minimal ΔxT but elite retention under maximal congestion.",
  },
];
