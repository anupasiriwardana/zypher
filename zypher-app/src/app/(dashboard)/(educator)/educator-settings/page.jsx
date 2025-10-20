"use client";

import { useState, useEffect } from "react";
import { Lexend } from "next/font/google";
import { useSession } from "next-auth/react";

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import TermsAgreement from '@/components/TermsAgreement';

import clsx from "clsx";

import {
  User, ClipboardList, Image as ImageIcon, 
} from 'lucide-react';

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function EducatorSettingsPage() {
  const { data: session } = useSession();
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");
  const [activeTab, setActiveTab] = useState('account');
  const [userData, setUserData] = useState(null);

   useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUser = async () => {
      const res = await fetch(`/api/users?email=${session.user.email}`);
      if (!res.ok) return;
      const data = await res.json();
      setUserData(data);
    };

    fetchUser();
  }, [session?.user?.email]);

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Educator Settings</h1>

      {/* Tabs Navigation */}
      <div className="bg-[var(--input-bg)] rounded-xl p-2 mb-8 shadow-md border border-[var(--border-input)] flex flex-wrap justify-center sm:justify-start gap-2">
        <button
          onClick={() => setActiveTab('account')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'account'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <User size={20} /> Account
        </button>
        <button
          onClick={() => setActiveTab('terms-agreements')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'terms-agreements'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <ClipboardList size={20} /> Terms & Agreements
        </button>
      </div>

      {activeTab === 'account' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Your Profile Information</h2>
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
        )}

        {/* Terms and Agreements Tab Content */}
                {activeTab === 'terms-agreements' && (
                  <div className="space-y-10">
                    <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">
                      Employment Agreement
                    </h2>
        
                    {session?.user && (
                      <TermsAgreement
                        roleId={session.user.role} 
                        userEmail={session.user.email}
                        startDate={userData ? new Date(userData.createdAt).toLocaleDateString() : ""}
                      />
                    )}
                  </div>
                )}
            </div>
           );
        }
