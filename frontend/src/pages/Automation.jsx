import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

const blank = { name:"", device_type:"nas", metric_type:"storage", threshold:"", action:"send alert" };
const inp = { width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14 };

export default function Automation() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() { const res = await api.get("/automation"); setRules(res.data); }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault(); setError(""); setSuccess("");
    try { await api.post("/automation", form); setForm(blank); setSuccess("Rule created!"); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not create rule"); }
  }
  async function toggle(id) { await api.patch(`/automation/${id}/toggle`); load(); }
  async function del(id) { if (!window.confirm("Delete?")) return; await api.delete(`/automation/${id}`); load(); }

  return (
    <Layout>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>Automation rules</h2>
      {error && <p style={{ color:"#dc2626", marginBottom:12 }}>{error}</p>}
      {success && <p style={{ color:"#16a34a", marginBottom:12 }}>{success}</p>}
      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", marginBottom:24, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
            {["Name","Device type","Metric","Threshold","Enabled",""].map(h=>(
              <th key={h} style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#374151", textAlign:"left" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rules.length===0 && <tr><td colSpan={6} style={{ padding:24, color:"#94a3b8", textAlign:"center" }}>No rules yet.</td></tr>}
            {rules.map(r=>(
              <tr key={r.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"12px 16px", fontSize:14, fontWeight:500 }}>{r.name}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#64748b" }}>{r.device_type}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#64748b" }}>{r.metric_type}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>&gt; {r.threshold}</td>
                <td style={{ padding:"12px 16px" }}>
                  <button onClick={()=>toggle(r.id)} style={{ padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:600, border:"none", cursor:"pointer", background:r.enabled?"#dcfce7":"#f1f5f9", color:r.enabled?"#16a34a":"#64748b" }}>
                    {r.enabled?"On":"Off"}
                  </button>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <button onClick={()=>del(r.id)} style={{ fontSize:13, padding:"5px 12px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:6, cursor:"pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Add rule</h3>
        <form onSubmit={handleAdd}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Rule name</label>
              <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. High storage" required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Device type</label>
              <select style={inp} value={form.device_type} onChange={e=>setForm(f=>({...f,device_type:e.target.value}))}>
                {["server","nas","camera","network"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Metric</label>
              <select style={inp} value={form.metric_type} onChange={e=>setForm(f=>({...f,metric_type:e.target.value}))}>
                {["uptime","storage","camera_status","bandwidth"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Threshold</label>
              <input style={inp} type="number" value={form.threshold} onChange={e=>setForm(f=>({...f,threshold:e.target.value}))} placeholder="e.g. 80" required />
            </div>
          </div>
          <button type="submit" style={{ padding:"10px 24px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" }}>Create rule</button>
        </form>
      </div>
    </Layout>
  );
}
