"use client";

import { useState, useEffect } from "react";
import { Lexend } from "next/font/google";
import { useSession } from "next-auth/react";
import { Eye } from "lucide-react";
import clsx from "clsx";
import { Save, Loader2, Image as ImageIcon, CheckCircle, XCircle, KeyRound, Lock } from "lucide-react";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "Admin";

  const [email, setEmail] = useState(""); // current editable email
  const [originalEmail, setOriginalEmail] = useState(""); // for backend lookup
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Initialize email when session loads
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
      setOriginalEmail(session.user.email); // keep original for backend lookup
    }
  }, [session]);

  // Fetch profile info
  useEffect(() => {
    if (!originalEmail) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user-settings?email=${originalEmail}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (data.image) setProfilePic(data.image);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [originalEmail]);

  // Update profile (image or email)
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: originalEmail,
          newEmail: email !== originalEmail ? email : undefined,
          image: profilePic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setFeedback({ type: "success", message: "Profile updated successfully!" });

      // Update originalEmail if email changed
      if (email !== originalEmail) setOriginalEmail(email);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({ type: "error", message: "Passwords do not match." });
      setTimeout(() => setPasswordFeedback(null), 5000);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: "error", message: "Password must be at least 8 characters." });
      setTimeout(() => setPasswordFeedback(null), 5000);
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: originalEmail,
          newEmail: email !== originalEmail ? email : undefined,
          image: profilePic,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");

      setPasswordFeedback({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => setPasswordFeedback(null), 5000);
    } catch (err) {
      setPasswordFeedback({ type: "error", message: err.message });
      setTimeout(() => setPasswordFeedback(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setFeedback({ type: "info", message: "Image loaded. Click 'Save Changes' to confirm." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransferAdmin = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    // Simulate API logic
    setTimeout(() => {
      setFeedback({
        type: "success",
        message: `Admin privileges transferred to ${newAdminEmail}. You are no longer an admin.`,
      });
      setNewAdminEmail("");
      setIsSaving(false);
    }, 1000);
  };


  return (
    <div className={`p-6 md:p-10 animate-fadeInUp min-h-screen ${lexend.className}`}>
      <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">Admin Settings</h1>

      <div className="bg-[var(--input-bg)] p-8 rounded-xl shadow-xl border border-[var(--border-input)] space-y-10">

        {/* Profile Section */}
        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--brand-yellow)] flex-shrink-0">
              <img
                src={profilePic}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = '/Images/placeholder-avatar.png'; }}
              />
              <label htmlFor="profile-pic-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <ImageIcon size={24} className="text-white" />
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-grow space-y-4 w-full">
              <div>
                <label className="block text-sm mb-1 text-[var(--text-secondary)]">Role</label>
                <input
                  type="text"
                  value={role}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[var(--text-secondary)]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
                />
              </div>
            </div>
          </div>

          {feedback && (
            <div className={clsx(
              "p-3 rounded-lg text-sm flex items-center gap-2",
              feedback.type === "success"
                ? "bg-green-600/20 text-green-400"
                : feedback.type === "error"
                ? "bg-red-600/20 text-red-400"
                : "bg-blue-600/20 text-blue-400"
            )}>
              {feedback.type === "success" ? <CheckCircle size={18} /> : feedback.type === "error" ? <XCircle size={18} /> : <ImageIcon size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </form>

        {/* Password Section */}
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Change Password</h2>
          {passwordFeedback && (
            <div
              className={clsx(
                "p-3 rounded-lg text-sm flex items-center gap-2 mt-2",
                passwordFeedback.type === "success"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              )}
            >
              {passwordFeedback.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          {["current", "new", "confirm"].map((field) => (
            <div key={field} className="relative">
              <input
                type={showPassword[field] ? "text" : "password"}
                value={field === "current" ? currentPassword : field === "new" ? newPassword : confirmNewPassword}
                onChange={(e) =>
                  field === "current"
                    ? setCurrentPassword(e.target.value)
                    : field === "new"
                    ? setNewPassword(e.target.value)
                    : setConfirmNewPassword(e.target.value)
                }
                placeholder={field === "current" ? "Current Password" : field === "new" ? "New Password" : "Confirm New Password"}
                className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
                required
              />
              <button
                type="button"
                onClick={() => {
                  setShowPassword({ ...showPassword, [field]: true });
                  setTimeout(() => setShowPassword({ ...showPassword, [field]: false }),
                  1500); // hide after 1.5s
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

        {/* Revoke / Transfer Admin */}
        <form onSubmit={handleTransferAdmin} className="space-y-6 pt-10 border-t border-[var(--border-input)] mt-10">
          <h2 className="text-xl font-bold text-red-500">Resign as Admin</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            To resign from your admin role, provide the email of the user to transfer your privileges to.
          </p>
          <div>
            <label className="block text-sm mb-1 text-[var(--text-secondary)]">New Admin's Email Address</label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
              Transfer & Resign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
