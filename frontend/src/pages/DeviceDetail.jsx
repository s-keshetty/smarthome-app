import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

const statusColor = s => s === "online" ? "#16a34a" : s === "offline" ? "#dc2626" : "#94a3b8";
const statusBg    = s => s === "online" ? "#dcfce7" : s === "offline" ? "#fee2e2" : "#f1f5f9";

const metricLabel = (type, value) => {
  if (type === "uptime" || type === "camera_status") return value === 1 ? "Online" : "Offline";
  if (type === "storage")   return `${value}%`;
  if (type === "bandwidth") return `${value} GB`;
  return value;
};

const typeColor = t => {
  if (t.includes("alert"))  return { bg: "#fee2e2", color: "#dc2626" };
  if (t.includes("status")) return { bg: "#dcfce7", color: "#16a34a" };
  return { bg: "#f1f5f9", color: "#64748b" };
};

function MetricChart({ readings }) {
  if (!readings || readings.length === 0) return null;
  const values = readings.map(r => Number(r.value)).reverse();
  const max = Math.max(...values, 1);
  const W = 400, H = 100, pad = 20, barW = Math.floor((W - pad * 2) / values.length) - 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ display: "block" }}>
      <text x={pad} y={12} fontSize={10} fill="#94a3b8">{readings[0]?.metric_type} over time</text>
      {values.map((v, i) => {
        const barH = Math.max(4, Math.round((v / max) * H));
        const x = pad + i * (barW + 4);
        const y = H - barH + 16;
        const color = v > 80 ? "#dc2626" : v > 60 ? "#d97706" : "#2563eb";
        return <rect key={i} x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={0.85} />;
      })}
      <text x={pad} y={H + 26} fontSize={9} fill="#94a3b8">oldest</text>
      <text x={W - pad - 22} y={H + 26} fontSize={9} fill="#94a3b8">latest</text>
      <line x1={pad} y1={16} x2={W - pad} y2={16} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4"/>
    </svg>
  );
}

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/devices/${id}`).then(r => setDevice(r.data)).catch(() => setError("Could not load device"));
  }, [id]);

  const latest = device?.recent_readings?.[0];

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate("/devices")} style={{ background: "none", border: "none", color: "#2563eb", fontSize: 14, cursor: "pointer", padding: 0 }}>← Devices</button>
        <span style={{ color: "#94a3b8" }}>/</span>
        <span style={{ fontSize: 14, color: "#374151" }}>{device?.name || "..."}</span>
      </div>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {device && <>
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{device.name}</h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>Type: <strong>{device.type}</strong> · Added: {new Date(device.created_at).toLocaleDateString()}</p>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, padding: "6px 16px", borderRadius: 99, background: statusBg(device.status), color: statusColor(device.status) }}>● {device.status}</span>
        </div>
        {latest && (
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flex: 1 }}>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Latest reading</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{metricLabel(latest.metric_type, Number(latest.value))}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{latest.metric_type} · {new Date(latest.recorded_at).toLocaleString()}</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flex: 1 }}>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Readings stored</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{device.recent_readings.length}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>last 10 shown</p>
            </div>
          </div>
        )}
        {device.recent_readings.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Metric history — last {device.recent_readings.length} readings</h3>
            <MetricChart readings={device.recent_readings} />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Blue = normal · Orange = elevated · Red = above threshold</p>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Recent readings</h3>
            {device.recent_readings.length === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>No readings yet.</p>}
            {device.recent_readings.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{r.metric_type}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{metricLabel(r.metric_type, Number(r.value))}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(r.recorded_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Recent events</h3>
            {device.recent_logs.length === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>No events logged yet.</p>}
            {device.recent_logs.map((l, i) => {
              const c = typeColor(l.event_type);
              return (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: c.bg, color: c.color }}>{l.event_type}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(l.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#374151", marginTop: 2 }}>{l.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </>}
    </Layout>
  );
}
