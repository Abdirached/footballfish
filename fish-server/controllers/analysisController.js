const { spawn } = require("child_process");
const path = require("path");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 });

const enginePath = path.join(__dirname, "../../engine/processor.py");

exports.analyzeMatch = (req, res) => {
  const { matchId } = req.params;
  const depth = parseInt(req.query.depth || "5", 10);
  const aggression = parseFloat(req.query.aggression || "0.5");

  const cacheKey = `analysis_${matchId}_${depth}_${aggression}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const python = spawn("python3", [
    enginePath,
    "--match-id", matchId,
    "--depth", String(depth),
    "--aggression", String(aggression),
  ]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.error("Python error:", errorOutput);
      return res.status(500).json({ error: "Engine analysis failed" });
    }
    try {
      const parsed = JSON.parse(output);

      if (parsed.error) {
        return res.status(500).json({ error: parsed.error });
      }

      cache.set(cacheKey, parsed);
      res.json(parsed);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      res.status(500).json({ error: "Invalid response from engine" });
    }
  });
};

exports.analyzeJdp = (req, res) => {
  const { matchId } = req.params;
  const cacheKey = `jdp_${matchId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const python = spawn("python3", [
    enginePath,
    "--match-id", matchId,
    "--jdp-only",
  ]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.error("Python error:", errorOutput);
      return res.status(500).json({ error: "JdP analysis failed" });
    }
    try {
      const parsed = JSON.parse(output);
      if (parsed.error) {
        return res.status(500).json({ error: parsed.error });
      }
      cache.set(cacheKey, parsed);
      res.json(parsed);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      res.status(500).json({ error: "Invalid response from engine" });
    }
  });
};
