import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token",    res.data.token);
      localStorage.setItem("role",     res.data.user.role);
      localStorage.setItem("username", res.data.user.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  }

  const inp = { width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #d1d5db", marginBottom:16, fontSize:14 };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9" }}>
      <div style={{ background:"#fff", borderRadius:12, padding:40, width:380, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Smart Home</h1>
        <p style={{ color:"#64748b", fontSize:14, marginBottom:28 }}>Sign in to your dashboard</p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Email</label>
          <input type="email" style={inp} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
          <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Password</label>
          <input type="password" style={inp} value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required />
          {error && <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width:"100%", padding:11, background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
