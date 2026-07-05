const cron = require("node-cron");
const pool = require("../db");

function simulateReading(type) {
  switch (type) {
    case "server":  return { metricType: "uptime",         value: Math.random() > 0.08 ? 1 : 0 };
    case "nas":     return { metricType: "storage",        value: parseFloat((55 + Math.random() * 40).toFixed(1)) };
    case "camera":  return { metricType: "camera_status",  value: Math.random() > 0.1 ? 1 : 0 };
    case "network": return { metricType: "bandwidth",      value: Math.floor(100 + Math.random() * 850) };
    default: return null;
  }
}

async function checkAlert(device, metricType, value) {
  let condition = null, severity = "warning";
  if (metricType === "uptime" && value === 0)         { condition = `Server "${device.name}" is offline`; severity = "critical"; }
  if (metricType === "storage" && value > 80)         { condition = `Storage on "${device.name}" is at ${value}%`; severity = value > 90 ? "critical" : "warning"; }
  if (metricType === "camera_status" && value === 0)  { condition = `Camera "${device.name}" is offline`; }
  if (metricType === "bandwidth" && value > 900)      { condition = `High bandwidth on "${device.name}": ${value} GB`; }
  if (!condition) return;

  const existing = await pool.query(
    `SELECT id FROM alerts WHERE device_id=$1 AND status='active' AND trigger_condition=$2`,
    [device.id, condition]
  );
  if (existing.rows.length > 0) return;

  await pool.query(
    `INSERT INTO alerts (device_id,trigger_condition,severity) VALUES ($1,$2,$3)`,
    [device.id, condition, severity]
  );
  await pool.query(
    `INSERT INTO event_logs (source,event_type,description) VALUES ($1,$2,$3)`,
    ["system", "alert_created", condition]
  );
  console.log(`[ALERT] ${severity}: ${condition}`);
}

async function pollAll() {
  try {
    const { rows: devices } = await pool.query("SELECT * FROM devices");
    for (const device of devices) {
      try {
        const reading = simulateReading(device.type);
        if (!reading) continue;
        const { metricType, value } = reading;

        await pool.query(
          `INSERT INTO metric_readings (device_id,metric_type,value) VALUES ($1,$2,$3)`,
          [device.id, metricType, value]
        );

        const newStatus = (metricType === "uptime" || metricType === "camera_status") && value === 0 ? "offline" : "online";
        if (device.status !== newStatus) {
          await pool.query("UPDATE devices SET status=$1 WHERE id=$2", [newStatus, device.id]);
          await pool.query(
            `INSERT INTO event_logs (source,event_type,description) VALUES ($1,$2,$3)`,
            ["device","status_change",`"${device.name}" changed to ${newStatus}`]
          );
        }
        await checkAlert(device, metricType, value);
      } catch (e) {
        console.error(`[POLLER] Error on ${device.name}:`, e.message);
      }
    }
    if (devices.length > 0) console.log(`[POLLER] Polled ${devices.length} devices at ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    console.error("[POLLER] Error:", e.message);
  }
}

function startPoller() {
  pollAll();
  cron.schedule("*/60 * * * * *", pollAll);
  console.log("[POLLER] Monitoring started — every 60s");
}

module.exports = { startPoller };
