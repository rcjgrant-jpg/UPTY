import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const { login, isAuthenticated, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = inviteToken
    ? `/invite/${inviteToken}`
    : location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AuthLayout
      title="Sign in"
      
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
          {submitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-muted">
        No account?{" "}
        <Link
          to={inviteToken ? `/register?invite=${inviteToken}` : "/register"}
          className="font-semibold text-brand-blueDeep hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}