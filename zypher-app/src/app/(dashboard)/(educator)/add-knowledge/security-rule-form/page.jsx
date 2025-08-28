"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import {
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Hash,
  AlignLeft,
  SlidersHorizontal,
  FileType,
  ServerCog,
} from "lucide-react";

// Mock API (replace with real API fetch)
const fetchCustomRules = async () => {
  return [
    { id: 1, name: "Restrict Public EC2 Access", severity: "high" },
    { id: 2, name: "Detect Secrets in Git History", severity: "critical" },
  ];
};

export function SecurityRuleForm() {
  const [customRules, setCustomRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [fileTypes, setFileTypes] = useState("");
  const [exampleCode, setExampleCode] = useState("");
  const [isCustomRule, setIsCustomRule] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Load rules on mount
  useEffect(() => {
    const loadRules = async () => {
      const rules = await fetchCustomRules();
      setCustomRules(rules);
    };
    loadRules();
  }, []);

  // Handle rule selection
  const handleRuleChange = (e) => {
    const ruleId = e.target.value;
    setSelectedRule(ruleId);

    const rule = customRules.find((r) => String(r.id) === ruleId);
    if (rule) {
      setRuleName(rule.name);
      setSeverity(rule.severity);
    } else {
      setRuleName("");
      setSeverity("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedRule || !description.trim()) {
      setFeedback({
        type: "error",
        message: "Rule and Description are required.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting Security Rule:", {
        ruleId: selectedRule,
        ruleName,
        description,
        severity,
        fileTypes,
        exampleCode,
        isCustomRule,
      });

      await new Promise((res) => setTimeout(res, 2000));

      // Remove rule after submission
      setCustomRules((prev) => prev.filter((r) => String(r.id) !== selectedRule));

      // Reset form
      setSelectedRule("");
      setRuleName("");
      setDescription("");
      setSeverity("");
      setFileTypes("");
      setExampleCode("");
      setIsCustomRule(false);

      setFeedback({
        type: "success",
        message: "Security rule submitted successfully!",
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[var(--input-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-input)]"
    >
      {/* Rule Name (Dropdown) */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Hash size={16} /> Rule Name <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedRule}
          onChange={handleRuleChange}
          className="w-full py-3 px-4 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        >
          <option value="">-- Select security rule --</option>
          {customRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.name}
            </option>
          ))}
        </select>
      </div>

      {/* Severity (Auto-filled) */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <SlidersHorizontal size={16} /> Severity
        </label>
        <input
          value={severity}
          readOnly
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <AlignLeft size={16} /> Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          placeholder="Describe the rule, its impact, and context..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        />
      </div>

      {/* File Types */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <FileType size={16} /> Target File Types
        </label>
        <input
          value={fileTypes}
          onChange={(e) => setFileTypes(e.target.value)}
          placeholder="e.g., .yml, .tf, Dockerfile"
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Example Code */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <ServerCog size={16} /> Example Code (Optional)
        </label>
        <textarea
          value={exampleCode}
          onChange={(e) => setExampleCode(e.target.value)}
          rows="6"
          placeholder="Paste example YAML / JSON / Docker snippet..."
          className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Custom Rule Checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="isCustomRule"
          type="checkbox"
          checked={isCustomRule}
          onChange={(e) => setIsCustomRule(e.target.checked)}
          disabled={isSubmitting}
          className="w-5 h-5 text-[var(--brand-yellow)] focus:ring-[var(--brand-yellow)] border-gray-300 rounded"
        />
        <label
          htmlFor="isCustomRule"
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Is this a custom rule?
        </label>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={clsx(
            "p-3 rounded-lg text-sm flex items-center gap-2",
            feedback.type === "success"
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          )}
        >
          {feedback.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Rule <Send size={20} />
          </>
        )}
      </button>
    </form>
  );
}
