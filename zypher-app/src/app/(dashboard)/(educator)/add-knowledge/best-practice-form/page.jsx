"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import {
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlignLeft,
  SlidersHorizontal,
  FileType,
  ServerCog,
  Hash,
} from "lucide-react";

// Mock API (replace with your real fetch call)
const fetchCustomRules = async () => {
  // Example structure returned by backend
  return [
    { id: 1, name: "Avoid Hardcoded Credentials", category: "yaml" },
    { id: 2, name: "Restrict Public CI/CD Variables", category: "cicd" },
    { id: 3, name: "Limit K8s Privileges", category: "k8s" },
  ];
};

export function BestPracticeForm() {
  const [customRules, setCustomRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [exampleCode, setExampleCode] = useState("");
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

  const handleRuleChange = (e) => {
    const ruleId = e.target.value;
    setSelectedRule(ruleId);

    const rule = customRules.find((r) => String(r.id) === ruleId);
    if (rule) {
      setCategory(rule.category);
    } else {
      setCategory("");
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
      console.log("Submitting Best Practice:", {
        ruleId: selectedRule,
        description,
        category,
        tags,
        exampleCode,
      });

      await new Promise((res) => setTimeout(res, 2000));

      // Remove rule from dropdown after submission
      setCustomRules((prev) => prev.filter((r) => String(r.id) !== selectedRule));
      setSelectedRule("");
      setDescription("");
      setCategory("");
      setTags("");
      setExampleCode("");

      setFeedback({ type: "success", message: "Knowledge added successfully!" });
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
      {/* Rule Selector */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Hash size={16} /> Select Rule <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedRule}
          onChange={handleRuleChange}
          className="w-full py-3 px-4 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        >
          <option value="">-- Select a custom rule --</option>
          {customRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.name}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-filled Category */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] bg-[var(--background)] mb-2 flex items-center gap-2">
          <SlidersHorizontal size={16} /> Category
        </label>
        <input
          value={category}
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
          placeholder="Explain the concept or rule in detail..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <FileType size={16} /> Tags
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., YAML, Dockerfile, secrets"
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
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
          placeholder="Paste an example snippet..."
          className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
          disabled={isSubmitting}
        />
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
            Submit Knowledge <Send size={20} />
          </>
        )}
      </button>
    </form>
  );
}
