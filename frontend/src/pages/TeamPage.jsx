import { useMemo, useState } from "react";
import Sidebar from "../components/SideBar";

export default function TeamPage() {
  // Later: fetch from Django (e.g. GET /api/team/)
  const [team] = useState({
    name: "Company",
    nameLine2: "Inc",
    members: [
      { id: "1", email: "john@company.com", joined: "Jan 15, 2026" },
      { id: "2", email: "alice@company.com", joined: "Jan 20, 2026" },
      { id: "3", email: "bob@company.com", joined: "Feb 1, 2026" },
    ],
  });

  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const membersCount = team.members.length;

  const generateInviteLink = () => {
    // Later: call your backend to generate a real token
    const fakeToken = Math.random().toString(36).slice(2, 10);
    setInviteLink(`https://upty.app/invite/a8f3k2-${fakeToken}`);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.log("Clipboard copy failed", e);
      // fallback (optional): select input and copy manually
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar />

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                {team.name}
                <br />
                {team.nameLine2}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{membersCount} members</p>
            </div>

            {/* Members card */}
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white">
              <div className="divide-y divide-gray-100">
                {team.members.map((m) => (
                  <MemberRow key={m.id} email={m.email} joined={m.joined} />
                ))}
              </div>
            </section>

            {/* Invite */}
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900">
                Invite a teammate
              </h2>

              <div className="mt-3 max-w-2xl rounded-2xl border border-gray-200 bg-white p-5">
                <button
                  type="button"
                  onClick={generateInviteLink}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Generate Invite Link
                </button>

                {/* After clicking */}
                <div className="mt-6 text-xs text-gray-500">After clicking:</div>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={inviteLink}
                    readOnly
                    placeholder="https://upty.app/invite/a8f3k2-x9..."
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
                        : "bg-gray-200 text-gray-500 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-400">Expires in 7 days</div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ email, joined }) {
  const initials = useMemo(() => {
    // take first letters of up to 2 parts before @
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