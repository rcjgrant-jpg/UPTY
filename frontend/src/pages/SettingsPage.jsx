import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { updateEmail, updatePassword } from "../api/settings";
import AppLayout from "../components/AppLayout";
import TextField from "../components/TextField";
import AlertMessage from "../components/AlertMessage";

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [emailMsg, setEmailMsg] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState(null);

  const hasMinLength = newPassword.length >= 8;
  const hasDigit = /\d/.test(newPassword);
  const hasSpecialCharacter = /[^\w\s]/.test(newPassword);

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
      setEmailMsg({
        type: "error",
        text: err.message || "Failed to update email.",
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwMsg({
        type: "error",
        text: "Please fill in all password fields.",
      });
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
      setPwMsg({
        type: "error",
        text: err.message || "Failed to change password.",
      });
    }
  };

  return (
    <AppLayout
      title="Settings"
      subtitle="Manage your account details and security settings."
    >
    <section className="app-card">
      <form onSubmit={handleUpdateEmail} className="max-w-lg space-y-4">

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          required
        />

        <p className="mt-2 text-xs text-brand-muted">
          This is where alerts are sent for monitors you create.
        </p>

        {emailMsg && (
          <AlertMessage type={emailMsg.type} text={emailMsg.text} />
        )}

        <button type="submit" className="app-button-primary">
          Update Email
        </button>

      </form>
    </section>

      <section className="app-card">
        <form onSubmit={handleChangePassword} className="max-w-lg space-y-4">

          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="••••••••"
            required
          />

          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="••••••••"
            required
          />

          <TextField
            label="Confirm new password"
            type="password"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            placeholder="••••••••"
            required
          />

          <div className="mt-1 rounded-xl bg-brand-surface px-3 py-2 text-sm text-brand-muted">
            <p className="font-medium">New password requirements:</p>
            <ul className="mt-1 space-y-1">
              <li>{hasMinLength ? "✓" : "•"} At least 8 characters</li>
              <li>{hasDigit ? "✓" : "•"} At least 1 number</li>
              <li>{hasSpecialCharacter ? "✓" : "•"} At least 1 special character</li>
            </ul>
          </div>

          {pwMsg && (
            <AlertMessage type={pwMsg.type} text={pwMsg.text} />
          )}

          <button type="submit" className="app-button-primary">
            Change Password
          </button>

        </form>
      </section>
    </AppLayout>
  );
}

function Message({ type, text }) {
  const cls =
    type === "ok"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${cls}`}>
      {text}
    </div>
  );
}