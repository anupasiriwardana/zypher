"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { User, CreditCard, Shield } from "lucide-react";

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import AccountSection from "@/components/AccountSection";
import BillingsSection from "@/components/BillingsSection";
import PrivacySection from "@/components/PrivacySection";

export default function UserSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch latest user details directly from the database
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

  if (loading) return <p className="p-10 text-center">Loading user settings...</p>;
  if (!user) return <p className="p-10 text-center text-red-500">User not found</p>;

  return (
    <div className="p-6 md:p-8 lg:p-10 animate-fadeInUp min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">
        Settings
      </h1>

      {/* Tabs Navigation */}
      <div className="bg-[var(--input-bg)] rounded-xl p-2 mb-8 shadow-md border border-[var(--border-input)] flex flex-wrap justify-center sm:justify-start gap-2">
        <button
          onClick={() => setActiveTab("account")}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === "account"
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <User size={20} /> Account
        </button>

        <button
          onClick={() => setActiveTab("billings")}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === "billings"
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <CreditCard size={20} /> Billings
        </button>

        <button
          onClick={() => setActiveTab("privacy")}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === "privacy"
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <Shield size={20} /> Privacy
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--input-bg)] p-8 rounded-xl shadow-xl border border-[var(--border-input)] animate-fadeInUp">
        {/* Account Tab Content */}
        {activeTab === "account" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">
              Basic Information
            </h2>

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

        {/* Billings Tab Content */}
        {activeTab === "billings" && <BillingsSection />}

        {/* Privacy Tab Content */}
        {activeTab === "privacy" && <PrivacySection />}
      </div>
    </div>
  );
}
