const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// List all devices
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, type, status, created_at FROM devices ORDER BY name"
  );
  res.json(result.rows);
});

// Get single device with recent readings AND recent event logs
router.get("/:id", async (req, res) => {
  try {
    const device = await pool.query("SELECT * FROM devices WHERE id=$1", [req.params.id]);
    if (!device.rows[0]) return res.status(404).json({ error: "Device not found" });

    const readings = await pool.query(
      `SELECT metric_type, value, recorded_at FROM metric_readings
       WHERE device_id=$1 ORDER BY recorded_at DESC LIMIT 10`,
      [req.params.id]
    );

    const logs = await pool.query(
      `SELECT source, event_type, description, created_at FROM event_logs
       WHERE description LIKE $1 ORDER BY created_at DESC LIMIT 10`,
      [`%"${device.rows[0].name}"%`]
    );

    res.json({
      ...device.rows[0],
      recent_readings: readings.rows,
      recent_logs: logs.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load device" });
  }
});

// Add a device - admin only
router.post("/", requireRole("admin"), async (req, res) => {
  const { name, type, api_config } = req.body;
  const valid = ["server", "nas", "camera", "network"];
  if (!name || !valid.includes(type))
    return res.status(400).json({ error: "name required, type must be server/nas/camera/network" });
  try {
    const result = await pool.query(
      `INSERT INTO devices (name, type, owner_id, api_config) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, type, req.user.id, api_config || {}]
    );
    await pool.query(
      `INSERT INTO event_logs (source, event_type, description) VALUES ($1,$2,$3)`,
      ["user", "device_added", `Device added: ${name} (${type}) by ${req.user.username}`]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add device" });
  }
});

// Delete a device - admin only
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const result = await pool.query(
    "DELETE FROM devices WHERE id=$1 RETURNING name", [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Device not found" });
  await pool.query(
    `INSERT INTO event_logs (source, event_type, description) VALUES ($1,$2,$3)`,
    ["user", "device_removed", `Device removed: ${result.rows[0].name} by ${req.user.username}`]
  );
  res.status(204).send();
});

module.exports = router;
