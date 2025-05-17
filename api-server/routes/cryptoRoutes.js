const express = require("express");
const router = express.Router();
const {
  getLatestStats,
  calculateStandardDeviation,
  COINS,
} = require("../services/cryptoService");

router.get("/stats", async (req, res) => {
  try {
    const { coin } = req.query;

    if (!coin) {
      return res.status(400).json({ error: "Coin parameter is required" });
    }

    if (!COINS.includes(coin)) {
      return res.status(400).json({
        error: `Invalid coin. Supported coins are: ${COINS.join(", ")}`,
      });
    }

    const stats = await getLatestStats(coin);

    return res.json(stats);
  } catch (error) {
    console.error("Error in /stats endpoint:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/deviation", async (req, res) => {
  try {
    const { coin } = req.query;

    if (!coin) {
      return res.status(400).json({ error: "Coin parameter is required" });
    }

    if (!COINS.includes(coin)) {
      return res.status(400).json({
        error: `Invalid coin. Supported coins are: ${COINS.join(", ")}`,
      });
    }

    const deviation = await calculateStandardDeviation(coin);

    return res.json({ deviation });
  } catch (error) {
    console.error("Error in /deviation endpoint:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
