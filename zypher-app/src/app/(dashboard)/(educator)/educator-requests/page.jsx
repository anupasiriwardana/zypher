"use client";

import { useEffect, useState } from "react";
import { Lexend } from "next/font/google";
import clsx from "clsx";
import {
  ShieldCheck,
  Sparkles,
  FileCode,
  ArrowRightCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const typeMap = {
  bestpractice: {
    label: "Best Practice",
    color: "text-blue-500",
    bg: "bg-blue-600/10",
    icon: Sparkles,
    href: "/add-knowledge?type=best",
  },
  vulnerability: {
    label: "Vulnerability",
    color: "text-red-500",
    bg: "bg-red-600/10",
    icon: ShieldCheck,
    href: "/add-knowledge?type=vuln",
  },
  custom: {
    label: "Custom Rule",
    color: "text-purple-500",
    bg: "bg-purple-600/10",
    icon: FileCode,
    href: "/add-knowledge?type=custom",
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
  const [requests, setRequests] = useState({
    bestpractice: [],
    vulnerability: [],
    custom: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        // fetch all 3 types
        const types = ["bestpractice", "vulnerability", "custom"];
        const results = await Promise.all(
          types.map((t) =>
            fetch(`/api/knowledgeBaseRequests?type=${t}`, { cache: "no-store" }).then((res) =>
              res.json()
            )
          )
        );

        setRequests({
          bestpractice: results[0],
          vulnerability: results[1],
          custom: results[2],
        });
      } catch (err) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--text-secondary)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-yellow)] mr-3" />
        Loading requests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500">
        <AlertCircle className="h-10 w-10 mb-3" />
        {error}
      </div>
    );
  }

  return (
    <div className={`${lexend.className} p-6 md:p-8 lg:p-10 animate-fadeInUp`}>
      <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">
        Rule Addition Requests
      </h1>

      {Object.entries(requests).map(([type, reqList]) => {
        if (!reqList || reqList.length === 0) return null;

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
                  key={req._id}
                  className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md hover:shadow-lg transition duration-300"
                >
                  <h3 className="text-lg font-semibold text-[var(--brand-yellow)] mb-2">
                    {req.rule_name || req.rule_id}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {req.rule_description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs font-medium mb-4">
                    <span className={clsx("px-2 py-1 rounded-full", typeData.bg, typeData.color)}>
                      {typeData.label}
                    </span>
                    {req.suggested_severity && (
                      <span
                        className={clsx(
                          "px-2 py-1 rounded-full",
                          severityColors[req.suggested_severity.toLowerCase()] ||
                            "bg-gray-400/20 text-gray-400"
                        )}
                      >
                        Severity: {req.suggested_severity}
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
