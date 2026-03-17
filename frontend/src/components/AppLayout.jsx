import Sidebar from "./SideBar";
import useOpenIncidentCount from "../hooks/useOpenIncidentCount";

export default function AppLayout({ title, subtitle, actions, children }) {
  const openIncidentCount = useOpenIncidentCount();

  return (
    <div className="app-page">
      <div className="app-container py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar openIncidentCount={openIncidentCount} />

          <main className="min-w-0 space-y-6">
            {(title || subtitle || actions) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  {title && <h1 className="app-title">{title}</h1>}
                  {subtitle && <p className="app-subtitle mt-1">{subtitle}</p>}
                </div>
                {actions && <div>{actions}</div>}
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}