import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMonitors } from "../api/monitors";
import { listIncidents } from "../api/incidents";
import Sidebar from "../components/SideBar";

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
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar openIncidentCount={stats.openIncidentCount} />

          <main className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {stats.total} monitors · {stats.up} up · {stats.down} down
                </p>
              </div>

              <button
                onClick={() => navigate("/monitors/new")}
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                + New Monitor
              </button>
            </div>

            {error && (
              <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </section>
            )}

            {stats.openIncidentCount > 0 && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
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
                    className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
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
                      <div className="text-sm font-medium text-gray-900 break-all">
                        {incident.monitor?.url}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
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

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-3 border-b border-gray-200 px-4 py-3 text-[11px] font-semibold tracking-wide text-gray-500">
                <div className="col-span-6">URL</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">INTERVAL</div>
                <div className="col-span-2">LAST CHECK</div>
              </div>

              {loading ? (
                <div className="px-4 py-6 text-sm text-gray-500">Loading monitors...</div>
              ) : monitors.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {monitors.map((monitor) => (
                    <button
                      key={monitor.id}
                      onClick={() => navigate(`/monitors/${monitor.id}`)}
                      className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="col-span-6">
                        <div className="break-all text-sm font-medium text-gray-900 hover:underline">
                          {monitor.url}
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            monitor.current_state === "UP"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          ].join(" ")}
                        >
                          {monitor.current_state}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center text-sm text-gray-600">
                        {monitor.interval}s
                      </div>

                      <div className="col-span-2 flex items-center text-sm text-gray-500">
                        {formatLastChecked(monitor.last_checked_at)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-500">No monitors yet.</p>
                  <button
                    onClick={() => navigate("/monitors/new")}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Add your first monitor
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
