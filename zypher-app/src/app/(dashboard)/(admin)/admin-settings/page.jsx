"use client";

import { useState, useEffect } from "react";
import { Lexend } from "next/font/google";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { Loader2, Lock, CheckCircle, XCircle } from "lucide-react";

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "Admin";
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Fetch profile image from backend
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user-settings?email=${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (data.image) setProfilePic(data.image);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [session?.user?.email]);

  const handleTransferAdmin = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

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
        {/* Profile Form */}
        {session?.user && (
          <ProfileForm
            role={session.user.role}
            userId={session.user.id}
            initialEmail={session.user.email}
            initialProfilePic={profilePic}
            saveEndpoint="/api/user-settings"
          />
        )}


        {/* Password Form */}
        {session?.user && (
          <PasswordForm
            userId={session.user.id}
            updateEndpoint="/api/change-password"
          />
        )}

        {/* Transfer Admin */}
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
          {feedback && feedback.type === "success" && (
            <div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-green-100 text-green-600">
              <CheckCircle size={18} />
              <span>{feedback.message}</span>
            </div>
          )}
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
