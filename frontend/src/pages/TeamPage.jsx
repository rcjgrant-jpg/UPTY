import { useEffect, useMemo, useState } from "react";
import { createInvite, getTeam } from "../api/team";
import AppLayout from "../components/AppLayout";
import AlertMessage from "../components/AlertMessage";
import TextField from "../components/TextField";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function TeamPage() {
  const [team, setTeam] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setError("");
        const data = await getTeam();
        setTeam(data);
      } catch (err) {
        setError(err.message || "Failed to load team");
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, []);

  const generateInviteLink = async () => {
    setInviteLoading(true);
    setError("");

    try {
      const data = await createInvite();
      setInviteLink(data.url || "");
      setCopied(false);
    } catch (err) {
      setError(err.message || "Failed to generate invite link");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const membersCount = team?.members?.length || 0;

  return (
    <AppLayout
      title={team?.name || "Team"}
      subtitle={
        loading ? "Loading team..." : `${membersCount} member${membersCount === 1 ? "" : "s"}`
      }
    >
      {loading ? (
        <section className="app-card">
          <p className="text-sm text-brand-muted">Loading team...</p>
        </section>
      ) : error && !team ? (
        <AlertMessage type="error" text={error} />
      ) : (
        <>
          <section className="app-card overflow-hidden p-0">
            <div className="border-b border-brand-border bg-brand-lavenderSoft px-4 py-3">
              <h2 className="text-sm font-semibold text-brand-text">Team members</h2>
            </div>

            {team?.members?.length ? (
              <div className="divide-y divide-brand-border">
                {team.members.map((member) => (
                  <MemberRow
                    key={member.id}
                    email={member.email}
                    joined={formatDateTime(member.joined_at)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-sm text-brand-muted">
                No team members found.
              </div>
            )}
          </section>

          <section className="app-card">
            <div>
              <h2 className="text-sm font-semibold text-brand-text">
                Invite a teammate
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Generate a shareable invite link for a new team member.
              </p>
            </div>

            <div className="mt-5 max-w-2xl space-y-4">
              <button
                type="button"
                onClick={generateInviteLink}
                disabled={inviteLoading}
                className="app-button-primary disabled:opacity-60"
              >
                {inviteLoading ? "Generating..." : "Generate Invite Link"}
              </button>

              <div>
                <TextField
                  label="Invite link"
                  value={inviteLink}
                  onChange={() => {}}
                  placeholder="Generate a link to invite a teammate"
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!inviteLink}
                  className={
                    inviteLink
                      ? "app-button-outline"
                      : "inline-flex items-center justify-center rounded-lg border border-brand-border bg-gray-100 px-4 py-2 font-medium text-brand-muted opacity-60"
                  }
                >
                  {copied ? "Copied" : "Copy"}
                </button>

                <span className="text-xs text-brand-muted">Expires in 7 days</span>
              </div>

              {error && <AlertMessage type="error" text={error} />}
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}

function MemberRow({ email, joined }) {
  const initials = useMemo(() => {
    const name = email.split("@")[0];
    const parts = name.split(/[._-]/).filter(Boolean);
    const a = (parts[0]?.[0] || name[0] || "?").toUpperCase();
    const b = (parts[1]?.[0] || name[1] || "").toUpperCase();
    return (a + b).slice(0, 2);
  }, [email]);

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-yellowSoft text-xs font-semibold text-brand-text">
        {initials}
      </div>

      <div>
        <div className="text-sm font-medium text-brand-text">{email}</div>
        <div className="mt-0.5 text-xs text-brand-muted">Joined {joined}</div>
      </div>
    </div>
  );
}