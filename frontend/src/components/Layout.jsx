import { NavLink, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const isAdmin = localStorage.getItem("role") === "admin";
  function logout() { localStorage.clear(); navigate("/login"); }

  const links = [
    { to: "/dashboard",  label: "Dashboard"  },
    { to: "/devices",    label: "Devices"    },
    { to: "/alerts",     label: "Alerts"     },
    { to: "/logs",       label: "Logs"       },
    { to: "/automation", label: "Automation" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 210, background: "#1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 16px", fontSize: 16, fontWeight: 700, color: "#fff", borderBottom: "1px solid #334155" }}>
          Smart Home
        </div>
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
              display: "block", padding: "11px 20px", fontSize: 14, textDecoration: "none",
              color: isActive ? "#fff" : "#94a3b8",
              background: isActive ? "#2563eb" : "transparent",
            })}>{l.label}</NavLink>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #334155", fontSize: 13, color: "#64748b" }}>
          {username} {isAdmin && <span style={{ color: "#2563eb", fontWeight: 600 }}>· admin</span>}
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button onClick={logout} style={{ fontSize: 13, padding: "6px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer" }}>
            Log out
          </button>
        </div>
        <div style={{ flex: 1, padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
