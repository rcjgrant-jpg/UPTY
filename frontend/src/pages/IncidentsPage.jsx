import { useEffect, useState } from "react";
import { listIncidents, resolveIncident } from "../api/incidents";
import Sidebar from "../components/SideBar";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  const loadIncidents = async () => {
    try {
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

  const openIncidents = incidents.filter((i) => !i.is_resolved);
  const resolvedIncidents = incidents.filter((i) => i.is_resolved);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />

          <main className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-gray-900">Incidents</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track open and resolved monitor failures.
              </p>

              {loading && <p className="mt-4 text-sm text-gray-500">Loading incidents...</p>}
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </section>

            <IncidentSection
              title="Open incidents"
              incidents={openIncidents}
              emptyText="No open incidents."
              actionLabel="Resolve"
              actionLoadingId={resolvingId}
              onAction={handleResolve}
            />

            <IncidentSection
              title="Resolved incidents"
              incidents={resolvedIncidents}
              emptyText="No resolved incidents."
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
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {incident.monitor?.url}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Started: {formatDateTime(incident.started_at)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Resolved: {formatDateTime(incident.resolved_at)}
                </div>
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
                <span className="text-xs font-medium text-gray-500">
                  {incident.resolved_by?.email
                    ? `Resolved by ${incident.resolved_by.email}`
                    : "Resolved"}
                </span>
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

