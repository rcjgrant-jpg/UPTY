import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const IncidentsPage = lazy(() => import("./pages/IncidentsPage"));
const InvitePage = lazy(() => import("./pages/InvitePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MonitorDetailPage = lazy(() => import("./pages/MonitorDetailPage"));
const NewMonitorPage = lazy(() => import("./pages/NewMonitorPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
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
    </Suspense>
  );
}