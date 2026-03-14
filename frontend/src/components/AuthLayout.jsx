export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="app-page flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-yellowSoft text-sm font-semibold text-brand-text shadow-soft">
            U
          </div>

          <h1 className="app-title">{title}</h1>
          {subtitle && <p className="mt-2 app-subtitle">{subtitle}</p>}
        </div>

        <div className="app-card">{children}</div>
      </div>
    </div>
  );
}