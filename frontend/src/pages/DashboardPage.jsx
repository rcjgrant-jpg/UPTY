import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMonitors } from "../api/monitors";
import { listIncidents } from "../api/incidents";
import AppLayout from "../components/AppLayout";

function formatLastChecked(value) {
  if (!value) return "Never";

  const checked = new Date(value);
  const now = new Date();
  const diffSeconds = Math.max(0, Math.floor((now - checked) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [monitors, setMonitors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setError("");

      const [monitorData, incidentData] = await Promise.all([
        listMonitors(),
        listIncidents(),
      ]);

      setMonitors(monitorData.monitors || []);
      setIncidents(incidentData.incidents || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const up = monitors.filter((m) => m.current_state === "UP").length;
    const down = monitors.filter((m) => m.current_state === "DOWN").length;
    const openIncidents = incidents.filter((i) => !i.is_resolved);

    return {
      total: monitors.length,
      up,
      down,
      openIncidentCount: openIncidents.length,
      openIncidents,
    };
  }, [monitors, incidents]);

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`${stats.total} monitors · ${stats.up} up · ${stats.down} down`}
      actions={
        <button
          onClick={() => navigate("/monitors/new")}
          className="app-button-primary"
        >
          + New Monitor
        </button>
      }
    >
      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </section>
      )}

      {stats.openIncidentCount > 0 && (
        <section className="app-card border-red-200 bg-red-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-red-800">
                Active incident alert
              </h2>
              <p className="mt-1 text-sm text-red-700">
                {stats.openIncidentCount} open incident
                {stats.openIncidentCount === 1 ? "" : "s"} need attention.
              </p>
            </div>

            <button
              onClick={() => navigate("/incidents")}
              className="app-button-outline border-red-300 text-red-700 hover:bg-red-100"
            >
              View incidents
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {stats.openIncidents.slice(0, 3).map((incident) => (
              <div
                key={incident.id}
                className="rounded-xl border border-red-100 bg-white px-4 py-3"
              >
                <div className="break-all text-sm font-medium text-brand-text">
                  {incident.monitor?.url}
                </div>
                <div className="mt-1 text-xs text-brand-muted">
                  Started: {formatDateTime(incident.started_at)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total monitors" value={stats.total} />
        <StatCard label="Currently up" value={stats.up} />
        <StatCard label="Open incidents" value={stats.openIncidentCount} />
      </section>

      <section className="app-card overflow-hidden p-0">
        <div className="grid grid-cols-12 gap-3 app-section-header text-[11px] font-semibold tracking-wide text-brand-muted">
          <div className="col-span-6">URL</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2">INTERVAL</div>
          <div className="col-span-2">LAST CHECK</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-brand-muted">
            Loading monitors...
          </div>
        ) : monitors.length > 0 ? (
          <div className="divide-y divide-brand-border">
            {monitors.map((monitor) => (
              <button
                key={monitor.id}
                onClick={() => navigate(`/monitors/${monitor.id}`)}
                className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left transition hover:bg-brand-cream"
              >
                <div className="col-span-6">
                  <div className="break-all text-sm font-medium text-brand-text hover:underline">
                    {monitor.url}
                  </div>
                </div>

                <div className="col-span-2 flex items-center">
                  <span
                    className={
                      monitor.current_state === "UP"
                        ? "app-badge-up"
                        : "app-badge-down"
                    }
                  >
                    {monitor.current_state}
                  </span>
                </div>

                <div className="col-span-2 flex items-center text-sm text-brand-text">
                  {monitor.interval}s
                </div>

                <div className="col-span-2 flex items-center text-sm text-brand-muted">
                  {formatLastChecked(monitor.last_checked_at)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-brand-muted">No monitors yet.</p>
            <button
              onClick={() => navigate("/monitors/new")}
              className="mt-4 app-button-primary"
            >
              Add your first monitor
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function StatCard({ label, value}) {
  return (
    <div className={"app-metric-card"}>
      <div className="text-xs font-medium text-brand-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-brand-text">{value}</div>
    </div>
  );
}