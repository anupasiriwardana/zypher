"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListTodo,
  Code,
  Settings,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";


const formatPageName = (id) => {
  return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ruleDeveloperNav = [
  { id: "assigned-rules", icon: ListTodo, href: "/assigned-rules" },
  { id: "development-workspace", icon: Code, href: "/development-workspace" },
  { id: "rule-developer-settings", icon: Settings, href: "/rule-developer-settings" },
];

export default function RuleDeveloperSidebar() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        /* ========= SIDEBAR ANIMATIONS ========= */

        @keyframes logo-glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .animate-logo-glow-pulse {
          animation: logo-glow-pulse 4s ease-in-out infinite alternate;
        }

        @keyframes active-square-outline {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* ========= ACTIVE STATE ========= */
        .is-active::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 52px;
          height: 52px;
          border: 2px solid var(--brand-yellow);
          border-radius: 12px;
          box-shadow: 0 0 8px rgba(252, 232, 3, 0.3);
          animation: active-square-outline 0.3s ease forwards;
          z-index: 0;
          pointer-events: none;
          transition: all 0.25s ease;
        }

        .is-active:hover::before {
          box-shadow: 0 0 12px rgba(252, 232, 3, 0.4);
          transform: translate(-50%, -50%) scale(1.05);
        }

        /* ========= HOVER STATE ========= */
        .nav-item:hover {
          background-color: var(--hover-bg);
          border-radius: 12px;
          transition: background-color 0.3s ease, border-radius 0.3s ease;
        }

        /* ========= TOOLTIP ========= */
        .tooltip {
          position: absolute;
          left: calc(100% + 16px);
          background-color: var(--input-bg);
          color: var(--foreground);
          font-size: 0.875rem;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          border: 1px solid var(--border-input);
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.35);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-4px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .group:hover .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* ========= COLORS ========= */
        :root {
          --background: #0D0D0D;
          --foreground: #F0F0F0;
          --border-input: #2C2C2C;
          --brand-yellow: #FCE803;
          --input-bg: #1A1A1A;
          --hover-bg: #1F1F1F;
        }
      `}</style>

    <aside
        className="
          fixed top-0 left-0
          h-screen
          w-20 md:w-28
          bg-[var(--background)]
          border-r border-[var(--border-input)]
          flex flex-col items-center
          pb-8 z-50
          transition-all duration-300
        "
      >


        <Link href="/assigned-rules" className="flex items-center justify-center w-16 h-16 rounded-xl mb-8 group relative overflow-hidden">
            <div className="absolute inset-0 rounded-xl animate-logo-glow-pulse"></div>
            
            <Image
              src="/Images/zypher.png"
              alt="Zypher Logo"
              width={24}
              height={24}
              className="relative z-10 object-contain"
            />
        </Link>
        
        {/* Navigation icons */}
        <div className="flex flex-col gap-3">
          {ruleDeveloperNav.map(({ id, icon: Icon, href }) => {

            const isActive = pathname === href || pathname.startsWith(`${href}/`); 

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
                  size={26}
                  className={clsx(
                    "transition-colors duration-300 relative z-10",
                    isActive
                      ? "text-[var(--brand-yellow)]"
                      : "text-[var(--foreground)] group-hover:text-[var(--brand-yellow)]"
                  )}
                />

                {/* Tooltip for navigation item */}
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