const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM automation_rules ORDER BY created_at DESC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, device_type, metric_type, threshold, action } = req.body;
  if (!name || !device_type || !metric_type || threshold == null || !action)
    return res.status(400).json({ error: "All fields required" });
  const result = await pool.query(
    `INSERT INTO automation_rules (owner_id,name,device_type,metric_type,threshold,action)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, name, device_type, metric_type, threshold, action]
  );
  await pool.query(
    `INSERT INTO event_logs (source,event_type,description) VALUES ($1,$2,$3)`,
    ["user","rule_created",`Rule created: ${name} by ${req.user.username}`]
  );
  res.status(201).json(result.rows[0]);
});

router.patch("/:id/toggle", async (req, res) => {
  const result = await pool.query(
    "UPDATE automation_rules SET enabled=NOT enabled WHERE id=$1 RETURNING *",
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Rule not found" });
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM automation_rules WHERE id=$1 RETURNING name", [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: "Rule not found" });
  res.status(204).send();
});

module.exports = router;
