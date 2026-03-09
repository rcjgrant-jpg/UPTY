import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user, setUser } = useAuth();

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/incidents", label: "Incidents" },
    { to: "/team", label: "Team" },
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
    <span
      className={[
        "h-4 w-4 rounded",
        isActive ? "bg-gray-300" : "bg-gray-200",
      ].join(" ")}
    />
  );

  const handleLogout = async () => {
  try {
    await logout();
  } catch (err) {
    console.error("Logout failed:", err);
    setUser(null);
  } finally {
    navigate("/login", { replace: true });
  }
};

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <NavLink to="/dashboard" className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100" />
        <div>
          <div className="text-sm font-semibold text-gray-900">Upty</div>
          {user?.email && (
            <div className="max-w-[160px] truncate text-xs text-gray-500">
              {user.email}
            </div>
          )}
        </div>
      </NavLink>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        {navItems.map((item, idx) => (
          <div
            key={item.to}
            className={idx !== 0 ? "border-t border-gray-200" : ""}
          >
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

      <div className="mt-auto space-y-3 pt-6">
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

        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}