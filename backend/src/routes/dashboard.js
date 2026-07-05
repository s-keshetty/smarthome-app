const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const devices = await pool.query("SELECT id,name,type,status FROM devices ORDER BY name");
    const activeAlerts = await pool.query("SELECT count(*) FROM alerts WHERE status='active'");
    const recentAlerts = await pool.query(
      `SELECT a.id,a.trigger_condition,a.severity,a.status,a.created_at,d.name as device_name
       FROM alerts a JOIN devices d ON d.id=a.device_id
       ORDER BY a.created_at DESC LIMIT 5`
    );
    res.json({
      summary: {
        total_devices: devices.rows.length,
        devices_online: devices.rows.filter(d => d.status === "online").length,
        devices_offline: devices.rows.filter(d => d.status === "offline").length,
        active_alerts: Number(activeAlerts.rows[0].count),
      },
      devices: devices.rows,
      recent_alerts: recentAlerts.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard load failed" });
  }
});

module.exports = router;
