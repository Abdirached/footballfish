const express = require("express");
const router = express.Router();
const {
  analyzeMatch,
  analyzeJdp,
} = require("../controllers/analysisController");

router.get("/:matchId", analyzeMatch);
router.get("/:matchId/jdp", analyzeJdp);

module.exports = router;
