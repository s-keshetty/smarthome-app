import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

const dotColor = s => s === "online" ? "#16a34a" : s === "offline" ? "#dc2626" : "#94a3b8";
const dotBg   = s => s === "online" ? "#dcfce7" : s === "offline" ? "#fee2e2" : "#f1f5f9";
const sevColor = s => s === "critical"
  ? { bg: "#fee2e2", color: "#dc2626" }
  : { bg: "#fef3c7", color: "#d97706" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try { const res = await api.get("/dashboard"); setData(res.data); }
    catch { setError("Could not load dashboard"); }
  }
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  // Calculate avg uptime from devices
  const avgUptime = data
    ? data.summary.total_devices === 0 ? "N/A"
      : Math.round((data.summary.devices_online / data.summary.total_devices) * 100) + "%"
    : "-";

  const cardStyle = (color) => ({
    background: "#fff", borderRadius: 12, padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`, flex: 1, minWidth: 130,
  });

  return (
    <Layout>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Dashboard overview</h2>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {data && <>

        {/* Summary cards — matches document: devices online, avg uptime, active alerts */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={cardStyle("#2563eb")}>
            <p style={{ fontSize: 13, color: "#64748b" }}>Devices online</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>
              {data.summary.devices_online}
              <span style={{ fontSize: 16, color: "#94a3b8" }}>/{data.summary.total_devices}</span>
            </p>
          </div>
          <div style={cardStyle("#16a34a")}>
            <p style={{ fontSize: 13, color: "#64748b" }}>Avg uptime</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{avgUptime}</p>
          </div>
          <div style={cardStyle("#d97706")}>
            <p style={{ fontSize: 13, color: "#64748b" }}>Active alerts</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#d97706" }}>{data.summary.active_alerts}</p>
          </div>
          <div style={cardStyle("#dc2626")}>
            <p style={{ fontSize: 13, color: "#64748b" }}>Offline</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#dc2626" }}>{data.summary.devices_offline}</p>
          </div>
        </div>

        {/* Device cards GRID — matches document: colored dot per device */}
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Monitored devices</h3>
        {data.devices.length === 0 && (
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
            No devices yet. Go to Devices tab to add some.
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {data.devices.map(d => (
            <div
              key={d.id}
              onClick={() => navigate(`/devices/${d.id}`)}
              style={{
                background: "#fff", borderRadius: 12, padding: "16px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer",
                borderTop: `3px solid ${dotColor(d.status)}`,
                transition: "box-shadow 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{d.type}</span>
                {/* Colored dot — green/amber/red matching document */}
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: dotColor(d.status), display: "inline-block"
                }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{d.name}</p>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                background: dotBg(d.status), color: dotColor(d.status),
              }}>
                {d.status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent alerts */}
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Recent alerts</h3>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {data.recent_alerts.length === 0 && (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>No alerts. System looks healthy.</p>
          )}
          {data.recent_alerts.map(a => {
            const c = sevColor(a.severity);
            return (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{a.trigger_condition}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{a.device_name} · {new Date(a.created_at).toLocaleString()}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 99, background: c.bg, color: c.color, whiteSpace: "nowrap", marginLeft: 12 }}>
                  {a.severity}
                </span>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: "#94a3b8" }}>Auto-refreshes every 30 seconds</p>
      </>}
    </Layout>
  );
}
