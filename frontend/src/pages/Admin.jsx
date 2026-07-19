import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const myId = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id;

  async function load() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      setError("Could not load users. Make sure you are logged in as admin.");
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(user) {
    setError(""); setSuccess("");
    const newRole = user.role === "admin" ? "standard" : "admin";
    try {
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      setSuccess(`${user.username} is now ${newRole}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not change role");
    }
  }

  async function toggleStatus(user) {
    setError(""); setSuccess("");
    try {
      await api.patch(`/users/${user.id}/status`);
      setSuccess(`${user.username} status updated`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update status");
    }
  }

  const roleStyle = r => ({
    fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
    background: r === "admin" ? "#dbeafe" : "#f1f5f9",
    color: r === "admin" ? "#2563eb" : "#64748b",
  });

  const statusStyle = s => ({
    fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
    background: s === "active" ? "#dcfce7" : "#fee2e2",
    color: s === "active" ? "#16a34a" : "#dc2626",
  });

  return (
    <Layout>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Admin — User Management</h2>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Manage user roles and account status. Admin only.</p>

      {error && <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#16a34a", marginBottom: 12 }}>{success}</p>}

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Username", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>No users found.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9", background: u.id === myId ? "#fffbeb" : "white" }}>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>
                  {u.username} {u.id === myId && <span style={{ fontSize: 11, color: "#94a3b8" }}>(you)</span>}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: "12px 16px" }}><span style={roleStyle(u.role)}>{u.role}</span></td>
                <td style={{ padding: "12px 16px" }}><span style={statusStyle(u.status)}>{u.status}</span></td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                  {u.id !== myId && <>
                    <button onClick={() => toggleRole(u)} style={{
                      fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                      background: "#dbeafe", color: "#2563eb", fontWeight: 600
                    }}>
                      Make {u.role === "admin" ? "standard" : "admin"}
                    </button>
                    <button onClick={() => toggleStatus(u)} style={{
                      fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                      background: u.status === "active" ? "#fee2e2" : "#dcfce7",
                      color: u.status === "active" ? "#dc2626" : "#16a34a",
                      fontWeight: 600
                    }}>
                      {u.status === "active" ? "Disable" : "Enable"}
                    </button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
