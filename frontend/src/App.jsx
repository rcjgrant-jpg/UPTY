import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MonitorDetailPage from "./pages/MonitorDetailPage";
import IncidentsPage from "./pages/IncidentsPage";
import NewMonitorPage from "./pages/NewMonitorPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<div>Not found</div>} />
      <Route path="/monitors/:id" element={<MonitorDetailPage />} />
      <Route path="/incidents" element={<IncidentsPage />} />
      <Route path="/monitors/new" element={<NewMonitorPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );
}

// export default function App() {
//   return <h1 style={{ padding: 24 }}>React is rendering</h1>;
// }