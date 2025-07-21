import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}">
      <div className="w-full max-w-[838px] mx-auto flex flex-col items-center gap-14">
        {/* Text Content */}
        <div className="w-[728px] flex flex-col lg:flex-row justify-start items-start gap-14">
          <div className="w-96 text-3xl font-medium leading-[48px] text-zinc-100">
            Hardening your CI/CD shouldn’t be hard.
          </div>
          <div className="w-80 text-base font-medium leading-normal text-stone-300">
            Zypher integrates seamlessly into your development lifecycle giving your team the tools to catch security issues early, enforce coding standards, and ship software with confidence.
          </div>
        </div>

        <Link href="/see-how-it-works">
          <button className="mt-10 inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition">
            Start free scan
            <ArrowRight size={25} />
          </button>
        </Link>
      </div>
    </section>
  );
}
