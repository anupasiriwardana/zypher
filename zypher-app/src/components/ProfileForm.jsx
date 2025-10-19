"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { Save, Loader2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";

export default function ProfileForm({
  initialEmail,
  initialProfilePic,
  saveEndpoint,
  sessionUserId,
  role = "Admin", // ✅ role added with default
}) {
  const [email, setEmail] = useState(initialEmail || "");
  const [profilePic, setProfilePic] = useState(initialProfilePic || "/Images/avatar.jpg");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    setProfilePic(initialProfilePic);
  }, [initialProfilePic]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch(saveEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: email,
          image: profilePic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setFeedback({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);
    if (sessionUserId) formData.append("userId", sessionUserId);

    const res = await fetch("/api/upload-profile-pic", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) setProfilePic(data.url);

    setFeedback({
      type: "info",
      message: "Image loaded. Click 'Save Changes' to confirm.",
    });
  };

  return (
    <form onSubmit={handleProfileSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--brand-yellow)] flex-shrink-0">
          <img
            src={profilePic}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/Images/placeholder-avatar.png";
            }}
          />
          <label
            htmlFor="profile-pic-upload"
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          >
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
        <div
          className={clsx(
            "p-3 rounded-lg text-sm flex items-center gap-2",
            feedback.type === "success"
              ? "bg-green-600/20 text-green-400"
              : feedback.type === "error"
              ? "bg-red-600/20 text-red-400"
              : "bg-blue-600/20 text-blue-400"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle size={18} />
          ) : feedback.type === "error" ? (
            <XCircle size={18} />
          ) : (
            <ImageIcon size={18} />
          )}
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
  );
}
