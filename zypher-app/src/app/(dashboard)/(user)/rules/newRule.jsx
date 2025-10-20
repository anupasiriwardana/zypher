import { X, Hash, AlignLeft, SlidersHorizontal, ServerCog, CheckCircle, XCircle, Loader2, Send } from "lucide-react";
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[var(--input-bg)] p-8 rounded-2xl shadow-2xl border border-[var(--border-input)] relative animate-fadeInUp">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition"
        >
          <X size={24} />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">
          Request a New Rule or Best Practice
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Got a specific vulnerability or best practice you'd like us to add? 
          Describe it here and our rule developers will review your request.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmitRule} className="space-y-6">
          
          {/* Rule Name */}
          <div>
            <label htmlFor="ruleName" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Hash size={16} /> Rule Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="ruleName"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g., Disallow Hardcoded API Keys"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] 
                         text-[var(--foreground)] placeholder-[var(--text-secondary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <AlignLeft size={16} /> Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              placeholder="Explain the vulnerability or best practice, why it's important, and its impact."
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] 
                         text-[var(--foreground)] placeholder-[var(--text-secondary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Severity */}
          <div className="w-full">
            <label htmlFor="severity" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Suggested Severity
            </label>
            <div className="relative">
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] 
                           text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg leading-tight 
                           focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
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
              <ServerCog size={16} /> Example Code (Optional)
            </label>
            <textarea
              id="exampleCode"
              value={exampleCode}
              onChange={(e) => setExampleCode(e.target.value)}
              rows="6"
              placeholder="Paste an example code snippet (YAML, JSON, etc.) where this rule should ideally trigger."
              className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] 
                         text-[var(--foreground)] placeholder-[var(--text-secondary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Submission Feedback */}
          {submissionFeedback && (
            <div
              className={clsx(
                "p-3 rounded-lg text-sm mb-4 flex items-center justify-center gap-2",
                submissionFeedback.type === "success"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              )}
            >
              {submissionFeedback.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <XCircle size={18} />
              )}
              <span>{submissionFeedback.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-3 bg-[var(--brand-yellow)] 
                       text-[var(--background)] font-bold px-8 py-4 rounded-full 
                       hover:brightness-110 transition-all duration-300 shadow-lg text-lg 
                       transform hover:-translate-y-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit <Send size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
