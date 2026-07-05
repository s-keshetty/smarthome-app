const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query(
    `SELECT a.id,a.trigger_condition,a.severity,a.status,a.created_at,a.resolved_at,
            d.name as device_name,d.type as device_type
     FROM alerts a JOIN devices d ON d.id=a.device_id
     ORDER BY a.created_at DESC`
  );
  res.json(result.rows);
});

router.patch("/:id/resolve", async (req, res) => {
  const result = await pool.query(
    `UPDATE alerts SET status='resolved',resolved_at=now() WHERE id=$1 RETURNING *`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Alert not found" });
  await pool.query(
    `INSERT INTO event_logs (source,event_type,description) VALUES ($1,$2,$3)`,
    ["user","alert_resolved",`Alert resolved by ${req.user.username}: ${result.rows[0].trigger_condition}`]
  );
  res.json(result.rows[0]);
});

module.exports = router;
