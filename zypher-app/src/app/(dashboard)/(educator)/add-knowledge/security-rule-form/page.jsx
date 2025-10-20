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

export function SecurityRuleForm() {
  const [customRules, setCustomRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
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

  const fetchVulnerabilityRules = async () => {
  try {
    const res = await fetch("/api/knowledgeBaseRequests?type=vulnerability");
    if (!res.ok) throw new Error("Failed to fetch requests: " + res.statusText);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Front-end fetch error:", err);
    return [];
  }
};

  useEffect(() => {
    const loadRules = async () => {
      try {
        const rules = await fetchVulnerabilityRules();
        setCustomRules(rules);
      } catch (err) {
        console.error(err);
        setFeedback({ type: "error", message: "Failed to load knowledge base requests" });
      }
    };
    loadRules();
  }, []);

  // Rule selection
  const handleRuleChange = (e) => {
    const ruleId = e.target.value;
    setSelectedRule(ruleId);

    const rule = customRules.find((r) => String(r._id) === ruleId);
    if (rule) {
      setRuleName(rule.name);
      setSeverity(rule.suggested_severity || "");
      setExampleCode(rule.sample_code || "");
    } else {
      setRuleName("");
      setSeverity("");
      setExampleCode("");
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedRule || !description.trim()) {
      setFeedback({ type: "error", message: "Rule and Description are required." });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        rule_id: selectedRule,
        rule_name: ruleName,
        description,
        severity,
        explanation,
        real_world_examples: realWorldExamples.split("\n").map((e) => e.trim()).filter(Boolean),
        potential_impacts: potentialImpacts.split("\n").map((e) => e.trim()).filter(Boolean),
        mitigation_steps: mitigationSteps.split("\n").map((e) => e.trim()).filter(Boolean),
        best_practices_summary: bestPracticesSummary.split("\n").map((e) => e.trim()).filter(Boolean),
        detection_methods: detectionMethods.split("\n").map((e) => e.trim()).filter(Boolean),
        references: references.split("\n").map((e) => e.trim()).filter(Boolean),
        example_code: exampleCode,
        status: "active",
      };

      const res = await fetch("/api/knowledgeBase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save to Knowledge Base");

      setCustomRules((prev) => prev.filter((r) => String(r._id) !== selectedRule));

      setSelectedRule("");
      setRuleName("");
      setDescription("");
      setSeverity("");
      setExplanation("");
      setRealWorldExamples("");
      setPotentialImpacts("");
      setMitigationSteps("");
      setBestPracticesSummary("");
      setDetectionMethods("");
      setReferences("");
      setExampleCode("");

      setFeedback({ type: "success", message: "Rule added to Knowledge Base!" });
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
          rows="4"
          placeholder="Summarize the rule..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]"
          disabled={isSubmitting}
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows="5"
          placeholder="Explain the security issue in detail..."
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

      {/* Example Code */}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <ServerCog size={16} /> Example Code (Optional)
        </label>
        <textarea
          value={exampleCode}
          onChange={(e) => setExampleCode(e.target.value)}
          rows="6"
          placeholder="Paste example snippet..."
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
