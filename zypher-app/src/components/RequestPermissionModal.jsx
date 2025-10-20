import React from 'react';
import { X, AlertTriangle, ArrowUpCircle } from 'lucide-react';

/**
 * Modal dialog for users without permission to request custom rules
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {Object} props.user - User object with plan information
 */
const RequestPermissionModal = ({ isOpen, onClose, userPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div 
        className="relative bg-[var(--input-bg)] p-8 rounded-2xl shadow-2xl border border-[var(--border-input)] max-w-md w-full animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-600/20 text-[var(--brand-yellow)] flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">Plan Upgrade Required</h2>
          <p className="text-[var(--text-secondary)]">
            Custom rule requests are only available on higher-tier plans.
          </p>
        </div>

        <div className="bg-[var(--background)] p-4 rounded-xl mb-6 border border-[var(--border-input)]">
          <h3 className="font-medium text-[var(--foreground)] mb-2">Your Current Plan:</h3>
          <p className="text-[var(--brand-yellow)] font-medium">{userPlan ? userPlan : 'Free'}</p>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            Upgrade your plan to request custom security rules tailored to your specific needs.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <a 
            href="/dashboard/pricing"
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md"
          >
            <ArrowUpCircle size={18} /> 
            Upgrade Plan
          </a>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-[var(--border-input)] text-[var(--foreground)] rounded-full hover:bg-[var(--background)] transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestPermissionModal;