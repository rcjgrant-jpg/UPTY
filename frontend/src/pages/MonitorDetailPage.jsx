import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteMonitor, getMonitor } from "../api/monitors";
import AppLayout from "../components/AppLayout";
import AlertMessage from "../components/AlertMessage";

function formatDateTime(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function MonitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadMonitor = async () => {
    try {
      setError("");
      const data = await getMonitor(id);
      setMonitor(data);
    } catch (err) {
      setError(err.message || "Failed to load monitor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitor();
    const interval = setInterval(loadMonitor, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this monitor?");
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteMonitor(id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to delete monitor");
      setDeleting(false);
    }
  };

  return (
    <AppLayout
      title={monitor?.url || "Monitor Details"}
      subtitle={
        monitor ? `Created: ${formatDateTime(monitor.created_at)}` : "Monitor details"
      }
      actions={
        monitor && (
          <div className="flex flex-wrap gap-3">
            <span
              className={
                monitor.current_state === "UP"
                  ? "app-badge-up"
                  : "app-badge-down"
              }
            >
              {monitor.current_state}
            </span>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="app-button-outline"
            >
              Back to dashboard
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )
      }
    >
      {loading ? (
        <section className="app-card">
          <p className="text-sm text-brand-muted">Loading monitor...</p>
        </section>
      ) : error ? (
        <AlertMessage type="error" text={error} />
      ) : (
        <>
          <section className="app-card bg-brand-yellowSoft">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard label="Interval" value={`${monitor.interval}s`} />
              <InfoCard label="Timeout" value={`${monitor.timeout}ms`} />
              <InfoCard
                label="Expected status"
                value={String(monitor.expected_status)}
              />
              <InfoCard
                label="Failure threshold"
                value={String(monitor.failure_threshold)}
              />
            </div>

            <div className="mt-4">
              <InfoCard
                label="Last checked"
                value={formatDateTime(monitor.last_checked_at)}
                
              />
            </div>
          </section>

          <section className="app-card overflow-hidden p-0">
            <div className="app-section-header bg-brand-lavenderSoft px-4 py-3">
              <h2 className="text-sm font-semibold text-brand-text">
                Recent Results
              </h2>
            </div>

            {monitor.recent_results?.length ? (
              <div className="max-h-[420px] overflow-y-auto">
                <div className="divide-y divide-brand-border">
                  {monitor.recent_results.map((result) => (
                    <div
                      key={result.id}
                      className="grid grid-cols-1 gap-3 px-4 py-3 text-sm sm:grid-cols-4"
                    >
                      <ResultItem
                        label="Checked"
                        value={formatDateTime(result.checked_at)}
                      />

                      <ResultItem
                        label="Status code"
                        value={result.status_code ?? "—"}
                      />

                      <ResultItem
                        label="Latency"
                        value={
                          result.latency_ms != null
                            ? `${result.latency_ms}ms`
                            : "—"
                        }
                      />

                      <div>
                        <div className="text-xs text-brand-muted">Error</div>
                        <div
                          className={
                            result.error_message
                              ? "break-words text-red-600"
                              : "text-brand-text"
                          }
                        >
                          {result.error_message || "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-6 text-sm text-brand-muted">
                No monitor results yet.
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}

function InfoCard({ label, value, accent = false }) {
  return (
    <div className={accent ? "app-card-accent p-4" : "app-card p-4"}>
      <div className="text-xs font-medium text-brand-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-brand-text">{value}</div>
    </div>
  );
}

function ResultItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-brand-muted">{label}</div>
      <div className="text-brand-text">{value}</div>
    </div>
  );
}