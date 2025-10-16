// popup in the rule maintainer custom rules page
import React, { useCallback } from "react";
import clsx from "clsx";
import {
  X,
  Trash2,
  ArrowUpCircle,
  Hourglass,
  Code,
  FlaskConical,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Re-defining mappings for this component (ideally, these would be in a central constants file)
const requestStatusMap = {
  "yet-to-review": {
    label: "Yet to Review",
    color: "text-blue-400",
    bg: "bg-blue-600/20",
    icon: Hourglass,
  },
  "being-developed": {
    label: "Being Developed",
    color: "text-purple-400",
    bg: "bg-purple-600/20",
    icon: Code,
  },
  "being-tested": {
    label: "Being Tested",
    color: "text-orange-400",
    bg: "bg-orange-600/20",
    icon: FlaskConical,
  },
  "to-be-approved": {
    label: "To Be Approved",
    color: "text-green-400",
    bg: "bg-green-600/20",
    icon: CheckCircle,
  },
  discarded: {
    label: "Discarded",
    color: "text-red-400",
    bg: "bg-red-600/20",
    icon: XCircle,
  },
  approved: {
    label: "Approved",
    color: "text-emerald-400",
    bg: "bg-emerald-600/20",
    icon: BookOpen,
  },
};

const severityMap = {
  critical: { label: "Critical", color: "text-red-500", bg: "bg-red-500/20" },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/20" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/20" },
  low: { label: "Low", color: "text-blue-400", bg: "bg-blue-400/20" },
  informational: {
    label: "Informational",
    color: "text-gray-400",
    bg: "bg-gray-400/20",
  },
};

const RuleDetailModal = ({ rule, onClose, onRemove, onUpgrade }) => {
  if (!rule) return null;

  const statusData = requestStatusMap[rule.status] || {
    label: "Unknown",
    color: "text-gray-400",
    bg: "bg-gray-600/20",
    icon: null,
  };
  const severityData = severityMap[rule.severity.toLowerCase()] || {
    label: "Unknown",
    color: "text-gray-400",
    bg: "bg-gray-600/20",
  };
  const StatusIcon = statusData.icon;

  console.log(rule);

  const handleRemove = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to remove rule "${rule.ruleName}" from the system?`
      )
    ) {
      onRemove(rule.id);
      onClose();
    }
  }, [rule, onClose, onRemove]);

  const handleUpgrade = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to initiate an upgrade process for rule "${rule.ruleName}"?`
      )
    ) {
      // In a real application, this might change the rule's status to 'being-upgraded'
      // or create a new 'upgrade-request'
      onUpgrade(rule.id);
      onClose();
    }
  }, [rule, onClose, onUpgrade]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-[var(--background)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn border border-[var(--border-input)]">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-input)]">
          <h3 className="text-2xl font-bold text-[var(--foreground)]">
            {rule.ruleName}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-[var(--foreground)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Rule ID:</p>
              <p className="font-medium text-[var(--brand-yellow)]">
                {rule.ruleId}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Severity Level:
              </p>
              <span
                className={clsx(
                  "px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-md",
                  severityData.bg,
                  severityData.color
                )}
              >
                {severityData.label}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Status:</p>
              <span
                className={clsx(
                  "px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-md items-center gap-1",
                  statusData.bg,
                  statusData.color
                )}
              >
                {StatusIcon && <StatusIcon size={16} />} {statusData.label}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Target File Types:
              </p>
              <p className="font-medium">{rule.targetFileTypes || ".YAML"}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Approved Date:
              </p>
              {/* Assuming submittedDate is also the approved date for simplicity or add a new field */}
              <p className="font-medium">
                {new Date(rule.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Description:
            </p>
            <SyntaxHighlighter
              language="python" // or javascript / yaml, etc.
              style={oneDark}
              className="rounded-md text-sm"
              showLineNumbers
            >
              {rule.description}
            </SyntaxHighlighter>
          </div>

          {/* {rule.developedCode && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Developed Code:
              </p>
              <pre className="bg-[var(--input-bg)] p-3 rounded-md text-xs overflow-x-auto border border-[var(--border-input)]">
                <code className=" text-[var(--foreground)]">
                  {rule.developedCode}
                </code>
              </pre>
            </div>
          )} */}

          {rule.testDetails && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Test Details:
              </p>
              <p className="bg-[var(--input-bg)] p-3 rounded-md text-sm border border-[var(--border-input)] text-purple-300/80">
                {rule.testDetails}
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Trash2 size={20} /> Remove Rule
            </button>
            <button
              onClick={handleUpgrade}
              className="bg-[var(--brand-yellow)] hover:bg-[#ffe01a] text-black font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <ArrowUpCircle size={20} /> Initiate Upgrade
            </button>
            <button
              onClick={onClose}
              className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold py-2 px-5 rounded-lg transition-colors duration-200 ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleDetailModal;
