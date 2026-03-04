import Sidebar from "../components/SideBar";

export default function MonitorDetailPage() {
  // Later: fetch this from Django by ID (e.g. /api/monitors/:id)
  const monitor = {
    id: "2",
    url: "api.example.com",
    path: "/health",
    status: "UP", // "UP" | "DOWN"
    lastCheck: "12s ago",
    latency: "124ms",
    settings: {
      checkEvery: "60s",
      timeout: "5000ms",
      expected: "200",
      failuresBeforeAlert: "3",
      alertsTo: "you@company.com (you)",
    },
    recentResults: [
      { time: "2026-02-01 14:32:01", status: "200", latency: "124ms", ok: true, message: "" },
      { time: "2026-02-01 14:31:01", status: "200", latency: "118ms", ok: true, message: "" },
      { time: "2026-02-01 14:30:01", status: "503", latency: "4820ms", ok: false, message: "Connection timeout" },
      { time: "2026-02-01 14:29:01", status: "200", latency: "95ms", ok: true, message: "" },
    ],
  };

  const isUp = monitor.status === "UP";


  const handleDelete = () => {
    console.log("Delete monitor", monitor.id);
    // Later: call DELETE /api/monitors/:id then navigate back
  };

  const handleLoadMore = () => {
    console.log("Load more results");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            

            {/* Title row */}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {monitor.url}
                  <span className="text-gray-400">{monitor.path}</span>
                </h1>

                <span
                  className={[
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
                    isUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
                  ].join(" ")}
                >
                  {monitor.status}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>

            {/* Stats cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard label="STATUS" value={monitor.status} />
              <StatCard label="LAST CHECK" value={monitor.lastCheck} />
              <StatCard label="LATENCY" value={monitor.latency} />
            </div>

            {/* Settings */}
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900">Settings</h2>
              <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="grid gap-2 sm:grid-cols-4 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400">Check every:</span>{" "}
                    <span className="text-gray-700">{monitor.settings.checkEvery}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timeout:</span>{" "}
                    <span className="text-gray-700">{monitor.settings.timeout}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected:</span>{" "}
                    <span className="text-gray-700">{monitor.settings.expected}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Failures before alert:</span>{" "}
                    <span className="text-gray-700">{monitor.settings.failuresBeforeAlert}</span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-gray-400">Alerts go to:</span>{" "}
                  <span className="text-gray-700">{monitor.settings.alertsTo}</span>
                </div>
              </div>
            </section>

            {/* Recent results */}
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900">Recent Results</h2>

              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-3 bg-gray-50 px-4 py-3 text-[11px] font-semibold tracking-wide text-gray-500">
                  <div className="col-span-5">TIME</div>
                  <div className="col-span-2">STATUS</div>
                  <div className="col-span-2">LATENCY</div>
                  <div className="col-span-3">RESULT</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100 bg-white">
                  {monitor.recentResults.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                      <div className="col-span-5 text-gray-600">{r.time}</div>
                      <div className="col-span-2 text-gray-700">{r.status}</div>
                      <div className="col-span-2 text-gray-700">{r.latency}</div>
                      <div className="col-span-3">
                        {r.ok ? (
                          <span className="text-green-700">✓</span>
                        ) : (
                          <span className="text-red-600">
                            × <span className="ml-2">{r.message}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Load more ↓
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-[11px] font-semibold tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}