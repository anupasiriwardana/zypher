'use client';

import '@/app/globals.css';
import { Lexend } from 'next/font/google';
import UserSidebar from '@/components/sidebars/userSidebar';
import { Bell, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function DashboardLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  // console.log('Session:', session, 'Status:', status);

  // Error handling for session access
  useEffect(() => {
    try {
      // Check if session is expected but user data is missing
      if (status === "authenticated" && (!session || !session.user)) {
        console.error("Session authenticated but user data missing");
        router.push('/login?error=Session expired, please login again');
        return;
      }
      
      // Check if session is unauthenticated
      if (status === "unauthenticated") {
        router.push('/login?error=Please login');
        return;
      }
    } catch (error) {
      console.error("Dashboard session error:", error);
      router.push('/login?error=Session expired, please login again');
    }
  }, [session, status, router]);


  const hasNotifications = true;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSignOut = () => {
    try {
      signOut({
        callbackUrl: '/login', // Redirect to login after signout
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: force redirect to login
      router.push('/login?error=Sign out completed');
    }
  };

  // Show loading or return null while session is loading
  if (status === "loading") {
    return (
      <div className={lexend.className}>
        <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
          <div className="text-[var(--foreground)]">Loading...</div>
        </div>
      </div>
    );
  }

  // If no session or user data, don't render the dashboard
  if (!session || !session.user) {
    return null;
  }

  return (
    <div className={lexend.className}>
      <div className="flex">
        <UserSidebar />

        <div className="ml-28 flex flex-col flex-1 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <div className="scaled-content">
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
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full object-cover border border-[var(--border-input)]"
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <UserCircle size={36} />
                  )}
                  {/* Fallback icon (hidden by default) */}
                  <UserCircle size={36} style={{ display: 'none' }} />
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-3 w-64 bg-[var(--input-bg)] text-md rounded-xl shadow-lg p-8 z-50">
                    <p className="font-semibold mb-2">Signed in as</p>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {session?.user?.email || 'Unknown user'}
                    </p>
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

          <main className="p-4 flex-1">{children}</main>
        </div>
        </div>
      </div>
    </div>
  );
}
