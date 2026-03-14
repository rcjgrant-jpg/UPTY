import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, teamName, inviteToken);
      navigate(inviteToken ? "/team" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        inviteToken
          ? "Join your team and start monitoring right away."
          : "Set up your workspace and start tracking uptime."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          required
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
        />

        <TextField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          required
        />

        {!inviteToken && (
          <TextField
            label="Team name"
            type="text"
            value={teamName}
            onChange={setTeamName}
            placeholder="Company Inc"
            required
          />
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full app-button-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-brand-muted">
          Already have an account?{" "}
          <Link
            to={inviteToken ? `/login?invite=${inviteToken}` : "/login"}
            className="font-semibold text-brand-blueDeep hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}