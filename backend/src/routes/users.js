const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("admin")); // entire route is admin only

// GET all users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// Change a user's role (admin <-> standard)
router.patch("/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["admin", "standard"].includes(role))
    return res.status(400).json({ error: "role must be admin or standard" });

  // Prevent admin from demoting themselves
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: "You cannot change your own role" });

  try {
    const result = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role, status",
      [role, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });

    await pool.query(
      `INSERT INTO event_logs (source, event_type, description) VALUES ($1,$2,$3)`,
      ["user", "role_changed", `${result.rows[0].username} role changed to ${role} by ${req.user.username}`]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update role" });
  }
});

// Toggle user status (active <-> disabled)
router.patch("/:id/status", async (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: "You cannot disable your own account" });

  try {
    const result = await pool.query(
      `UPDATE users SET status = CASE WHEN status='active' THEN 'disabled' ELSE 'active' END
       WHERE id=$1 RETURNING id, username, email, role, status`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });

    await pool.query(
      `INSERT INTO event_logs (source, event_type, description) VALUES ($1,$2,$3)`,
      ["user", "status_changed", `${result.rows[0].username} set to ${result.rows[0].status} by ${req.user.username}`]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update status" });
  }
});

module.exports = router;
