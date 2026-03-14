import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ openIncidentCount = 0 }) {
  const navigate = useNavigate();
  const { logout, user, setUser } = useAuth();

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/incidents", label: "Incidents", badge: openIncidentCount },
    { to: "/team", label: "Team" },
  ];

  const itemClass = ({ isActive }) =>
    [
      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition",
      isActive
        ? "bg-brand-lavenderSoft font-semibold text-black"
        : "text-brand-muted hover:bg-brand-cream hover:text-brand-text",
    ].join(" ");

  const Icon = ({ isActive }) => (
    <span
      className={[
        "h-4 w-4 rounded-md transition",
        isActive ? "bg-brand-yellow" : "bg-brand-lavender",
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
    <aside className="flex h-full flex-col rounded-2xl border border-brand-lavender bg-brand-surface p-4 shadow-soft">
      <NavLink
        to="/dashboard"
        className="flex items-center gap-3 rounded-2xl bg-brand-yellowSoft p-3"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-yellow text-sm font-bold text-brand-text">
          U
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-brand-text">Upty</div>
          {user?.email && (
            <div className="max-w-[160px] truncate text-xs text-brand-muted">
              {user.email}
            </div>
          )}
        </div>
      </NavLink>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end className={itemClass}>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon isActive={isActive} />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <NavLink to="/settings" end className={itemClass}>
          {({ isActive }) => (
            <div className="flex items-center gap-3">
              <Icon isActive={isActive} />
              <span>Settings</span>
            </div>
          )}
        </NavLink>

        <button onClick={handleLogout} className="w-full app-button-outline">
          Log out
        </button>
      </div>
    </aside>
  );
}
