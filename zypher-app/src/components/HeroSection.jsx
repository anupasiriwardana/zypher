"use client";

import { ArrowRight } from "lucide-react"; // You can use react-icons too if preferred
import Link from "next/link";
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // choose weights you need
});

export default function HeroSection() {

  return (
    <section className={`min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}`}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[var(--foreground)] max-w-5xl">
        Secure Your{" "}
        <span className="inline-block relative">
          <span className="bg-[var(--brand-yellow)] text-[var(--background)] rounded-4xl px-6 py-2 relative z-10">
            CI/CD
          </span>
          <span
            className="absolute inset-0 rounded-xl blur-lg opacity-50"
            style={{ backgroundColor: "var(--brand-yellow)" }}
          ></span>
        </span>{" "}
        <br /> from Code to Deployment
      </h1>

      <p className="mt-6 text-[var(--text-secondary)] max-w-2xl text-base sm:text-lg">
        Zypher protects your pipeline at every turn with instant scans, best practice checks,
        and continuous insights to ship code fearlessly.
      </p>

      <Link href="/see-how-it-works" className="mt-8">
        <button className="mt-10 inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition">
          Start free scan
          <ArrowRight size={25} />
        </button>
      </Link>
    </section>
  );
}
