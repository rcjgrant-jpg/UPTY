import { useState } from "react";
import Sidebar from "../components/SideBar";

export default function NewMonitorPage() {
  const [url, setUrl] = useState("");
  const [checkEvery, setCheckEvery] = useState("60");
  const [timeout, setTimeout] = useState("5000");
  const [expectedStatus, setExpectedStatus] = useState("200");
  const [failuresBeforeAlert, setFailuresBeforeAlert] = useState("3");
  const [error, setError] = useState(null);

 

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required.");
      return;
    }

    // Later: POST to Django API
    console.log("Create monitor:", {
      url,
      checkEvery: Number(checkEvery),
      timeout: Number(timeout),
      expectedStatus: Number(expectedStatus),
      failuresBeforeAlert: Number(failuresBeforeAlert),
    });

    // On success → redirect to /monitors/:id
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />
          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Back */}
        
            <h1 className="mt-3 text-xl font-semibold text-gray-900">
              New Monitor
            </h1>

            <div className="mt-6 max-w-xl">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                {/* URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    URL <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/health"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    required
                  />
                </div>

                {/* 2-col fields */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {/* Check every */}
                  <FieldWithUnit
                    label="Check every"
                    value={checkEvery}
                    onChange={setCheckEvery}
                    unit="sec"
                    inputMode="numeric"
                  />

                  {/* Timeout */}
                  <FieldWithUnit
                    label="Timeout"
                    value={timeout}
                    onChange={setTimeout}
                    unit="ms"
                    inputMode="numeric"
                  />

                  {/* Expected status */}
                  <Field
                    label="Expected status"
                    value={expectedStatus}
                    onChange={setExpectedStatus}
                    inputMode="numeric"
                  />

                  {/* Failures before alert */}
                  <Field
                    label="Failures before alert"
                    value={failuresBeforeAlert}
                    onChange={setFailuresBeforeAlert}
                    inputMode="numeric"
                  />
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  Only URL is required. Other fields have sensible defaults.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  You&#39;ll be emailed at your account address if this monitor
                  goes down.
                </p>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Create Monitor
                </button>

                <div className="mt-4 border-t border-dashed border-gray-200 pt-3 text-xs text-gray-400">
                  On success → redirect to /monitors/:id
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, inputMode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}

function FieldWithUnit({ label, value, onChange, unit, inputMode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600">{label}</label>

      <div className="mt-2 flex items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
          className="w-full px-3 py-2 text-sm text-gray-900 focus:outline-none"
        />
        <div className="grid place-items-center border-l border-gray-200 px-3 text-xs font-medium text-gray-500">
          {unit}
        </div>
      </div>
    </div>
  );
}