"use client";

import { Lexend } from 'next/font/google';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TermsAgreement from '@/components/TermsAgreement';

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";

import clsx from "clsx";

import {
  User, ClipboardList, Image as ImageIcon, 
} from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RuleDeveloperSettingsPage() {
  const { data: session } = useSession();
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // added missing UI state
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
      const fetchUser = async () => {
        try {
          if (!session?.user?.email) return;
  
          const res = await fetch(`/api/user-settings?userId=${session.user.id}`);
          if (!res.ok) throw new Error("Failed to fetch user");
  
          const data = await res.json();
          setUser(data);
        } catch (err) {
          console.error("Error fetching user:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, [session?.user?.email]);

    if (!user) return <p className="p-10 text-center text-red-500">User not found</p>;


  const inputStyle = "w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 shadow-inner";


  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Developer Settings</h1>

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

      {/* Tab Content */}
      <div className="bg-[var(--input-bg)] p-8 rounded-xl shadow-xl border border-[var(--border-input)] animate-fadeInUp">

        {activeTab === 'account' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Your Profile Information</h2>
              <ProfileForm
                            role={user.role}
                            userId={user._id}
                            initialEmail={user.email}
                            initialProfilePic={user.image || "/Images/avatar.jpg"}
                            saveEndpoint="/api/user-settings"
                          />
              
                          <PasswordForm
                            userId={user._id}
                            updateEndpoint="/api/user-settings"
                          />                                      
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
                roleId={session.user.role} // e.g., "rule-developer"
                userEmail={session.user.email}
                startDate={userData ? new Date(userData.createdAt).toLocaleDateString() : ""}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}