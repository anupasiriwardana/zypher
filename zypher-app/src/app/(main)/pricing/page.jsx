import { Lexend } from 'next/font/google';
import Link from 'next/link';
import { CheckCircle, Zap } from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function PricingPage() {
  return (
    <div className={`${lexend.className} bg-[var(--background)] text-[var(--foreground)] min-h-screen`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-24 text-center my-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Simple, Transparent <span className="text-[var(--brand-yellow)]">Pricing</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-16 max-w-2xl mx-auto">
          All plans include full access to Zypher’s capabilities — the only limit is how many scans you need.
        </p>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-[var(--input-bg)] border border-[var(--border-input)] rounded-2xl p-8 flex flex-col hover:border-[var(--brand-yellow)] hover:shadow-yellow-200/10 transition">
            <h2 className="text-2xl font-semibold mb-4">Free</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Start for free. Ideal for individual devs and side projects.</p>
            <div className="text-4xl font-bold mb-6">Free</div>
            <ul className="text-left space-y-3 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                Up to 5 scans per day
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                Full access to all features
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                GitHub integration
              </li>
            </ul>
            <Link href="/startFreeScan" className="mt-10 inline-block">
              <button className="w-full bg-[var(--brand-yellow)] text-[#101318] font-semibold py-3 px-6 rounded-lg hover:brightness-110 transition">
                Start Free
              </button>
            </Link>
          </div>

          {/* Monthly Plan */}
          <div className="bg-[var(--input-bg)] border border-[var(--border-input)] rounded-2xl p-8 flex flex-col hover:border-[var(--brand-yellow)] hover:shadow-yellow-200/10 transition">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Monthly</h2>
              <Zap className="text-[var(--brand-yellow)] w-6 h-6" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">For teams who scan regularly.</p>
            <div className="text-4xl font-bold mb-6">$29<span className="text-base font-normal">/mo</span></div>
            <ul className="text-left space-y-3 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                Unlimited scans
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                Full access to all features
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                GitHub integration
              </li>
            </ul>
            <Link href="/checkout/monthly" className="mt-10 inline-block">
              <button className="w-full bg-[var(--brand-yellow)] text-[#101318] font-semibold py-3 px-6 rounded-lg hover:brightness-110 transition">
                Subscribe
              </button>
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="bg-[var(--input-bg)] border border-[var(--border-input)] rounded-2xl p-8 flex flex-col hover:border-[var(--brand-yellow)] hover:shadow-yellow-200/10 transition">
            <h2 className="text-2xl font-semibold mb-4">Yearly</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Best value for long-term teams.</p>
            <div className="text-4xl font-bold mb-6">$299<span className="text-base font-normal">/yr</span></div>
            <ul className="text-left space-y-3 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                Everything in Monthly
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                2 months free
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--brand-yellow)]" />
                Priority support
              </li>
            </ul>
            <Link href="/checkout/yearly" className="mt-10 inline-block">
              <button className="w-full bg-[var(--brand-yellow)] text-[#101318] font-semibold py-3 px-6 rounded-lg hover:brightness-110 transition">
                Subscribe
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
