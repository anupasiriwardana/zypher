// src/app/(dashboard)/(manager)/layout.jsx (Minimal changes from previous version)
'use client';

import '@/app/globals.css';
import { Lexend } from 'next/font/google';
import ManagerSidebar from '@/components/sidebars/managerSidebar'; // Updated import path
import { Bell, UserCircle } from 'lucide-react';
import { useState, Suspense } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ManagerDashboardLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { data: session, status } = useSession();

  const hasNotifications = true; 

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/login',
    });
  };

  return (
    <Suspense fallback={<div className={lexend.className}>Loading dashboard...</div>}>
      <div className={lexend.className}>
        <div className="flex">
          <ManagerSidebar />

          {/* Adjust ml-28 to account for the sidebar's w-28 width */}
          <div className="ml-24 md:ml-28 flex flex-col flex-1 min-h-screen bg-[var(--background)] text-[var(--foreground)]">

            <header className="flex items-center justify-between px-6 py-4 relative border-b border-[var(--border-input)]">
              <div className="text-md text-[var(--text-secondary)] font-medium">
                {today}
              </div>

              <div className="flex items-center gap-6 relative">
                {/* Bell Icon for System Notifications */}
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
                        <li>New payment received!</li>
                        <li>Plan "Enterprise" nearing capacity.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* User Profile Icon */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfile(!showProfile);
                      setShowNotifications(false);
                    }}
                    className="hover:text-[var(--brand-yellow)] transition"
                  >
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="rounded-full object-cover border border-[var(--border-input)]"
                      />
                    ) : (
                      <UserCircle size={36} />
                    )}
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-3 w-64 bg-[var(--input-bg)] text-md rounded-xl shadow-lg p-8 z-50">
                      <p className="font-semibold mb-2">Signed in as</p>
                      <p className="text-[var(--text-secondary)] mb-4">{session?.user?.email}</p>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left hover:text-[var(--brand-yellow)] transition">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="p-6 flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </Suspense>
  );
}