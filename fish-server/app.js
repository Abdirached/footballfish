const express = require("express");
const cors = require("cors");
const path = require("path");

const matchesRouter = require("./routes/matches");
const analysisRouter = require("./routes/analysis");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchesRouter);
app.use("/api/analysis", analysisRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

module.exports = app;
