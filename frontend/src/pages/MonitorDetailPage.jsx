import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteMonitor, getMonitor } from "../api/monitors";
import Sidebar from "../components/SideBar";
import useOpenIncidentCount from "../hooks/useOpenIncidentCount";

function formatDateTime(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function MonitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const openIncidentCount = useOpenIncidentCount();

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
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar openIncidentCount={openIncidentCount} />

          <main className="space-y-6">
            {loading ? (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Loading monitor...</p>
              </section>
            ) : error ? (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-red-600">{error}</p>
              </section>
            ) : (
              <>
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mb-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        ← Back to dashboard
                      </button>

                      <h1 className="break-all text-2xl font-semibold text-gray-900">
                        {monitor.url}
                      </h1>

                      <p className="mt-2 text-sm text-gray-500">
                        Created: {formatDateTime(monitor.created_at)}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <span
                        className={[
                          "inline-flex h-fit rounded-full px-3 py-1 text-xs font-semibold",
                          monitor.current_state === "UP"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        ].join(" ")}
                      >
                        {monitor.current_state}
                      </span>

                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Recent Results
                    </h2>
                  </div>

                  {monitor.recent_results?.length ? (
                    <div className="max-h-[420px] overflow-y-auto">
                      <div className="divide-y divide-gray-100">
                        {monitor.recent_results.map((result) => (
                          <div
                            key={result.id}
                            className="grid grid-cols-1 gap-2 px-4 py-3 text-sm sm:grid-cols-4"
                          >
                            <div>
                              <div className="text-xs text-gray-500">Checked</div>
                              <div className="text-gray-900">
                                {formatDateTime(result.checked_at)}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500">Status code</div>
                              <div className="text-gray-900">
                                {result.status_code ?? "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500">Latency</div>
                              <div className="text-gray-900">
                                {result.latency_ms != null ? `${result.latency_ms}ms` : "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500">Error</div>
                              <div className={result.error_message ? "text-red-600 break-words" : "text-gray-900"}>
                                {result.error_message || "—"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-sm text-gray-500">
                      No monitor results yet.
                    </div>
                  )}
                </section>

              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
