'use client';

import '@/app/globals.css';
import { Lexend } from 'next/font/google';
import RuleImplementorSidebar from '@/components/sidebars/ruleImplementorSidebar';
import { Bell, UserCircle } from 'lucide-react';
import { useState } from 'react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function DashboardLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);


  const hasNotifications = true;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <html lang="en">
      <body className={lexend.className}>
        <div className="flex">
          <RuleImplementorSidebar />

          <div className="ml-28 flex flex-col flex-1 min-h-screen bg-[var(--background)] text-[var(--foreground)]">

            <header className="flex items-center justify-between px-6 py-4 relative">
              <div className="text-md text-[var(--text-secondary)] font-medium">
                {today}
              </div>

   
              <div className="flex items-center gap-6 relative">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfile(false);
                    }}
                    className="relative hover:text-[var(--brand-yellow)] transition"
                  >
                    <Bell size={36} />
                    {hasNotifications && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-84 bg-[var(--input-bg)] text-md rounded-xl shadow-lg p-8 z-50">
                      <p className="text-[var(--text-secondary)] font-semibold mb-2">Notifications</p>
                      <ul className="space-y-2">
                        <li>You have 3 new scan reports.</li>
                        <li>New rules assigned to you.</li>
                        <li>Security alert on Repo-X.</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfile(!showProfile);
                      setShowNotifications(false);
                    }}
                    className="hover:text-[var(--brand-yellow)] transition"
                  >
                    <UserCircle size={36} />
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-3 w-64 bg-[var(--input-bg)] text-md rounded-xl shadow-lg p-8 z-50">
                      <p className="font-semibold mb-2">Signed in as</p>
                      <p className="text-[var(--text-secondary)] mb-4">user@example.com</p>
                      <button className="w-full text-left hover:text-[var(--brand-yellow)] transition">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="p-4 flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
