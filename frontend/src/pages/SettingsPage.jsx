import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { updateEmail, updatePassword } from "../api/settings";
import Sidebar from "../components/SideBar";
import useOpenIncidentCount from "../hooks/useOpenIncidentCount";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const openIncidentCount = useOpenIncidentCount();

  const [email, setEmail] = useState(user?.email || "");
  const [emailMsg, setEmailMsg] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState(null);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg(null);

    if (!email.trim()) {
      setEmailMsg({ type: "error", text: "Email cannot be empty." });
      return;
    }

    try {
      const updatedUser = await updateEmail(email);
      setUser((prev) => ({ ...prev, email: updatedUser.email }));
      setEmailMsg({ type: "ok", text: "Email updated successfully." });
    } catch (err) {
      setEmailMsg({ type: "error", text: err.message || "Failed to update email." });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setPwMsg({ type: "ok", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPwMsg({ type: "error", text: err.message || "Failed to change password." });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Sidebar openIncidentCount={openIncidentCount} />

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <form onSubmit={handleUpdateEmail} className="max-w-lg">
                <label className="block text-xs font-semibold text-gray-600">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />

                <p className="mt-2 text-xs text-gray-500">
                  This is where alerts are sent for monitors you create.
                </p>

                {emailMsg && <Message type={emailMsg.type} text={emailMsg.text} />}

                <button
                  type="submit"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Update Email
                </button>
              </form>
            </section>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <form onSubmit={handleChangePassword} className="max-w-lg">
                <h2 className="text-sm font-semibold text-gray-900">
                  Change Password
                </h2>

                <div className="mt-4 space-y-4">
                  <Field
                    label="Current password"
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="••••••••"
                  />
                  <Field
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="••••••••"
                  />
                  <Field
                    label="Confirm new password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                    placeholder="••••••••"
                  />
                </div>

                {pwMsg && <Message type={pwMsg.type} text={pwMsg.text} />}

                <button
                  type="submit"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Change Password
                </button>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}

function Message({ type, text }) {
  const cls =
    type === "ok"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${cls}`}>
      {text}
    </div>
  );
}
