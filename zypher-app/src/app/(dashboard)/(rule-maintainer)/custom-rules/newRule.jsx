import { X, Hash, AlignLeft, SlidersHorizontal, ServerCog, CheckCircle, XCircle, Loader2, Send } from "lucide-react";
import clsx from "clsx";
import React, { useEffect, useState } from "react";

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
  submissionFeedback,

}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else setIsVisible(false);
  }, [isOpen]);
  console.log("open");
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  return (
    <div className={clsx("fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity", isVisible ? "opacity-100" : "opacity-0")}>
      <div className={clsx("w-full max-w-lg bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] relative max-h-[90vh] overflow-y-auto transform transition-all duration-300", isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0")}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition"><X size={22} /></button>

        <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Request a New Rule or Upgrade</h2>

        <form onSubmit={handleSubmitRule} className="space-y-5">
          {/* Inputs same as before */}
          <div>
            <label htmlFor="ruleName" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Hash size={14} /> Rule Name <span className="text-red-500">*</span>
            </label>
            <input type="text" id="ruleName" value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g., Disallow Hardcoded API Keys" className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all" required disabled={isSubmitting} />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <AlignLeft size={14} /> Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Explain the vulnerability or best practice." className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all" required disabled={isSubmitting} />
          </div>

          <div>
            <label htmlFor="severity" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Suggested Severity
            </label>
            <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all" disabled={isSubmitting}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Informational</option>
            </select>
          </div>

          <div>
            <label htmlFor="exampleCode" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <ServerCog size={14} /> Example Code (Optional)
            </label>
            <textarea id="exampleCode" value={exampleCode} onChange={(e) => setExampleCode(e.target.value)} rows={4} placeholder="Paste an example code snippet." className="w-full font-mono text-sm px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all" disabled={isSubmitting} />
          </div>

          {submissionFeedback && (
            <div className={clsx("p-3 rounded-lg text-sm mb-2 flex items-center justify-center gap-2",
              submissionFeedback.type === "success" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400")}>
              {submissionFeedback.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span>{submissionFeedback.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="px-5 py-2 rounded-lg border border-[var(--border-input)] text-[var(--foreground)] hover:bg-[var(--background)] transition" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-semibold px-6 py-2 rounded-lg hover:brightness-110 transition-all shadow-md" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <>Submit <Send size={18} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
