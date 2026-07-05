require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { startPoller } = require("./jobs/poller");

const app = express();
app.use(cors());
app.use(express.json());

// ADD
app.get("/", (req, res) => {
  res.json({
    message: "Smart Home Backend is running",
    status: "OK"
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/devices",    require("./routes/devices"));
app.use("/api/dashboard",  require("./routes/dashboard"));
app.use("/api/alerts",     require("./routes/alerts"));
app.use("/api/logs",       require("./routes/logs"));
app.use("/api/automation", require("./routes/automation"));

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: "Server error" }); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  startPoller();
});