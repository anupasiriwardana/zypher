'use client';

import '@/app/globals.css';
import { Lexend } from 'next/font/google';
import RuleDeveloperSidebar from '@/components/sidebars/ruleDeveloperSidebar';
import { Bell, UserCircle, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { useState, Suspense } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import ChatPortal from '@/components/ChatPortal'; // Make sure the path is correct

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function DashboardLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatPortal, setShowChatPortal] = useState(false); // New state for chat
  const { data: session, status } = useSession();

  const hasNotifications = true;
  const hasNewMessages = true; // Placeholder for chat notifications

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
    <Suspense fallback={<div className={lexend.className}>Loading...</div>}>
      <div className={lexend.className}>
        <div className="flex">
          <RuleDeveloperSidebar />

          <div className="ml-28 flex flex-col flex-1 min-h-screen bg-[var(--background)] text-[var(--foreground)]">

            <header className="flex items-center justify-between px-6 py-4 relative">
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
                      setShowChatPortal(false); // Close other popups
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

                {/* Chat Icon for User-to-User Messages */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowChatPortal(!showChatPortal);
                      setShowProfile(false);
                      setShowNotifications(false); // Close other popups
                    }}
                    className="relative hover:text-[var(--brand-yellow)] transition"
                  >
                    <MessageCircle size={36} />
                    {hasNewMessages && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>

                {/* User Profile Icon */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfile(!showProfile);
                      setShowNotifications(false);
                      setShowChatPortal(false); // Close other popups
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
                      <p className="text-[var(--text-secondary)] mb-4">{session.user.email}</p>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left hover:text-[var(--brand-yellow)] transition"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="p-4 flex-1">
              {showChatPortal ? <ChatPortal onClose={() => setShowChatPortal(false)} /> : children}
            </main>
          </div>
        </div>
      </div>
    </Suspense>
  );
}