"use client";

import { useState } from "react";
import { Lexend } from "next/font/google";
import clsx from "clsx";
import {
  User,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  KeyRound,
  Lock,
} from "lucide-react";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function EducatorSettingsPage() {
  const [name, setName] = useState("Jane Educator");
  const [email, setEmail] = useState("jane.educator@zypher.com");
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setFeedback({ type: "success", message: "Profile updated successfully!" });
    setIsSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({
        type: "error",
        message: "Password must be at least 8 characters.",
      });
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setFeedback({ type: "success", message: "Password updated successfully!" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsSaving(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setFeedback({
          type: "info",
          message: "Image loaded. Click 'Save Changes' to confirm.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`p-6 md:p-10 animate-fadeInUp min-h-screen ${lexend.className}`}
    >
      <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">
        Educator Settings
      </h1>

      <div className="bg-[var(--input-bg)] p-8 rounded-xl shadow-xl border border-[var(--border-input)] space-y-10">
        {/* Profile Section */}
        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--brand-yellow)]">
              <img
                src={profilePic}
                alt="Educator Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Images/avatar.jpg";
                }}
              />
              <label
                htmlFor="educator-pic"
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <ImageIcon size={22} className="text-white" />
                <input
                  type="file"
                  id="educator-pic"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-grow space-y-4 w-full">
              <div>
                <label className="block text-sm mb-1 text-[var(--text-secondary)]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[var(--text-secondary)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--text-secondary)] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {feedback && feedback.type !== "info" && (
            <div
              className={clsx(
                "p-3 rounded-lg text-sm flex items-center gap-2",
                feedback.type === "success"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <XCircle size={18} />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {feedback && feedback.type === "info" && (
            <div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-blue-600/20 text-blue-400">
              <ImageIcon size={18} />
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Save Changes
            </button>
          </div>
        </form>

        {/* Optional: Password Update */}
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Change Password
          </h2>
          <div>
            <label className="block text-sm mb-1 text-[var(--text-secondary)]">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--text-secondary)]">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--text-secondary)]">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <KeyRound size={20} />
              )}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
