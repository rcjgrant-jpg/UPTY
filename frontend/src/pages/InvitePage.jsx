import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { acceptInvite, validateInvite } from "../api/invites";
import { me } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

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

      // Refresh the current user so AuthContext has the new team attached
      const refreshedUser = await me();
      setUser(refreshedUser);

      navigate("/team", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to join team.");
      setJoining(false);
    }
  };

  if (!authLoading && isAuthenticated && user?.team?.name && invite?.team_name === user.team.name) {
    return <Navigate to="/team" replace />;
  }

  const loginLink = `/login?invite=${token}`;
  const registerLink = `/register?invite=${token}`;

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div className="mb-8 rounded-lg bg-[#e5e7eb] px-10 py-3 text-sm font-medium text-gray-700">
          Upty
        </div>

        <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          {loading ? (
            <p className="text-sm text-gray-500">Loading invite...</p>
          ) : error && !invite ? (
            <div>
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">You&apos;ve been invited to join</p>
              <h1 className="mt-3 text-3xl font-semibold text-gray-900">
                {invite?.team_name}
              </h1>
            </>
          )}
        </div>

        {!loading && invite && (
          <>
            {!authLoading && !isAuthenticated ? (
              <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  to={loginLink}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-900 bg-white px-6 py-4 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Sign In to Join
                </Link>

                <Link
                  to={registerLink}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Register to Join
                </Link>
              </div>
            ) : !authLoading && isAuthenticated ? (
              <div className="mt-10 w-full max-w-md">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full rounded-xl bg-gray-900 px-6 py-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? "Joining..." : "Join Team"}
                </button>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>
            ) : null}

            <p className="mt-8 text-sm text-gray-400">{expiryText}</p>
          </>
        )}
      </div>
    </div>
  );
}