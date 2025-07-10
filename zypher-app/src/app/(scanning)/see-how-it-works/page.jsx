// src/app/see-how-it-works/page.js
"use client";

import Link from "next/link";
import { ShieldCheck, UploadCloud, FileText, SearchCheck, TrendingUp, ArrowRight } from "lucide-react";
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function SeeHowItWorksPage() {
  return (
    <main className={`min-h-screen px-4 md:px-16 pt-48 pb-16 text-[var(--foreground)] max-w-7xl mx-auto ${lexend.className}`}>
      <section className="text-center mb-20 md:mb-28">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fadeInUp">
          Demystifying pipeline security, <br className="hidden md:block"/> see how Zypher works
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-3xl mx-auto animate-fadeInUp delay-200">
          From intelligent config scanning to automated rule enforcement, Zypher simplifies the journey to a more secure CI/CD pipeline.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8 mb-20">
   
        <div className="group flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-input)] shadow-lg hover:shadow-2xl hover:border-[var(--brand-yellow)] transition-all duration-300 animate-fadeInUp">
          <div className="relative p-4 rounded-full bg-[var(--button-bg)] border border-[var(--brand-yellow)] mb-5 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-500"
              style={{
                background: `radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
            ></div>
            <UploadCloud size={32} className="text-[var(--brand-yellow)] relative z-10" />
          </div>
          <h3 className="font-semibold text-2xl mb-2">1. Input Your Data</h3>
          <p className="text-[var(--text-secondary)] text-base">
            Securely upload config files, paste code, or connect your repository.
          </p>
        </div>


        <div className="group flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-input)] shadow-lg hover:shadow-2xl hover:border-[var(--brand-yellow)] transition-all duration-300 animate-fadeInUp delay-100">
          <div className="relative p-4 rounded-full bg-[var(--button-bg)] border border-[var(--brand-yellow)] mb-5 overflow-hidden">
             <div
              className="absolute inset-0 opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-500"
              style={{
                background: `radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
            ></div>
            <FileText size={32} className="text-[var(--brand-yellow)] relative z-10" />
          </div>
          <h3 className="font-semibold text-2xl mb-2">2. Intelligent Analysis</h3>
          <p className="text-[var(--text-secondary)] text-base">
            Zypher's engine deeply scans your input against updated security policies.
          </p>
        </div>


        <div className="group flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-input)] shadow-lg hover:shadow-2xl hover:border-[var(--brand-yellow)] transition-all duration-300 animate-fadeInUp delay-200">
          <div className="relative p-4 rounded-full bg-[var(--button-bg)] border border-[var(--brand-yellow)] mb-5 overflow-hidden">
             <div
              className="absolute inset-0 opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-500"
              style={{
                background: `radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
            ></div>
            <SearchCheck size={32} className="text-[var(--brand-yellow)] relative z-10" />
          </div>
          <h3 className="font-semibold text-2xl mb-2">3. Real-time Enforcement</h3>
          <p className="text-[var(--text-secondary)] text-base">
            Meticulously match configs to policies, flagging risks and enforcing guardrails.
          </p>
        </div>


        <div className="group flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-input)] shadow-lg hover:shadow-2xl hover:border-[var(--brand-yellow)] transition-all duration-300 animate-fadeInUp delay-300">
          <div className="relative p-4 rounded-full bg-[var(--button-bg)] border border-[var(--brand-yellow)] mb-5 overflow-hidden">
             <div
              className="absolute inset-0 opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-500"
              style={{
                background: `radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
            ></div>
            <TrendingUp size={32} className="text-[var(--brand-yellow)] relative z-10" />
          </div>
          <h3 className="font-semibold text-2xl mb-2">4. Actionable Insights</h3>
          <p className="text-[var(--text-secondary)] text-base">
            Gain clear insights, monitor trends, and continuously harden your CI/CD.
          </p>
        </div>
      </section>


      <section className="bg-[var(--input-bg)] rounded-3xl p-10 md:p-16 mb-20 text-center relative overflow-hidden shadow-2xl animate-fadeInUp delay-400 border border-[var(--border-input)]">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        ></div>
        <div
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full z-0 opacity-20"
          style={{
            background: `radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)`,
            filter: 'blur(100px)'
          }}
        ></div>
        <div
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full z-0 opacity-20"
          style={{
            background: `radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)`,
            filter: 'blur(100px)'
          }}
        ></div>

        <div className="relative z-10">
          <ShieldCheck size={70} className="mx-auto mb-6 text-[var(--brand-yellow)] drop-shadow-xl" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built by Security Experts, for Your Peace of Mind</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-3xl mx-auto">
            Zypher is engineered on the foundation of industry-leading security best practices. Our continuous rule updates and robust auditing systems ensure your deployments are not just airtight, but also continuously adapting to emerging threats.
          </p>
        </div>
      </section>


      <section className="text-center mt-10 md:mt-16 bg-[var(--input-bg)] rounded-2xl p-8 md:p-12 shadow-xl animate-fadeInUp delay-500 border border-[var(--border-input)]">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          Ready to Elevate Your CI/CD Security?
        </h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto mb-10">
          Experience the power of proactive pipeline protection. Start securing your code from commit to deploy.
        </p>
        <Link href="/signup">
          <button className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-10 py-5 rounded-full hover:brightness-110 transition-all duration-300 shadow-xl text-xl transform hover:-translate-y-1">
            Create Your Account
            <ArrowRight size={28} />
          </button>
        </Link>
      </section>
    </main>
  );
}