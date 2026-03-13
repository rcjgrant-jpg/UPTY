import { useEffect, useMemo, useState } from "react";
import { createInvite, getTeam } from "../api/team";
import Sidebar from "../components/SideBar";
import useOpenIncidentCount from "../hooks/useOpenIncidentCount";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function TeamPage() {
  const openIncidentCount = useOpenIncidentCount();

  const [team, setTeam] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeam = async () => {
      try {
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar openIncidentCount={openIncidentCount} />

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {loading ? (
              <p className="text-sm text-gray-500">Loading team...</p>
            ) : error && !team ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <>
                <div>
                  <h1 className="text-xl font-semibold leading-tight text-gray-900">
                    {team.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {membersCount} members
                  </p>
                </div>

                <section className="mt-6 rounded-2xl border border-gray-200 bg-white">
                  <div className="divide-y divide-gray-100">
                    {team.members.map((m) => (
                      <MemberRow
                        key={m.id}
                        email={m.email}
                        joined={formatDateTime(m.joined_at)}
                      />
                    ))}
                  </div>
                </section>

                <section className="mt-8">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Invite a teammate
                  </h2>

                  <div className="mt-3 max-w-2xl rounded-2xl border border-gray-200 bg-white p-5">
                    <button
                      type="button"
                      onClick={generateInviteLink}
                      disabled={inviteLoading}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                    >
                      {inviteLoading ? "Generating..." : "Generate Invite Link"}
                    </button>

                    <div className="mt-6 text-xs text-gray-500">Invite link</div>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={inviteLink}
                        readOnly
                        placeholder="Generate a link to invite a teammate"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!inviteLink}
                        className={[
                          "inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold",
                          inviteLink
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "cursor-not-allowed bg-gray-200 text-gray-500",
                        ].join(" ")}
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-gray-400">Expires in 7 days</div>

                    {error && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
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
      <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
        {initials}
      </div>

      <div>
        <div className="text-sm font-medium text-gray-900">{email}</div>
        <div className="mt-0.5 text-xs text-gray-500">Joined {joined}</div>
      </div>
    </div>
  );
}
