import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Logo from "../components/Logo";

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
        isActive ? "bg-brand-blueDeep" : "bg-brand-lavender",
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
    <aside className="sticky top-0 flex h-screen w-42 shrink-0 flex-col border-r border-brand-lavender bg-brand-surface p-4 shadow-soft">
      <NavLink
        to="/dashboard"
        className="rounded-2xl bg-brand-lavenderSoft p-4"
      >
        <div className="flex flex-col items-center text-center">
          <Logo size={100} />

          {user?.email && (
            <div className="mt-3 max-w-full truncate text-xs text-brand-muted">
              {user.email}
            </div>
          )}
        </div>
      </NavLink>

      <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
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

      <div className="space-y-3 pt-6">
        <NavLink to="/settings" end className={itemClass}>
          {({ isActive }) => (
            <div className="flex items-center gap-3">
              <Icon isActive={isActive} />
              <span>Settings</span>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full app-button-outline"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
