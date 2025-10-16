"use client";

import { useState } from 'react';
import clsx from 'clsx';
import {
  User, 
  CreditCard, 
  Shield
} from 'lucide-react';

// Import the component sections
import AccountSection from '@/components/AccountSection';
import BillingsSection from '@/components/BillingsSection';
import PrivacySection from '@/components/PrivacySection';

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="p-6 md:p-8 lg:p-10 animate-fadeInUp min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Settings</h1>

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
          onClick={() => setActiveTab('billings')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'billings'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <CreditCard size={20} /> Billings
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'privacy'
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
        {activeTab === 'account' && <AccountSection />}

        {/* Billings Tab Content */}
        {activeTab === 'billings' && <BillingsSection />}

        {/* Privacy Tab Content */}
        {activeTab === 'privacy' && <PrivacySection />}
      </div>
    </div>
  );
}