const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query(
    `SELECT id,source,event_type,description,created_at FROM event_logs ORDER BY created_at DESC LIMIT 100`
  );
  res.json(result.rows);
});

module.exports = router;
