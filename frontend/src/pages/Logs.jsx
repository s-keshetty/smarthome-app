import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

const typeColor = (t) => {
  if (t.includes("alert")) return { bg:"#fee2e2", color:"#dc2626" };
  if (t.includes("login") || t.includes("register")) return { bg:"#dbeafe", color:"#2563eb" };
  if (t.includes("device")) return { bg:"#dcfce7", color:"#16a34a" };
  return { bg:"#f1f5f9", color:"#64748b" };
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get("/logs").then(r=>setLogs(r.data)); }, []);
  return (
    <Layout>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>Activity logs</h2>
      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
            {["Time","Source","Event","Description"].map(h=>(
              <th key={h} style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#374151", textAlign:"left" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {logs.length===0 && <tr><td colSpan={4} style={{ padding:24, color:"#94a3b8", textAlign:"center" }}>No logs yet.</td></tr>}
            {logs.map(l => { const c = typeColor(l.event_type); return (
              <tr key={l.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"10px 16px", fontSize:13, color:"#94a3b8", whiteSpace:"nowrap" }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding:"10px 16px", fontSize:13, color:"#64748b" }}>{l.source}</td>
                <td style={{ padding:"10px 16px" }}><span style={{ fontSize:12, fontWeight:600, padding:"2px 8px", borderRadius:99, background:c.bg, color:c.color }}>{l.event_type}</span></td>
                <td style={{ padding:"10px 16px", fontSize:13 }}>{l.description}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
