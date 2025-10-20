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
  ServerCog,
} from "lucide-react";

export default function KnowledgeForm({ type, title }) {
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [severity, setSeverity] = useState("");
    const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [explanation, setExplanation] = useState("");
  const [realWorldExamples, setRealWorldExamples] = useState("");
  const [potentialImpacts, setPotentialImpacts] = useState("");
  const [mitigationSteps, setMitigationSteps] = useState("");
  const [bestPracticesSummary, setBestPracticesSummary] = useState("");
  const [detectionMethods, setDetectionMethods] = useState("");
  const [references, setReferences] = useState("");
  const [exampleCode, setExampleCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // 🔹 Fetch rules dynamically by type
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch(`/api/knowledgeBaseRequests?type=${type}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRules(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchRules();
  }, [type]);

  // 🔹 Handle selection (auto-fill)
  const handleRuleChange = (e) => {
    const ruleId = e.target.value;
    setSelectedRule(ruleId);

    const rule = rules.find((r) => String(r._id) === ruleId);
    if (rule) {
      setRuleName(rule.rule_name);
      setSeverity(rule.suggested_severity || "");
      setExampleCode(rule.sample_code || "");
      setDescription(rule.rule_description);
    } else {
      setRuleName("");
      setSeverity("");
      setExampleCode("");
      setDescription("");
    }
  };


  // 🔹 Submit handler
  const handleSubmit = async (e) => {
  e.preventDefault();
  setFeedback(null);

  if (!selectedRule || !ruleName.trim() || !category.trim() || !severity.trim() || !explanation.trim()) {
    setFeedback({ type: "error", message: "All required fields must be filled." });
    return;
  }

  setIsSubmitting(true);
  try {
    const payload = {
      request_id: selectedRule, // include request ID for backend reference
      rule_id: selectedRule,
      rule_name: ruleName,
      category,
      severity,
      explanation,
      real_world_examples: realWorldExamples.split("\n").filter(Boolean),
      potential_impacts: potentialImpacts.split("\n").filter(Boolean),
      mitigation_steps: mitigationSteps.split("\n").filter(Boolean),
      best_practices_summary: bestPracticesSummary.split("\n").filter(Boolean),
      detection_methods: detectionMethods.split("\n").filter(Boolean),
      references: references.split("\n").filter(Boolean),
      status: "active",
    };

    console.log("Submitting payload:", payload); // 👈 debug

    const res = await fetch("/api/knowledgeBase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to save");
    const data = await res.json();

    setRules((prev) => prev.filter((r) => String(r._id) !== selectedRule));
    setSelectedRule("");
    setRuleName("");
    setCategory("");
    setSeverity("");
    setDescription("");
    setExplanation("");
    setRealWorldExamples("");
    setPotentialImpacts("");
    setMitigationSteps("");
    setBestPracticesSummary("");
    setDetectionMethods("");
    setReferences("");

    setFeedback({ type: "success", message: `${title} added successfully!` });
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
          <Hash size={16} /> {title} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedRule}
          onChange={handleRuleChange}
          className="w-full py-3 px-4 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        >
          <option value="">-- Select {title} --</option>
          {rules.map((rule) => (
            <option key={rule._id} value={rule._id}>
              {rule.rule_name}
            </option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <SlidersHorizontal size={16} /> Severity
        </label>
        <input
          value={severity}
          readOnly
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
        />
      </div>

      {/* Category */}
        <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
            Category <span className="text-red-500">*</span>
        </label>
        <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter the category (e.g., Secrets Management)"
            className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
            disabled={isSubmitting}
        />
        </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <AlignLeft size={16} /> Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          readOnly
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows="5"
          placeholder="Explain the custom rule in detail..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Real World Examples */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Real World Examples</label>
        <textarea
          value={realWorldExamples}
          onChange={(e) => setRealWorldExamples(e.target.value)}
          rows="4"
          placeholder="One example per line..."
          className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Potential Impacts */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Potential Impacts</label>
        <textarea
          value={potentialImpacts}
          onChange={(e) => setPotentialImpacts(e.target.value)}
          rows="4"
          placeholder="One impact per line..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Mitigation Steps */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Mitigation Steps</label>
        <textarea
          value={mitigationSteps}
          onChange={(e) => setMitigationSteps(e.target.value)}
          rows="5"
          placeholder="Steps to mitigate..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Best Practices Summary */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Best Practices Summary</label>
        <textarea
          value={bestPracticesSummary}
          onChange={(e) => setBestPracticesSummary(e.target.value)}
          rows="4"
          placeholder="Summarize best practices..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Detection Methods */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Detection Methods</label>
        <textarea
          value={detectionMethods}
          onChange={(e) => setDetectionMethods(e.target.value)}
          rows="4"
          placeholder="How to detect this issue..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Example Code */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <ServerCog size={16} /> Example Code
        </label>
        <textarea
          value={exampleCode}
          onChange={(e) => setExampleCode(e.target.value)}
          rows="6"
          className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
          disabled={isSubmitting}
        />
      </div>

      {/* References */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">References</label>
        <textarea
          value={references}
          onChange={(e) => setReferences(e.target.value)}
          rows="3"
          placeholder="One reference per line (URLs, docs...)"
          className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
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
