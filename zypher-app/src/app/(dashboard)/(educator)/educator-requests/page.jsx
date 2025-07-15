"use client";

import { useState, useMemo } from "react";
import { Lexend } from "next/font/google";
import clsx from "clsx";
import {
  Hourglass,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  ArrowRightCircle,
} from "lucide-react";
import Link from "next/link";

const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const educatorRequests = [
  {
    id: "bp-001",
    type: "best-practice",
    ruleName: "Use Environment Variables for Secrets",
    description: "Avoid hardcoding credentials. Use environment variables for security.",
    severity: "medium",
    isCustom: true,
    submittedDate: "2025-07-10T12:00:00Z",
  },
  {
    id: "sr-001",
    type: "security-rule",
    ruleName: "Restrict Public EC2 Access",
    description: "Flags Terraform resources exposing EC2 to 0.0.0.0/0.",
    severity: "high",
    isCustom: false,
    submittedDate: "2025-07-11T09:00:00Z",
  },
  {
    id: "sr-002",
    type: "security-rule",
    ruleName: "Detect Secrets in Git History",
    description: "Scans Git commits for accidentally committed secrets using regex.",
    severity: "critical",
    isCustom: true,
    submittedDate: "2025-07-12T14:00:00Z",
  },
];

const typeMap = {
  "best-practice": {
    label: "Best Practice",
    color: "text-blue-500",
    bg: "bg-blue-600/10",
    icon: Sparkles,
    href: "/add-knowledge?type=best",
  },
  "security-rule": {
    label: "Security Rule",
    color: "text-red-500",
    bg: "bg-red-600/10",
    icon: ShieldCheck,
    href: "/add-knowledge?type=security",
  },
};

const severityColors = {
  critical: "bg-red-500/20 text-red-500",
  high: "bg-orange-500/20 text-orange-500",
  medium: "bg-yellow-400/20 text-yellow-400",
  low: "bg-blue-400/20 text-blue-400",
  informational: "bg-gray-400/20 text-gray-400",
};

export default function EducatorRequestInboxPage() {
  const [requests] = useState(educatorRequests);

  const grouped = useMemo(() => {
    const byType = { "best-practice": [], "security-rule": [] };
    for (const req of requests) {
      byType[req.type].push(req);
    }
    return byType;
  }, [requests]);

  return (
    <div className={`${lexend.className} p-6 md:p-8 lg:p-10 animate-fadeInUp`}>
      <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">
        Rule Addition Requests
      </h1>

      {Object.entries(grouped).map(([type, reqList]) => {
        const typeData = typeMap[type];
        const Icon = typeData.icon;
        return (
          <div key={type} className="mb-12">
            <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6 text-[var(--foreground)]">
              <Icon size={22} className={typeData.color} /> {typeData.label} Requests
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reqList.map((req) => (
                <div
                  key={req.id}
                  className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md hover:shadow-lg transition duration-300"
                >
                  <h3 className="text-lg font-semibold text-[var(--brand-yellow)] mb-2">
                    {req.ruleName}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs font-medium mb-4">
                    <span className={clsx("px-2 py-1 rounded-full", typeData.bg, typeData.color)}>
                      {typeData.label}
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-1 rounded-full",
                        severityColors[req.severity] || "bg-gray-400/20 text-gray-400"
                      )}
                    >
                      Severity: {req.severity}
                    </span>
                    {req.isCustom && (
                      <span className="px-2 py-1 rounded-full bg-purple-600/10 text-purple-500">
                        Custom Rule
                      </span>
                    )}
                  </div>

                  <Link
                    href={typeData.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--brand-yellow)]"
                  >
                    Add to Knowledge Hub <ArrowRightCircle size={18} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
