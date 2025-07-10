// src/app/dashboard/UserSidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileScan,
  ListChecks,
  ShieldCheck,
  BookText,
  Settings,

} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";


const formatPageName = (id) => {
  return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const userNav = [
  { id: "start-a-scan", icon: FileScan, href: "/start-a-scan" },
  { id: "scan-results", icon: ListChecks, href: "/scan-results" },
  { id: "rules", icon: ShieldCheck, href: "/rules" },
  { id: "knowledge-base", icon: BookText, href: "/knowledge-base" },
  { id: "settings", icon: Settings, href: "/settings" },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Embedded Styles for Sidebar - Only for component-specific animations/styles */}
      <style>{`
        /* Sidebar Specific Animations */

        /* Logo Pulse Glow */
        @keyframes logo-glow-pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.05); }
        }
        .animate-logo-glow-pulse {
          animation: logo-glow-pulse 4s ease-in-out infinite alternate;
        }

        /* Active Indicator Line Animation */
        @keyframes active-indicator {
          0% { transform: translateY(-50%) scaleY(0); }
          70% { transform: translateY(-50%) scaleY(1.1); }
          100% { transform: translateY(-50%) scaleY(1); }
        }
        .animate-active-indicator {
          animation: active-indicator 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        /* NEW: Active State Square Outline Animation */
        @keyframes active-square-outline {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .is-active::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 68px; /* Slightly larger than 64px (h-16 w-16) for outline effect */
          height: 68px;
          border: 2px solid var(--brand-yellow);
          border-radius: 16px; /* rounded-xl equivalent for square look */
          box-shadow: 0 0 10px rgba(252,232,3,0.3); /* Add subtle glow to outline */
          transition: all 0.3s ease;
          animation: active-square-outline 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          z-index: 0; /* Behind the icon */
          pointer-events: none; /* Ensure it doesn't block clicks */
        }

        /* Define custom CSS variables for colors if not already in your :root */
        /* If these are already in your globals.css :root, you don't need them here. */
        :root {
          --background: #0D0D0D;
          --foreground: #F0F0F0;
          --text-secondary: #A0A0A0; /* Less used directly on icons now */
          --border-input: #2C2C2C;
          --brand-yellow: #FCE803;
          --input-bg: #1A1A1A;
          --button-bg: #2C2C2C;
          --hover-bg: #1F1F1F; /* A slightly lighter dark for hover states */
        }
      `}</style>

      <aside className="h-screen w-24 md:w-28 bg-[var(--background)] border-r border-[var(--border-input)] flex flex-col items-center py-8 fixed left-0 top-0 z-50 transition-all duration-300">

        <Link href="/start-a-scan" className="flex items-center justify-center w-16 h-16 rounded-xl mb-14 group relative overflow-hidden">
            <div/>
            
            <Image
              src="/Images/zypher.png"
              alt="Zypher Logo"
              width={36}
              height={36}
              className="relative z-10 object-contain"
            />
        </Link>
        
        {/* Navigation icons */}
        <div className="flex flex-col gap-3">
          {userNav.map(({ id, icon: Icon, href }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={id}
                href={href}
                className={clsx(
                  "relative flex items-center justify-center h-16 w-16 transition-all duration-300 group",
                  {
                    "is-active": isActive, 
                    "hover:rounded-xl hover:bg-[var(--hover-bg)]": true,
                  }
                )}
              >
               

                <Icon
                  size={30} 
                  className={clsx(
                    "transition-colors duration-300 relative z-10",
                    isActive
                      ? "text-[var(--brand-yellow)]" 
                      : "text-[var(--foreground)] group-hover:text-[var(--brand-yellow)]" 
                  )}
                />

                <div className="absolute left-[calc(100%+16px)] px-4 py-2 bg-[var(--input-bg)] text-[var(--foreground)] text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none shadow-lg border border-[var(--border-input)]">
                  {formatPageName(id)}
                </div>
              </Link>
            );
          })}
        </div>

      </aside>
    </>
  );
}