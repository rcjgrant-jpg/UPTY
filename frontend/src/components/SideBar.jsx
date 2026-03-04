import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/incidents", label: "Incidents" },
    { to: "/team", label: "Team" },
    // Add later when you create the route:
    // { to: "/team", label: "Team" },
  ];

  const baseItem =
    "flex w-full items-center gap-3 px-3 py-2 text-sm transition";

  const itemClass = ({ isActive }) =>
    [
      baseItem,
      isActive
        ? "bg-gray-100 font-semibold text-gray-900"
        : "bg-white text-gray-600 hover:bg-gray-50",
    ].join(" ");

  const Icon = ({ isActive }) => (
    <span className={["h-4 w-4 rounded", isActive ? "bg-gray-300" : "bg-gray-200"].join(" ")} />
  );

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Brand */}
      <NavLink to="/dashboard" className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100" />
        <div className="text-sm font-semibold text-gray-900">Upty</div>
      </NavLink>

      {/* Grouped nav (no “grey above first / below last”) */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        {navItems.map((item, idx) => (
          <div key={item.to} className={idx !== 0 ? "border-t border-gray-200" : ""}>
            <NavLink to={item.to} end className={itemClass}>
              {({ isActive }) => (
                <>
                  <Icon isActive={isActive} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </div>
        ))}
      </div>

      {/* Settings pinned to bottom, also grouped + clipped */}
      <div className="mt-auto pt-6">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <NavLink to="/settings" end className={itemClass}>
            {({ isActive }) => (
              <>
                <Icon isActive={isActive} />
                <span>Settings</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </aside>
  );
}