import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  async function load() { const res = await api.get("/alerts"); setAlerts(res.data); }
  useEffect(() => { load(); }, []);
  async function resolve(id) { await api.patch(`/alerts/${id}/resolve`); load(); }
  const shown = filter==="all" ? alerts : alerts.filter(a=>a.status===filter);
  const sevStyle = s => ({ fontSize:12, fontWeight:600, padding:"2px 10px", borderRadius:99, background:s==="critical"?"#fee2e2":"#fef3c7", color:s==="critical"?"#dc2626":"#d97706" });
  const statStyle = s => ({ fontSize:12, fontWeight:600, padding:"2px 10px", borderRadius:99, background:s==="active"?"#dbeafe":"#f1f5f9", color:s==="active"?"#2563eb":"#64748b" });
  return (
    <Layout>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:700 }}>Alerts</h2>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #d1d5db", fontSize:14 }}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
            {["Device","Condition","Severity","Status","Time",""].map(h=>(
              <th key={h} style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#374151", textAlign:"left" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {shown.length===0 && <tr><td colSpan={6} style={{ padding:24, color:"#94a3b8", textAlign:"center" }}>No alerts.</td></tr>}
            {shown.map(a=>(
              <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"12px 16px", fontSize:14, fontWeight:500 }}>{a.device_name}</td>
                <td style={{ padding:"12px 16px", fontSize:13, maxWidth:260 }}>{a.trigger_condition}</td>
                <td style={{ padding:"12px 16px" }}><span style={sevStyle(a.severity)}>{a.severity}</span></td>
                <td style={{ padding:"12px 16px" }}><span style={statStyle(a.status)}>{a.status}</span></td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#94a3b8" }}>{new Date(a.created_at).toLocaleString()}</td>
                <td style={{ padding:"12px 16px" }}>
                  {a.status==="active" && <button onClick={()=>resolve(a.id)} style={{ fontSize:13, padding:"5px 12px", background:"#dcfce7", color:"#16a34a", border:"none", borderRadius:6, cursor:"pointer" }}>Resolve</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
