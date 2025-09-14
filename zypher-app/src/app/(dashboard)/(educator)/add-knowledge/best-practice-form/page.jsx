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
  Shield,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Search,
  Link as LinkIcon,
} from "lucide-react";

// Mock API (replace with your real fetch call)
const fetchCustomRules = async () => {
  return [
    {
      id: 1,
      name: "Container_scan",
      category: "CI/CD-SEC-7: Container Security",
      severity: "HIGH",
    },
    {
      id: 2,
      name: "Restrict Public CI/CD Variables",
      category: "CI/CD",
      severity: "CRITICAL",
    },
    {
      id: 3,
      name: "Limit K8s Privileges",
      category: "Kubernetes",
      severity: "MEDIUM",
    },
  ];
};

export function BestPracticeForm() {
  const [customRules, setCustomRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [exampleCode, setExampleCode] = useState("");
  const [realWorldExamples, setRealWorldExamples] = useState("");
  const [potentialImpacts, setPotentialImpacts] = useState("");
  const [mitigationSteps, setMitigationSteps] = useState("");
  const [bestPracticesSummary, setBestPracticesSummary] = useState("");
  const [detectionMethods, setDetectionMethods] = useState("");
  const [references, setReferences] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
      setCategory(rule.category || "");
      setSeverity(rule.severity || "");
    } else {
      setCategory("");
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
      console.log("Submitting Best Practice:", {
        ruleId: selectedRule,
        description,
        category,
        severity,
        tags,
        exampleCode,
        realWorldExamples,
        potentialImpacts,
        mitigationSteps,
        bestPracticesSummary,
        detectionMethods,
        references,
      });

      await new Promise((res) => setTimeout(res, 2000));

      setCustomRules((prev) => prev.filter((r) => String(r.id) !== selectedRule));
      setSelectedRule("");
      setDescription("");
      setCategory("");
      setSeverity("");
      setTags("");
      setExampleCode("");
      setRealWorldExamples("");
      setPotentialImpacts("");
      setMitigationSteps("");
      setBestPracticesSummary("");
      setDetectionMethods("");
      setReferences("");

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
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <SlidersHorizontal size={16} /> Category
        </label>
        <input
          value={category}
          readOnly
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
        />
      </div>

      {/* Auto-filled Severity */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Shield size={16} /> Severity
        </label>
        <input
          value={severity}
          readOnly
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
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
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
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
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
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
          className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Real World Examples */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <BookOpen size={16} /> Real World Examples
        </label>
        <textarea
          value={realWorldExamples}
          onChange={(e) => setRealWorldExamples(e.target.value)}
          rows="4"
          placeholder="List real-world cases..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Potential Impacts */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> Potential Impacts
        </label>
        <textarea
          value={potentialImpacts}
          onChange={(e) => setPotentialImpacts(e.target.value)}
          rows="4"
          placeholder="Describe potential security or compliance risks..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Mitigation Steps */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Lightbulb size={16} /> Mitigation Steps
        </label>
        <textarea
          value={mitigationSteps}
          onChange={(e) => setMitigationSteps(e.target.value)}
          rows="4"
          placeholder="Provide steps to mitigate the issue..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Best Practices Summary */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Lightbulb size={16} /> Best Practices Summary
        </label>
        <textarea
          value={bestPracticesSummary}
          onChange={(e) => setBestPracticesSummary(e.target.value)}
          rows="4"
          placeholder="Summarize recommended practices..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Detection Methods */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Search size={16} /> Detection Methods
        </label>
        <textarea
          value={detectionMethods}
          onChange={(e) => setDetectionMethods(e.target.value)}
          rows="4"
          placeholder="Explain how to detect this issue..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* References */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <LinkIcon size={16} /> References
        </label>
        <textarea
          value={references}
          onChange={(e) => setReferences(e.target.value)}
          rows="3"
          placeholder="Provide reference links..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
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
