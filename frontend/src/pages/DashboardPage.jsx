import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMonitors } from "../api/monitors";
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMonitors = async () => {
      try {
        const data = await listMonitors();
        setMonitors(data.monitors || []);
      } catch (err) {
        setError(err.message || "Failed to load monitors");
      } finally {
        setLoading(false);
      }
    };

    loadMonitors();
  }, []);

  const counts = useMemo(() => {
    const up = monitors.filter((m) => m.current_state === "UP").length;
    const down = monitors.filter((m) => m.current_state === "DOWN").length;
    return { total: monitors.length, up, down };
  }, [monitors]);

  const handleMonitorClick = (monitorId) => {
    navigate(`/monitors/${monitorId}`);
  };

  const handleNewMonitor = () => {
    navigate("/monitors/new");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />

          <main className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Monitors
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {counts.total} monitors · {counts.up} up · {counts.down} down
                </p>
              </div>

              <button
                onClick={handleNewMonitor}
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                + New Monitor
              </button>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-3 border-b border-gray-200 px-4 py-3 text-[11px] font-semibold tracking-wide text-gray-500">
                <div className="col-span-6">URL</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">INTERVAL</div>
                <div className="col-span-2">LAST CHECK</div>
              </div>

              {loading ? (
                <div className="px-4 py-6 text-sm text-gray-500">Loading monitors...</div>
              ) : error ? (
                <div className="px-4 py-6 text-sm text-red-600">{error}</div>
              ) : monitors.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {monitors.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMonitorClick(m.id)}
                      className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="col-span-6">
                        <div className="break-all text-sm font-medium text-gray-900 hover:underline">
                          {m.url}
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            m.current_state === "UP"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          ].join(" ")}
                        >
                          {m.current_state}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center text-sm text-gray-600">
                        {m.interval}s
                      </div>

                      <div className="col-span-2 flex items-center text-sm text-gray-500">
                        {formatLastChecked(m.last_checked_at)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-500">No monitors yet.</p>
                  <button
                    onClick={handleNewMonitor}
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