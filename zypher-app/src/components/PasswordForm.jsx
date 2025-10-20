"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2, CheckCircle, XCircle, KeyRound, Eye } from "lucide-react";

export default function PasswordForm({ updateEndpoint, userId }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: "error", message: "Password must be at least 8 characters." });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(updateEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");

      setFeedback({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--foreground)]">Change Password</h2>

      {feedback && (
        <div
          className={clsx(
            "p-3 rounded-lg text-sm flex items-center gap-2",
            feedback.type === "success"
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          )}
        >
          {feedback.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {[
        { label: "Current Password", key: "current", value: currentPassword, setter: setCurrentPassword },
        { label: "New Password", key: "new", value: newPassword, setter: setNewPassword },
        { label: "Confirm New Password", key: "confirm", value: confirmNewPassword, setter: setConfirmNewPassword },
      ].map(({ label, key, value, setter }) => (
        <div key={key} className="relative">
          <input
            type={showPassword[key] ? "text" : "password"}
            value={value}
            onChange={(e) => setter(e.target.value)}
            placeholder={label}
            className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
            required
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword({ ...showPassword, [key]: true });
              setTimeout(() => setShowPassword({ ...showPassword, [key]: false }), 1500);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <Eye size={20} />
          </button>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />}
          Update Password
        </button>
      </div>
    </form>
  );
}
