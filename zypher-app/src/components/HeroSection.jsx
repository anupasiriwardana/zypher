"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function HeroSection() {
  return (
    <section
      className={`min-h-[75vh] flex flex-col items-center justify-center text-center px-4 md:px-6 lg:px-8 ${lexend.className}`}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-[var(--foreground)] max-w-4xl">
        Secure Your{" "}
        <span className="inline-block relative">
          <span className="bg-[var(--brand-yellow)] text-[var(--background)] rounded-3xl px-4 py-1.5 relative z-10">
            CI/CD
          </span>
          <span
            className="absolute inset-0 rounded-xl blur-md opacity-40"
            style={{ backgroundColor: "var(--brand-yellow)" }}
          ></span>
        </span>{" "}
        <br /> from Code to Deployment
      </h1>

      <p className="mt-4 text-[var(--text-secondary)] max-w-xl text-sm sm:text-base md:text-lg leading-relaxed">
        Zypher protects your pipeline at every turn with instant scans, best practice checks,
        and continuous insights to ship code fearlessly.
      </p>

      <Link href="/see-how-it-works" className="mt-6">
        <button className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-semibold px-6 py-2.5 rounded-full hover:brightness-110 transition text-sm sm:text-base">
          Start free scan
          <ArrowRight size={20} />
        </button>
      </Link>
    </section>
  );
}