import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMonitor } from "../api/monitors";
import AppLayout from "../components/AppLayout";
import TextField from "../components/TextField";

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
    <AppLayout
      title="New Monitor"
      subtitle="Create a new uptime monitor for your team."
    >
      <section className="app-card">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <TextField
            label="URL"
            type="url"
            value={url}
            onChange={setUrl}
            placeholder="https://example.com/health"
            required
          />

          <TextField
            label="Interval (seconds)"
            type="number"
            value={interval}
            onChange={setInterval}
            min="10"
            required
          />

          <TextField
            label="Timeout (ms)"
            type="number"
            value={timeout}
            onChange={setTimeoutValue}
            min="100"
            required
          />

          <TextField
            label="Expected status"
            type="number"
            value={expectedStatus}
            onChange={setExpectedStatus}
            min="100"
            max="599"
            required
          />

          <TextField
            label="Failure threshold"
            type="number"
            value={failureThreshold}
            onChange={setFailureThreshold}
            min="1"
            required
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="app-button-primary disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Monitor"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="app-button-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}