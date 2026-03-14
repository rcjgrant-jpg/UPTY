import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listIncidents, resolveIncident } from "../api/incidents";
import AppLayout from "../components/AppLayout";
import AlertMessage from "../components/AlertMessage";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function IncidentsPage() {
  const navigate = useNavigate();

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
    const interval = setInterval(loadIncidents, 5000);
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
    <AppLayout
      title="Incidents"
      subtitle="Track open and resolved monitor failures."
      actions={
        <div className="flex gap-3">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            {openIncidents.length} open
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-lavenderSoft px-4 py-2 text-sm font-semibold text-brand-text">
            {resolvedIncidents.length} resolved
          </div>
        </div>
      }
    >
      {loading && (
        <section className="app-card">
          <p className="text-sm text-brand-muted">Loading incidents...</p>
        </section>
      )}

      {error && (
        <AlertMessage type="error" text={error} />
      )}

      <IncidentSection
        title="Open incidents"
        incidents={openIncidents}
        emptyText="No open incidents."
        actionLabel="Mark resolved"
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
    </AppLayout>
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
    <section className="app-card overflow-hidden p-0">
      <div className="app-section-header bg-brand-lavenderSoft px-4 py-3">
        <h2 className="text-sm font-semibold text-brand-text">{title}</h2>
      </div>

      {incidents.length ? (
        <div className="divide-y divide-brand-border">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpenMonitor?.(incident.monitor?.id)}
                  className="break-all text-left text-sm font-medium text-brand-text hover:text-brand-blueDeep hover:underline"
                >
                  {incident.monitor?.url || "Unknown monitor"}
                </button>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      incident.is_resolved
                        ? "bg-brand-lavenderSoft text-brand-text"
                        : "bg-red-100 text-red-700",
                    ].join(" ")}
                  >
                    {incident.is_resolved ? "Resolved" : "Open"}
                  </span>

                  {incident.monitor?.current_state && (
                    <span
                      className={
                        incident.monitor.current_state === "UP"
                          ? "app-badge-up"
                          : "app-badge-down"
                      }
                    >
                      Monitor {incident.monitor.current_state}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-brand-muted">
                  Started: {formatDateTime(incident.started_at)}
                </div>

                <div className="mt-1 text-xs text-brand-muted">
                  Resolved: {formatDateTime(incident.resolved_at)}
                </div>

                {incident.resolved_by?.email && (
                  <div className="mt-1 text-xs text-brand-muted">
                    Resolved by: {incident.resolved_by.email}
                  </div>
                )}
              </div>

              {onAction ? (
                <button
                  type="button"
                  onClick={() => onAction(incident.id)}
                  disabled={actionLoadingId === incident.id}
                  className="app-button-primary disabled:opacity-60"
                >
                  {actionLoadingId === incident.id ? "Resolving..." : actionLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenMonitor?.(incident.monitor?.id)}
                  className="app-button-outline"
                >
                  View monitor
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-sm text-brand-muted">{emptyText}</div>
      )}
    </section>
  );
}
