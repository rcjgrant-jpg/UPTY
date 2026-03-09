import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import IncidentsPage from "./pages/IncidentsPage";
import InvitePage from "./pages/InvitePage";
import LoginPage from "./pages/LoginPage";
import MonitorDetailPage from "./pages/MonitorDetailPage";
import NewMonitorPage from "./pages/NewMonitorPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import TeamPage from "./pages/TeamPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/monitors/new" element={<NewMonitorPage />} />
        <Route path="/monitors/:id" element={<MonitorDetailPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<div className="p-6">Not found</div>} />
    </Routes>
  );
}