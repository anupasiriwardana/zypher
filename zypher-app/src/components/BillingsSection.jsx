"use client";

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { 
  CheckCircle, 
  Calendar, 
  ArrowRight, 
  FileText,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BillingsSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Toast notification function - moved here to be defined before it's used
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto dismiss after 5 seconds
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setIsLoading(true);
      
      // Fetch pricing plans
      const plansResponse = await fetch('/api/pricing-plan', {
        method: 'GET'
      });
      const plansResult = await plansResponse.json();
      
      if (!plansResponse.ok) {
        throw new Error(plansResult.error || 'Failed to fetch pricing plans');
      }
      
      setPricingPlans(plansResult.data || []);
      
      // Fetch current user subscription
      const subscriptionResponse = await fetch('/api/user-plan-subscribe', {
        method: 'GET'
      });
      
      const subscriptionResult = await subscriptionResponse.json();
      
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionResult.error || 'Failed to fetch user subscription');
      }
      
      // Find the full plan details based on the plan ID from the subscription
      const userPlanId = subscriptionResult.planId;
      const planType = subscriptionResult.planType;
      const planDetails = plansResult.data?.find(plan => plan.plan_id === userPlanId);
      
      if (planDetails) {
        // Update current plan with subscription info
        updateCurrentPlan(
          planDetails, 
          subscriptionResult.data,
          planType
        );
      } else {
        // Fallback to default plan if we can't find the plan details
        const defaultPlan = plansResult.data?.find(plan => plan.status === 'default') || plansResult.data?.[0];
        if (defaultPlan) {
          updateCurrentPlan(defaultPlan, null, 'default');
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch pricing plans';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Error fetching plans or subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update current plan with subscription data
  const updateCurrentPlan = (plan, subscriptionData, planType = 'default') => {
    if (!plan) return;

    let nextBilling = null;
    let startDate = null;
    let isDefaultPlan = planType === 'default';
    
    if (!isDefaultPlan && subscriptionData) {
      // For active subscriptions, use the actual subscription dates
      
      // Use subscription end date as next billing
      if (subscriptionData.endDate) {
        const endDate = new Date(subscriptionData.endDate);
        nextBilling = endDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
      
      // Use actual start date
      if (subscriptionData.startDate) {
        const subStartDate = new Date(subscriptionData.startDate);
        startDate = subStartDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    
    setCurrentPlan({
      id: plan._id,
      name: plan.planName,
      features: plan.features || [],
      nextBilling: nextBilling,
      startDate: startDate,
      scanLimit: plan.scanLimit,
      allowCustomRuleRequests: plan.allowCustomRuleRequests,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      isDefaultPlan: isDefaultPlan,
      subscriptionData: subscriptionData || null
    });
  };

  // Transform fetched pricing plans for display
  const getAvailablePlans = () => {
    if (!pricingPlans || !pricingPlans.length) return [];
    
    return pricingPlans.map(plan => {
      // Skip the current plan in available plans list
      if (currentPlan && plan._id === currentPlan.id) return null;
      
      // Get appropriate price based on billing period
      const price = isYearly 
        ? `$${Number(plan.yearly_price).toFixed(2)}/year` 
        : `$${Number(plan.monthly_price).toFixed(2)}/month`;
      
      const planFeatures = [...(plan.features || [])];
      
      // Add scan limit as a feature
      if (plan.scanLimit === -1) {
        planFeatures.unshift('Unlimited scans');
      } else {
        planFeatures.unshift(`Up to ${plan.scanLimit} scans per day`);
      }
      
      // Add custom rule requests as a feature if allowed
      if (plan.allowCustomRuleRequests) {
        planFeatures.push('Custom rule requests');
      }
      
      // Determine button text and color based on relative price
      let buttonText = 'Select Plan';
      let buttonColor = 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black';
      
      if (currentPlan) {
        // Always compare against the monthly price of the current plan
        // This ensures consistency with how the current plan is displayed
        const currentPlanPrice = currentPlan.monthly_price;
        
        // For available plans, use the price based on toggle state
        const comparePlanPrice = isYearly ? 
          (plan.yearly_price || plan.monthly_price * 12 * 0.8) / 12 : // Convert yearly to monthly equivalent for comparison
          plan.monthly_price;
        
        if (comparePlanPrice < currentPlanPrice) {
          buttonText = 'Downgrade';
          buttonColor = 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black';
        } else {
          buttonText = 'Upgrade';
          buttonColor = 'text-green-400 border-green-400 hover:bg-green-400 hover:text-black';
        }
        
        if (plan.monthly_price === 0) {
          buttonText = 'Downgrade to Free';
        }
      }
      
      return {
        id: plan._id,
        name: plan.planName,
        price: price,
        features: planFeatures,
        buttonText: buttonText,
        buttonColor: buttonColor,
        monthly_price: plan.monthly_price,
        yearly_price: plan.yearly_price
      };
    }).filter(Boolean); // Remove null items (current plan)
  };
  
  const availablePlans = getAvailablePlans();

  const paymentHistory = [
    { date: "Jul 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-001" },
    { date: "Jun 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-002" },
    { date: "May 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-003" },
    { date: "Apr 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-004" },
  ];

  const handlePlanAction = async (planId) => {
    try {
      setIsLoading(true);
      
      // Find the plan details to include in the subscription
      const newPlan = pricingPlans.find(p => p._id === planId);
      
      if (!newPlan) {
        throw new Error('Selected plan not found');
      }
      
      // Determine which ID to use - prefer plan_id if available, otherwise use MongoDB _id
      const planIdForApi = newPlan.plan_id || newPlan._id;
      
      // Make API call to create user subscription
      const response = await fetch('/api/user-plan-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include user identification headers if needed
          'x-user-id': localStorage.getItem('userId') || 'current-user-id',
          'x-user-role': 'primary-user'
        },
        body: JSON.stringify({
          plan_id: planIdForApi, // API expects plan_id, not planId
          isYearly: isYearly // Pass current toggle state to determine billing cycle
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update subscription');
      }
      
      // Show success message using toast
      showToast(`Successfully switched to ${newPlan.planName} ${isYearly ? 'yearly' : 'monthly'} plan!`, 'success');
      
      // Reset toggle to monthly view after selection
      setIsYearly(false);
      
      // Refresh pricing plans to reflect new subscription
      setTimeout(() => {
        fetchPricingPlans();
      }, 1000);
    } catch (error) {
      console.error('Error updating plan:', error);
      showToast(`Failed to update plan: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvoice = (invoiceId) => {
    alert(`Viewing invoice: ${invoiceId}. (Simulated)`);
    // when backend connected, this function would fetch and display invoice details
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[var(--brand-yellow)] mx-auto mb-4" />
          <p className="text-lg text-[var(--text-secondary)]">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
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

  // Toast notification function is now defined at the top of the component
  
  return (
    <div className="relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-md flex items-center gap-2 max-w-md animate-in slide-in-from-top-5 duration-300 ${
          toast.type === 'success' ? 'bg-green-600/20 text-green-400 border border-green-400' :
          'bg-red-600/20 text-red-400 border border-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 text-sm opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Your Current Plan</h2>
        
        {/* Billing Toggle */}
        <div className="flex items-center">
          <span className={`mr-3 ${!isYearly ? 'text-[var(--foreground)]' : 'text-[var(--text-secondary)]'}`}>
            Monthly
          </span>
          <button
            onClick={() => {
              setIsYearly(!isYearly);
              // No need to update current plan since it should always show monthly pricing
            }}
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
      </div>
      
      {currentPlan ? (
        <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md mb-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--brand-yellow)] mb-2">{currentPlan.name}</h3>
            </div>
            
            {!currentPlan.isDefaultPlan && (
              <div className="bg-[var(--brand-yellow)]/10 px-3 py-1 rounded-full border border-[var(--brand-yellow)]">
                <span className="text-sm font-medium text-[var(--brand-yellow)]">Active</span>
              </div>
            )}
            
            {currentPlan.isDefaultPlan && (
              <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400">
                <span className="text-sm font-medium text-blue-400">Default</span>
              </div>
            )}
          </div>
          
          <ul className="text-[var(--text-secondary)] mb-4 space-y-1">
            {/* Display scan limit as feature */}
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" /> 
              {currentPlan.scanLimit === -1 ? 'Unlimited scans' : `Up to ${currentPlan.scanLimit} scans per day`}
            </li>
            
            {/* Display custom rule requests if allowed */}
            {currentPlan.allowCustomRuleRequests && (
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" /> Custom rule requests
              </li>
            )}
            
            {/* Display other features */}
            {currentPlan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" /> {feature}
              </li>
            ))}
          </ul>
          
          {/* Subscription details - Only show for non-default plans */}
          {!currentPlan.isDefaultPlan && (
            <div className="border-t border-[var(--border-input)] pt-4 mt-4">
              {currentPlan.startDate && (
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mb-2">
                  <Zap size={16} /> 
                  Subscription started: {currentPlan.startDate}
                </p>
              )}
              
              {currentPlan.nextBilling && (
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Calendar size={16} /> Next Billing: {currentPlan.nextBilling}
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => {
                const explorePlans = document.getElementById('explore-plans');
                if (explorePlans) {
                  explorePlans.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-flex items-center gap-2 border-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)] px-6 py-3 rounded-full hover:bg-[var(--brand-yellow)] hover:text-[var(--background)] transition-all duration-300 text-base"
            >
              {currentPlan.isDefaultPlan ? 'Select Plan' : 'Change Plan'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md mb-10 text-center">
          <p className="text-[var(--text-secondary)]">No active subscription found. Please select a plan below.</p>
        </div>
      )}

      <h2 id="explore-plans" className="text-2xl font-bold mb-6 text-[var(--foreground)]">Explore Other Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {availablePlans.length > 0 ? availablePlans.map((plan) => (
          <div key={plan.id} className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{plan.name}</h3>
            <p className="text-lg font-bold text-[var(--brand-yellow)] mb-3">{plan.price}</p>
            <ul className="text-[var(--text-secondary)] mb-6 space-y-1 flex-grow">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" /> {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanAction(plan.id)}
              className={clsx(
                "inline-flex items-center justify-center gap-2 border-2 px-6 py-3 rounded-full font-bold transition-all duration-300 text-base mt-auto",
                plan.buttonColor
              )}
            >
              {plan.buttonText} <ArrowRight size={16} />
            </button>
          </div>
        )) : (
          <div className="col-span-3 bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md text-center">
            <p className="text-[var(--text-secondary)]">No other subscription plans available at this time.</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Payment History</h2>
      <div className="overflow-x-auto bg-[var(--background)] rounded-xl shadow-md border border-[var(--border-input)]">
        <table className="min-w-full divide-y divide-[var(--border-input)]">
          <thead className="bg-[var(--hover-bg)]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Plan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-input)]">
            {paymentHistory.map((item, index) => (
              <tr key={index} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{item.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{item.plan}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", item.status === 'Paid' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewInvoice(item.invoice)}
                    className="text-[var(--brand-yellow)] hover:underline flex items-center gap-1"
                  >
                    <FileText size={14} /> {item.invoice}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}