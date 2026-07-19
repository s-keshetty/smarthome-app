import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Devices      from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Alerts       from "./pages/Alerts";
import Logs         from "./pages/Logs";
import Automation   from "./pages/Automation";
import Admin        from "./pages/Admin";

function Guard({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function AdminGuard({ children }) {
  const role = localStorage.getItem("role");
  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"         element={<Login />} />
        <Route path="/dashboard"     element={<Guard><Dashboard /></Guard>} />
        <Route path="/devices"       element={<Guard><Devices /></Guard>} />
        <Route path="/devices/:id"   element={<Guard><DeviceDetail /></Guard>} />
        <Route path="/alerts"        element={<Guard><Alerts /></Guard>} />
        <Route path="/logs"          element={<Guard><Logs /></Guard>} />
        <Route path="/automation"    element={<Guard><Automation /></Guard>} />
        <Route path="/admin"         element={<AdminGuard><Admin /></AdminGuard>} />
        <Route path="*"              element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
