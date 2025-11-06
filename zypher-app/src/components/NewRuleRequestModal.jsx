"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
    X, Hash, AlignLeft, SlidersHorizontal, ServerCog, 
    CheckCircle, XCircle, Loader2, Send 
  } from "lucide-react";
  import clsx from "clsx";
  
  export default function NewRuleRequestModal({
    isOpen,
    onClose,
    ruleName,
    setRuleName,
    description,
    setDescription,
    severity,
    setSeverity,
    exampleCode,
    setExampleCode,
    isSubmitting,
    handleSubmitRule,
    submissionFeedback
  }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      // Cleanup function to reset overflow when component unmounts
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const modal = (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] relative animate-fadeInUp max-h-[90vh] overflow-y-auto">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition"
          >
            <X size={22} />
          </button>
  
          {/* Modal Title */}
          <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">
            Request a New Rule or Best Practice
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">
            Got a specific vulnerability or best practice you'd like us to add? 
            Describe it here and our rule developers will review your request.
          </p>
  
          {/* Form */}
          <form onSubmit={handleSubmitRule} className="space-y-5">
            
            {/* Rule Name */}
            <div>
              <label htmlFor="ruleName" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Hash size={14} /> Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ruleName"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., Disallow Hardcoded API Keys"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] 
                           text-[var(--foreground)] placeholder-[var(--text-secondary)] 
                           focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all"
                required
                disabled={isSubmitting}
              />
            </div>
  
            {/* Description */}
            <div>
              <label htmlFor="description" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <AlignLeft size={14} /> Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Explain the vulnerability or best practice, why it's important, and its impact."
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] 
                           text-[var(--foreground)] placeholder-[var(--text-secondary)] 
                           focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all"
                required
                disabled={isSubmitting}
              />
            </div>
  
            {/* Severity */}
            <div>
              <label htmlFor="severity" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <SlidersHorizontal size={14} /> Suggested Severity
              </label>
              <div className="relative">
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] 
                             text-[var(--foreground)] py-2 px-3 pr-8 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all"
                  disabled={isSubmitting}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Informational</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" /></svg>
                </div>
              </div>
            </div>
  
            {/* Example Code */}
            <div>
              <label htmlFor="exampleCode" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <ServerCog size={14} /> Example Code (Optional)
              </label>
              <textarea
                id="exampleCode"
                value={exampleCode}
                onChange={(e) => setExampleCode(e.target.value)}
                rows={4}
                placeholder="Paste an example code snippet (YAML, JSON, etc.) where this rule should ideally trigger."
                className="w-full font-mono text-sm px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] 
                           text-[var(--foreground)] placeholder-[var(--text-secondary)] 
                           focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
            </div>
  
            {/* Submission Feedback */}
            {submissionFeedback && (
              <div
                className={clsx(
                  "p-3 rounded-lg text-sm mb-2 flex items-center justify-center gap-2",
                  submissionFeedback.type === "success"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-red-600/20 text-red-400"
                )}
              >
                {submissionFeedback.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                <span>{submissionFeedback.message}</span>
              </div>
            )}
  
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg border border-[var(--border-input)] text-[var(--foreground)] hover:bg-[var(--background)] transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[var(--brand-yellow)] 
                           text-[var(--background)] font-semibold px-6 py-2 rounded-lg 
                           hover:brightness-110 transition-all shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit <Send size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    // Avoid SSR mismatch and ensure we render into body so overlay always centers in viewport
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(modal, document.body);
  }