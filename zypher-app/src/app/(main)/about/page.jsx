import Link from "next/link";
import { Lexend } from 'next/font/google';
import { Shield, Mail, Phone, Globe } from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function AboutPage() {
  return (
    <div className={`${lexend.className} bg-[var(--background)] text-[var(--foreground)]`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
      {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-16 my-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[var(--foreground)] max-w-5xl">
            About <span className="text-[var(--brand-yellow)]">Zypher</span>
          </h1>

          <h4 className="text-[var(--text-primary)] text-[28px] leading-[44px] tracking-[-0.3px] max-w-4xl mx-auto mt-8 mb-16">
            <span className="font-semibold">
              <span className="text-[var(--brand-yellow)]">Zypher</span> was born from a simple frustration:
            </span><br />
            <span className="italic text-[24px]">
              security tools weren’t built for the way modern engineering teams ship code.
            </span>
          </h4>

          {/* About Image & Text */}
          <div className="flex flex-col lg:flex-row gap-16 items-center justify-between w-full">
            <div className="w-full lg:w-1/2">
              <img
                src="/team-secure.png" // 👈 Replace with your actual image path
                alt="Zypher Team"
                className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
              />
            </div>
            <div className="w-full lg:w-1/2 text-left text-lg leading-relaxed space-y-6">
              <p>
                As developers ourselves, we saw how clunky scanners, false positives, and disjointed workflows created friction—or worse, got ignored.
                So we built Zypher to <span className="font-semibold">fix security</span>, not add to the noise.
              </p>
              <p>
                Today, we help teams bake security into their CI/CD pipelines effortlessly—with <span className="font-semibold">smart detection</span>,
                <span className="font-semibold"> contextual fixes</span>, and <span className="font-semibold">guardrails that actually work</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 px-4 sm:px-8 md:px-16 max-w-6xl mx-auto border-t border-[var(--border-input)]">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Philosophy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)]">
              <h3 className="text-xl font-semibold mb-4">Security Should Flow</h3>
              <p className="text-[var(--text-secondary)]">
                We believe security tools should adapt to developer workflows, not the other way around. Zypher meets you where you work.
              </p>
            </div>
            <div className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)]">
              <h3 className="text-xl font-semibold mb-4">Prevention Over Detection</h3>
              <p className="text-[var(--text-secondary)]">
                Finding issues is only half the battle. We focus on preventing vulnerabilities from being introduced in the first place.
              </p>
            </div>
          </div>
        </section>

        {/* Centered Quote Section */}
        <section className="py-20 px-4 sm:px-8 md:px-16 text-center max-w-4xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <div className="w-20 text-center text-3xl font-semibold leading-[48px] mb-20">
              <span className="relative inline-flex items-center justify-center rounded-xl">
                <span
                  className="absolute inset-0 rounded-xl blur-lg opacity-50"
                  style={{ backgroundColor: "var(--brand-yellow)" }}
                ></span>
                <span className="w-14 h-14 bg-[var(--brand-yellow)] rounded-xl z-10 flex items-center justify-center p-2">
                  <Shield className="w-6 h-6 text-[#101318]" />
                </span>
              </span>
            </div>
          </div>
          <h4 className="text-[var(--text-primary)] text-[28px] leading-[44px] tracking-[-0.3px]">
            <span className="font-semibold">
              Because when security
              <span className="text-[var(--brand-yellow)]"> fits your flow</span>,<br />
              it stops being a chore and starts being a
              <span className="text-[var(--brand-yellow)]"> superpower.</span>
            </span>
          </h4>
        </section>

      </div>
    </div>
  );
}
