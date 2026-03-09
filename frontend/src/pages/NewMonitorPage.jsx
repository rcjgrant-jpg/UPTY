import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMonitor } from "../api/monitors";
import Sidebar from "../components/SideBar";

export default function NewMonitorPage() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(60);
  const [timeout, setTimeoutValue] = useState(5000);
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [failureThreshold, setFailureThreshold] = useState(3);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setSubmitting(true);

    try {
      await createMonitor({
        url,
        interval: Number(interval),
        timeout: Number(timeout),
        expected_status: Number(expectedStatus),
        failure_threshold: Number(failureThreshold),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create monitor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">New Monitor</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new uptime monitor for your team.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
              <Field label="URL">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/health"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Interval (seconds)">
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  min="10"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Timeout (ms)">
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeoutValue(e.target.value)}
                  min="100"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Expected status">
                <input
                  type="number"
                  value={expectedStatus}
                  onChange={(e) => setExpectedStatus(e.target.value)}
                  min="100"
                  max="599"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Failure threshold">
                <input
                  type="number"
                  value={failureThreshold}
                  onChange={(e) => setFailureThreshold(e.target.value)}
                  min="1"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Monitor"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}