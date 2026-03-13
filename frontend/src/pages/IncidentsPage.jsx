import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listIncidents, resolveIncident } from "../api/incidents";
import Sidebar from "../components/SideBar";
import useOpenIncidentCount from "../hooks/useOpenIncidentCount";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function IncidentsPage() {
  const navigate = useNavigate();
  const openIncidentCount = useOpenIncidentCount();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  const loadIncidents = async () => {
    try {
      setError("");
      const data = await listIncidents();
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (incidentId) => {
    setResolvingId(incidentId);
    setError("");

    try {
      const updated = await resolveIncident(incidentId);

      setIncidents((current) =>
        current.map((incident) =>
          incident.id === incidentId ? updated : incident
        )
      );
    } catch (err) {
      setError(err.message || "Failed to resolve incident");
    } finally {
      setResolvingId(null);
    }
  };

  const openIncidents = incidents.filter((incident) => !incident.is_resolved);
  const resolvedIncidents = incidents.filter((incident) => incident.is_resolved);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar openIncidentCount={openIncidentCount} />

          <main className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Incidents</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Track open and resolved monitor failures.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                    {openIncidents.length} open
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                    {resolvedIncidents.length} resolved
                  </div>
                </div>
              </div>

              {loading && (
                <p className="mt-4 text-sm text-gray-500">Loading incidents...</p>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </section>

            <IncidentSection
              title="Open incidents"
              incidents={openIncidents}
              emptyText="No open incidents."
              actionLabel="Resolve"
              actionLoadingId={resolvingId}
              onAction={handleResolve}
              onOpenMonitor={(monitorId) => navigate(`/monitors/${monitorId}`)}
            />

            <IncidentSection
              title="Resolved incidents"
              incidents={resolvedIncidents}
              emptyText="No resolved incidents."
              onOpenMonitor={(monitorId) => navigate(`/monitors/${monitorId}`)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function IncidentSection({
  title,
  incidents,
  emptyText,
  actionLabel,
  onAction,
  actionLoadingId,
  onOpenMonitor,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      {incidents.length ? (
        <div className="divide-y divide-gray-100">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpenMonitor?.(incident.monitor?.id)}
                  className="break-all text-left text-sm font-medium text-gray-900 hover:underline"
                >
                  {incident.monitor?.url || "Unknown monitor"}
                </button>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      incident.is_resolved
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700",
                    ].join(" ")}
                  >
                    {incident.is_resolved ? "Resolved" : "Open"}
                  </span>

                  {incident.monitor?.current_state && (
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        incident.monitor.current_state === "UP"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      Monitor {incident.monitor.current_state}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Started: {formatDateTime(incident.started_at)}
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Resolved: {formatDateTime(incident.resolved_at)}
                </div>

                {incident.resolved_by?.email && (
                  <div className="mt-1 text-xs text-gray-500">
                    Resolved by: {incident.resolved_by.email}
                  </div>
                )}
              </div>

              {onAction ? (
                <button
                  onClick={() => onAction(incident.id)}
                  disabled={actionLoadingId === incident.id}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {actionLoadingId === incident.id ? "Resolving..." : actionLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenMonitor?.(incident.monitor?.id)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  View monitor
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-sm text-gray-500">{emptyText}</div>
      )}
    </section>
  );
}


