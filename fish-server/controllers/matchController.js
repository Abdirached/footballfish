const { spawn } = require("child_process");
const path = require("path");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 });
const enginePath = path.join(__dirname, "../../engine/processor.py");

const FALLBACK_COMPS = [
  { competition_id: 43, season_id: 3, competition_name: "FIFA World Cup", season_name: "2022", country_name: "International", has_360: true },
  { competition_id: 55, season_id: 27, competition_name: "UEFA Euro", season_name: "2024", country_name: "Europe", has_360: true },
  { competition_id: 16, season_id: 96, competition_name: "UEFA Champions League", season_name: "2022/2023", country_name: "Europe", has_360: false },
  { competition_id: 11, season_id: 106, competition_name: "La Liga", season_name: "2020/2021", country_name: "Spain", has_360: true },
];

exports.listCompetitions = async (_req, res) => {
  const cached = cache.get("competitions");
  if (cached) return res.json(cached);

  try {
    const data = await runEngine(["--list-comps"]);
    if (Array.isArray(data) && data.length > 0) {
      cache.set("competitions", data);
      return res.json(data);
    }
    throw new Error("No data");
  } catch {
    res.json(FALLBACK_COMPS);
  }
};

exports.listMatches = async (req, res) => {
  const { competitionId, seasonId } = req.params;
  const cacheKey = `matches_${competitionId}_${seasonId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const STATSBOMB_URL = `https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/${competitionId}/${seasonId}.json`;

  try {
    const response = await fetch(STATSBOMB_URL);
    if (!response.ok) throw new Error("Not found");
    const data = await response.json();
    const matches = data.map((m) => ({
      id: String(m.match_id),
      home: m.home_team?.home_team_name || m.home_team?.team_name || "?",
      away: m.away_team?.away_team_name || m.away_team?.team_name || "?",
      competition: m.competition?.competition_name || "",
      season: m.competition?.season_name || "",
      date: m.match_date || "",
      home_formation: m.home_team?.formation || "",
      away_formation: m.away_team?.formation || "",
    }));
    cache.set(cacheKey, matches);
    res.json(matches);
  } catch {
    res.json([]);
  }
};

function runEngine(args) {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [enginePath, ...args]);
    let output = "";
    let errorOutput = "";
    python.stdout.on("data", (d) => { output += d.toString(); });
    python.stderr.on("data", (d) => { errorOutput += d.toString(); });
    python.on("close", (code) => {
      if (code !== 0) return reject(new Error(errorOutput));
      try { resolve(JSON.parse(output)); }
      catch (e) { reject(new Error("Invalid JSON: " + e.message)); }
    });
    python.on("error", reject);
  });
}
