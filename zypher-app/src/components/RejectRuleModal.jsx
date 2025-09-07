"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, Send, Loader2 } from 'lucide-react';

const RejectRuleModal = ({ 
  isOpen, 
  onClose, 
  selectedRule, 
  onReject 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onReject(rejectionReason.trim());
      // Reset form and close modal
      setRejectionReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRejectionReason('');
      onClose();
    }
  };

  if (!isOpen || !selectedRule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--input-bg)] rounded-xl border border-[var(--border-input)] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-input)]">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-500" />
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Request Modifications
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Rule Info */}
          <div className="mb-6 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-input)]">
            <h3 className="font-medium text-[var(--foreground)] mb-1">Rule Details</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              <strong>Name:</strong> {selectedRule.name}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              <strong>ID:</strong> {selectedRule.id}
            </p>
          </div>

          {/* Rejection Reason */}
          <div className="mb-6">
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide detailed feedback on what needs to be improved or fixed..."
              rows={5}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border-input)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand-yellow)] transition-colors resize-vertical min-h-[120px] disabled:opacity-50"
              required
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              This feedback will be sent to the developer to help them improve the rule.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rejectionReason.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Notifying...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Notify Developer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectRuleModal;
