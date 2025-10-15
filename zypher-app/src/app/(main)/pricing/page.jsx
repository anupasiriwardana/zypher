'use client';

import Link from 'next/link';
import { CheckCircle, Zap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pricing-plan-landing-page');
      const result = await response.json();
      
      if (response.ok) {
        setPricingPlans(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch pricing plans');
      }
    } catch (err) {
      setError('Failed to fetch pricing plans');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${Number(price).toFixed(2)}`;
  };

  const getScanLimitText = (scanLimit) => {
    if (scanLimit === -1) return 'Unlimited scans';
    return `Up to ${scanLimit} scans per day`;
  };

  const isCustomRuleRequestsAllowed = (allowCustomRuleRequests) => {
    if (allowCustomRuleRequests) {
      return 'Includes custom rule requests';
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[var(--brand-yellow)] mx-auto mb-4" />
          <p className="text-lg text-[var(--text-secondary)]">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchPricingPlans}
            className="bg-[var(--brand-yellow)] text-[#101318] font-semibold py-2 px-4 rounded-lg hover:brightness-110 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-24 text-center my-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Simple, Transparent <span className="text-[var(--brand-yellow)]">Pricing</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
          All plans include full access to Zypher's capabilities — the only limit is how many scans you need.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-16">
          <span className={`mr-3 ${!isYearly ? 'text-[var(--foreground)]' : 'text-[var(--text-secondary)]'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--input-bg)] border border-[var(--border-input)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-[var(--brand-yellow)] transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`ml-3 ${isYearly ? 'text-[var(--foreground)]' : 'text-[var(--text-secondary)]'}`}>
            Yearly
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan._id}
              className={`rounded-2xl p-8 border border-[var(--border-edge)] flex flex-col ${
                plan.status === 'default' ? 'bg-[var(--card-highlight-bg)]' : 'bg-[var(--card-bg)]'
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.planName}</h3>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">
                    {formatPrice(isYearly ? plan.yearly_price : plan.monthly_price)}
                  </span>
                  {plan.monthly_price > 0 && (
                    <span className="text-[var(--text-secondary)] ml-2 mb-1">
                      {isYearly ? '/year' : '/month'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle size={18} className="text-[var(--brand-yellow)] mt-0.5 mr-2 flex-shrink-0" />
                    <span>{getScanLimitText(plan.scanLimit)}</span>
                  </div>
                  {plan.allowCustomRuleRequests && (
                    <div className="flex items-start">
                    <CheckCircle size={18} className="text-[var(--brand-yellow)] mt-0.5 mr-2 flex-shrink-0" />
                    <span>{isCustomRuleRequestsAllowed(true)}</span>
                  </div>
                  )}
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle size={18} className="text-[var(--brand-yellow)] mt-0.5 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link
                  href='/login'
                  className={`w-full inline-block text-center py-3 px-6 rounded-lg font-medium transition bg-[var(--brand-yellow)] text-[#101318] hover:brightness-110`}
                >
                  {plan.monthly_price === 0 ? 'Start for Free' : 'Get Started'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="mt-16">
          <p className="text-[var(--text-secondary)]">
            Have questions about pricing or need a custom plan?{' '}
            <Link href="/contact" className="text-[var(--brand-yellow)] hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
