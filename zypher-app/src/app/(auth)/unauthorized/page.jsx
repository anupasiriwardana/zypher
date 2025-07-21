"use client";

import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function UnauthorizedPage() {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] ${lexend.className}`}>
      <div className="bg-[var(--input-bg)] p-10 rounded-3xl shadow-xl border border-[var(--border-input)] max-w-lg w-full text-center animate-fadeInUp">
        <Lock size={48} className="mx-auto mb-6 text-red-500" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">You do not have permission to view this page.<br />If you believe this is a mistake, please contact your administrator.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg">
          <ArrowLeft size={20} /> Go Back Home
        </Link>
      </div>
    </div>
  );
}
