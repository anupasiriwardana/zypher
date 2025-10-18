"use client";

import { useState, useEffect } from "react";
import { Lexend } from "next/font/google";
import { useSession } from "next-auth/react";

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function EducatorSettingsPage() {
  const { data: session } = useSession();
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchProfile = async () => {
      const res = await fetch(`/api/user-settings?email=${session.user.email}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.image) setProfilePic(data.image);
    };

    fetchProfile();
  }, [session?.user?.email]);

  return (
    <div className={`p-6 md:p-10 animate-fadeInUp min-h-screen ${lexend.className}`}>
      <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">Educator Settings</h1>

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
      </div>
    </div>
  );
}
