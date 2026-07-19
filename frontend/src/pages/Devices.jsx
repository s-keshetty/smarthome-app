import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

const TYPES = ["server", "nas", "camera", "network"];
const inp = { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 };

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ name: "", type: "server", url: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", type: "server", url: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isAdmin = localStorage.getItem("role") === "admin";
  const navigate = useNavigate();

  async function load() {
    try { const res = await api.get("/devices"); setDevices(res.data); }
    catch { setError("Could not load devices"); }
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const payload = { name: form.name, type: form.type };
      if (form.url) payload.api_config = { url: form.url };
      await api.post("/devices", payload);
      setForm({ name: "", type: "server", url: "" });
      setSuccess("Device added!"); load();
    } catch (err) { setError(err.response?.data?.error || "Could not add device"); }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/devices/${id}`); load(); }
    catch { setError("Could not delete device"); }
  }

  function startEdit(device) {
    setError(""); setSuccess("");
    setEditingId(device.id);
    setEditForm({ name: device.name, type: device.type, url: device.api_config?.url || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", type: "server", url: "" });
  }

  async function handleEdit(e) {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const payload = { name: editForm.name, type: editForm.type, api_config: { url: editForm.url } };
      await api.put(`/devices/${editingId}`, payload);
      cancelEdit();
      setSuccess("Device updated!"); load();
    } catch (err) { setError(err.response?.data?.error || "Could not update device"); }
  }

  const statusC = s => s === "online" ? "#16a34a" : s === "offline" ? "#dc2626" : "#94a3b8";

  return (
    <Layout>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Devices</h2>
      {error && <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#16a34a", marginBottom: 12 }}>{success}</p>}

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Name", "Type", "Status", "Added", isAdmin ? "Action" : ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>No devices yet.</td></tr>
            )}
            {devices.map(d => editingId === d.id ? (
              <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td colSpan={5} style={{ padding: "12px 16px" }}>
                  <form onSubmit={handleEdit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 8, alignItems: "center" }}>
                    <input style={inp} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} aria-label="Device name" required />
                    <select style={inp} value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} aria-label="Device type">
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input style={inp} value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} aria-label="API URL" placeholder="API URL (optional)" />
                    <button type="submit" style={{ fontSize: 13, padding: "8px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Save</button>
                    <button type="button" onClick={cancelEdit} style={{ fontSize: 13, padding: "8px 12px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px" }}>
                  {/* Clickable name goes to device detail */}
                  <span
                    onClick={() => navigate(`/devices/${d.id}`)}
                    style={{ fontSize: 14, fontWeight: 500, color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
                  >
                    {d.name}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{d.type}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: statusC(d.status) }}>● {d.status}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(d.created_at).toLocaleDateString()}</td>
                {isAdmin && (
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => startEdit(d)} style={{ fontSize: 13, padding: "5px 12px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 6, cursor: "pointer", marginRight: 8 }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(d.id, d.name)} style={{ fontSize: 13, padding: "5px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add device</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Device name</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. NAS-2" required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Type</label>
                <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>API URL (optional)</label>
                <input style={inp} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="http://192.168.1.x" />
              </div>
              <button type="submit" style={{ padding: "9px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
