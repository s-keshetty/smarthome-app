import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

const cardStyle = (color) => ({
  background:"#fff", borderRadius:12, padding:"20px 24px",
  boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderLeft:`4px solid ${color}`, flex:1, minWidth:140
});
const statusColor = s => s==="online" ? "#16a34a" : s==="offline" ? "#dc2626" : "#94a3b8";
const sevColor = s => s==="critical" ? {bg:"#fee2e2",color:"#dc2626"} : {bg:"#fef3c7",color:"#d97706"};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try { const res = await api.get("/dashboard"); setData(res.data); }
    catch { setError("Could not load dashboard"); }
  }
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  return (
    <Layout>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>Dashboard overview</h2>
      {error && <p style={{ color:"#dc2626" }}>{error}</p>}
      {data && <>
        <div style={{ display:"flex", gap:16, marginBottom:28, flexWrap:"wrap" }}>
          <div style={cardStyle("#2563eb")}><p style={{ fontSize:13, color:"#64748b" }}>Total devices</p><p style={{ fontSize:28, fontWeight:700 }}>{data.summary.total_devices}</p></div>
          <div style={cardStyle("#16a34a")}><p style={{ fontSize:13, color:"#64748b" }}>Online</p><p style={{ fontSize:28, fontWeight:700, color:"#16a34a" }}>{data.summary.devices_online}</p></div>
          <div style={cardStyle("#dc2626")}><p style={{ fontSize:13, color:"#64748b" }}>Offline</p><p style={{ fontSize:28, fontWeight:700, color:"#dc2626" }}>{data.summary.devices_offline}</p></div>
          <div style={cardStyle("#d97706")}><p style={{ fontSize:13, color:"#64748b" }}>Active alerts</p><p style={{ fontSize:28, fontWeight:700, color:"#d97706" }}>{data.summary.active_alerts}</p></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Devices</h3>
            {data.devices.length===0 && <p style={{ color:"#94a3b8", fontSize:14 }}>No devices yet. Add one in Devices tab.</p>}
            {data.devices.map(d => (
              <div key={d.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                <div><p style={{ fontSize:14, fontWeight:500 }}>{d.name}</p><p style={{ fontSize:12, color:"#94a3b8" }}>{d.type}</p></div>
                <span style={{ fontSize:12, fontWeight:600, color:statusColor(d.status) }}>● {d.status}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Recent alerts</h3>
            {data.recent_alerts.length===0 && <p style={{ color:"#94a3b8", fontSize:14 }}>No alerts. System looks good.</p>}
            {data.recent_alerts.map(a => {
              const c = sevColor(a.severity);
              return (
                <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                  <div><p style={{ fontSize:13, fontWeight:500 }}>{a.trigger_condition}</p><p style={{ fontSize:12, color:"#94a3b8" }}>{new Date(a.created_at).toLocaleString()}</p></div>
                  <span style={{ fontSize:12, fontWeight:600, padding:"2px 8px", borderRadius:99, background:c.bg, color:c.color, whiteSpace:"nowrap" }}>{a.severity}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p style={{ marginTop:14, fontSize:12, color:"#94a3b8" }}>Auto-refreshes every 30 seconds</p>
      </>}
    </Layout>
  );
}
