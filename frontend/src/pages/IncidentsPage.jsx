import Sidebar from "../components/SideBar";

export default function IncidentsPage() {
  // Later: fetch from Django (e.g. GET /api/incidents/)
  const openIncidents = [
    {
      id: "open-1",
      url: "staging.mysite.com",
      subtitle: "Down since Feb 1, 2026 at 14:04",
      duration: "Duration: 28 minutes",
    },
    {
      id: "open-2",
      url: "api.example.com/health",
      subtitle: "Down since Feb 1, 2026 at 09:04",
      duration: "Duration: 5 hours 28 minutes",
    },
  ];

  const resolvedIncidents = [
    {
      id: "res-1",
      url: "www.mysite.com",
      meta: "Jan 28, 14:45 → Jan 28, 14:52 (7 min) · Resolved by alice@company.com",
    },
    {
      id: "res-2",
      url: "api.example.com/health",
      meta: "Jan 25, 09:04 → Jan 25, 09:14 (10 min) · Resolved by john@company.com",
    },
    {
      id: "res-3",
      url: "staging.mysite.com",
      meta: "Jan 20, 17:30 → Jan 20, 18:45 (1h 15min) · Resolved by john@company.com",
    },
  ];

  const handleResolve = (incidentId) => {
    console.log("Resolve incident:", incidentId);
    // Later: POST /api/incidents/:id/resolve
  };

  const handleLoadMore = () => {
    console.log("Load more incidents");
  };

  const openCount = openIncidents.length;
  const resolvedCount = resolvedIncidents.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <h1 className="text-2xl font-semibold text-gray-900">Incidents</h1>
            <p className="mt-1 text-sm text-gray-500">
              {openCount} open · {resolvedCount} resolved
            </p>

            {/* Open */}
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900">Open</h2>

              <div className="mt-3 space-y-3">
                {openIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-3 w-3 rounded-full bg-red-500" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {inc.url}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {inc.subtitle}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {inc.duration}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResolve(inc.id)}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Resolved */}
            <section className="mt-10">
              <h2 className="text-sm font-semibold text-gray-900">Resolved</h2>

              <div className="mt-3 space-y-3">
                {resolvedIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-green-700">✓</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {inc.url}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {inc.meta}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
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