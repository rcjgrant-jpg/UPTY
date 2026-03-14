import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { acceptInvite, validateInvite } from "../api/invites";
import { me } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AlertMessage from "../components/AlertMessage";

function daysUntilExpiry(expiresAt) {
  if (!expiresAt) return null;

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading, setUser } = useAuth();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      try {
        setError("");
        const data = await validateInvite(token);
        setInvite(data);
      } catch (err) {
        setError(err.message || "This invite is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const expiryText = useMemo(() => {
    const days = daysUntilExpiry(invite?.expires_at);

    if (days == null) return "";
    if (days === 0) return "This invite expires today";
    if (days === 1) return "This invite expires in 1 day";
    return `This invite expires in ${days} days`;
  }, [invite]);

  const handleJoin = async () => {
    setJoining(true);
    setError("");

    try {
      await acceptInvite(token);

      const refreshedUser = await me();
      setUser(refreshedUser);

      navigate("/team", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to join team.");
      setJoining(false);
    }
  };

  if (
    !authLoading &&
    isAuthenticated &&
    user?.team?.name &&
    invite?.team_name === user.team.name
  ) {
    return <Navigate to="/team" replace />;
  }

  const loginLink = `/login?invite=${token}`;
  const registerLink = `/register?invite=${token}`;

  return (
    <AuthLayout
      title={loading ? "Loading invite..." : invite?.team_name || "Team Invite"}
      subtitle={
        loading
          ? "Checking your invitation..."
          : invite
          ? "You’ve been invited to join this team on UPTY."
          : "This invite could not be loaded."
      }
    >
      {loading ? (
        <p className="text-center text-sm text-brand-muted">Loading invite...</p>
      ) : error && !invite ? (
        <div className="space-y-4 text-center">
          <AlertMessage type="error" text={error} />
          <Link to="/login" className="w-full app-button-primary">
            Back to login
          </Link>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="rounded-2xl border border-brand-lavender bg-brand-lavenderSoft px-4 py-5">
            <p className="text-sm text-brand-muted">You&apos;ve been invited to join</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">
              {invite?.team_name}
            </h2>
          </div>

          {!authLoading && !isAuthenticated ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                to={loginLink}
                className="app-button-outline"
              >
                Sign In to Join
              </Link>

              <Link
                to={registerLink}
                className="app-button-primary"
              >
                Register to Join
              </Link>
            </div>
          ) : !authLoading && isAuthenticated ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining}
                className="w-full app-button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? "Joining..." : "Join Team"}
              </button>

              {error && <AlertMessage type="error" text={error} />}
            </div>
          ) : null}

          {expiryText && (
            <p className="text-sm text-brand-muted">{expiryText}</p>
          )}
        </div>
      )}
    </AuthLayout>
  );
}