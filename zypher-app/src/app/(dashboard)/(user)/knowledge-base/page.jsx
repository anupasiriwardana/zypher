"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  FileCode,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { Lexend } from "next/font/google";
import Link from "next/link";

const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("vulnerabilities");
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/knowledgeBase", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch rules");
        setRules(data || []);
      } catch (err) {
        setError(err.message || "Unexpected error while fetching rules.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);

  const filteredRules = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    const currentType = activeTab === "vulnerabilities" ? "vulnerability" : "best-practice";

    return rules.filter(
      (r) =>
        r.type === currentType &&
        ((r.rule_name || r.rule_id || r.explanation || "").toLowerCase().includes(lower))
    );
  }, [searchTerm, activeTab, rules]);

  if (isLoading) {
    return (
      <div
        className={clsx(
          "min-h-screen bg-[var(--background-dark)] text-white p-8 flex items-center justify-center",
          lexend.className
        )}
      >
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-yellow)]" />
        <p className="ml-3 text-lg text-[var(--text-secondary)]">Loading knowledge base...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={clsx(
          "min-h-screen bg-[var(--background-dark)] text-white p-8 flex flex-col items-center justify-center text-center",
          lexend.className
        )}
      >
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Knowledge Base</h2>
        <p className="text-lg text-[var(--text-secondary)]">{error}</p>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen bg-[var(--background-dark)] text-white p-1", lexend.className)}>
      <div className="max-w-7xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 leading-tight">
          <BookOpen className="inline-block mr-4 text-[var(--brand-yellow)]" size={48} />
          Security Knowledge Base
        </h1>

        {/* Search */}
        <div className="relative max-w-3xl mx-auto mb-12">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            size={24}
          />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-full bg-[var(--input-bg)] border border-[var(--border-input)]"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center border-b border-[var(--border-input)] mb-10">
          <button
            className={clsx(
              "py-4 px-8 text-xl font-medium",
              activeTab === "vulnerabilities"
                ? "border-b-4 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab("vulnerabilities")}
          >
            Vulnerabilities
          </button>
          <button
            className={clsx(
              "py-4 px-8 text-xl font-medium",
              activeTab === "best-practices"
                ? "border-b-4 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab("best-practices")}
          >
            Best Practices
          </button>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <Link key={rule.rule_id} href={`/knowledge-base/${rule.rule_id}`} className="block">
                <div className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md hover:border-[var(--brand-yellow)] transition">
                  <div className="flex items-center gap-x-3">
                    {activeTab === "vulnerabilities" ? (
                      <AlertCircle size={24} className="text-[var(--brand-yellow)]" />
                    ) : (
                      <CheckCircle size={24} className="text-[var(--brand-yellow)]" />
                    )}
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">
                      {rule.rule_id}: {rule.rule_name}
                    </h3>
                  </div>
                  <p className="mt-2 text-[var(--text-secondary)] text-sm line-clamp-3">
                    {rule.description}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-[var(--text-secondary)] text-center md:col-span-2">
              No matching rules found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
