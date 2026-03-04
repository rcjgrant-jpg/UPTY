import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";

export default function Dashboard() {
  const navigate = useNavigate();
  // In real app this will come from your API
  const [monitors] = useState([
    {
      id: "1",
      url: "staging.mysite.com",
      path: "/health",
      status: "DOWN",
      latency: null,
      lastCheck: "3m ago",
    },
    {
      id: "2",
      url: "api.example.com",
      path: "/health",
      status: "UP",
      latency: "124ms",
      lastCheck: "12s ago",
    },
    {
      id: "3",
      url: "www.mysite.com",
      path: "/health",
      status: "UP",
      latency: "89ms",
      lastCheck: "45s ago",
    },
  ]);

  const sortedMonitors = useMemo(() => {
    // Matches your Figma hint: "DOWN first, then by last checked"
    // We can’t truly sort by "3m ago" reliably without parsing,
    // but we can at least do DOWN first while keeping original order.
    const down = monitors.filter((m) => m.status === "DOWN");
    const up = monitors.filter((m) => m.status === "UP");
    return [...down, ...up];
  }, [monitors]);

  const counts = useMemo(() => {
    const up = monitors.filter((m) => m.status === "UP").length;
    const down = monitors.filter((m) => m.status === "DOWN").length;
    return { total: monitors.length, up, down };
  }, [monitors]);

  const handleMonitorClick = (monitorId) => {
    console.log(`Navigate to /monitors/${monitorId}`);
    // If using react-router:
    // navigate(`/monitors/${monitorId}`)
  };

  const handleNewMonitor = () => {
    navigate("/monitors/new");
  };

  const handleAddFirstMonitor = () => {
    console.log("Add first monitor");
  };

  const navItems = [
    { label: "Dashboard", active: true, onClick: () => console.log("Dashboard") },
    { label: "Incidents", active: false, onClick: () => console.log("Incidents") },
    { label: "Team", active: false, onClick: () => console.log("Team") },
    { label: "Settings", active: false, onClick: () => console.log("Settings") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* tiny route label like the figma export */}
        
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          
          <Sidebar />

          {/* Main */}
          <main className="space-y-4">
            {/* Header row */}
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

            {/* Table card */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Head */}
              <div className="grid grid-cols-12 gap-3 border-b border-gray-200 px-4 py-3 text-[11px] font-semibold tracking-wide text-gray-500">
                <div className="col-span-6">URL</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">LATENCY</div>
                <div className="col-span-2">LAST CHECK</div>
              </div>

              {/* Body */}
              {sortedMonitors.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {sortedMonitors.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMonitorClick(m.id)}
                      className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="col-span-6">
                        <div className="text-sm font-medium text-gray-900 hover:underline">
                          {m.url}
                        </div>
                        <div className="text-xs text-gray-500">{m.path}</div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold",
                            m.status === "UP"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700",
                          ].join(" ")}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center text-sm text-gray-900">
                        {m.latency ?? <span className="text-gray-400">—</span>}
                      </div>

                      <div className="col-span-2 flex items-center text-sm text-gray-500">
                        {m.lastCheck}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <div className="text-xs font-semibold tracking-wide text-gray-400">
                    EMPTY STATE:
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    No monitors yet.
                  </div>
                  <button
                    onClick={handleAddFirstMonitor}
                    className="mt-3 text-sm text-gray-600 hover:underline"
                  >
                    + Add your first monitor
                  </button>
                </div>
              )}
            </section>

            {/* Notes like the figma mock */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
              <div>Each row is clickable → /monitors/:id</div>
              <div className="mt-1">
                Sorted: DOWN first, then by last checked
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}