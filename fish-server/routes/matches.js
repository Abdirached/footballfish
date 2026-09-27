const express = require("express");
const router = express.Router();
const {
  listCompetitions,
  listMatches,
} = require("../controllers/matchController");

router.get("/competitions", listCompetitions);
router.get("/:competitionId/:seasonId", listMatches);

module.exports = router;
