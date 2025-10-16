"use client";

import { useState, useEffect, useMemo } from "react";
import { Lexend } from "next/font/google";
import clsx from "clsx";
import {
  Search,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Loader2,
} from "lucide-react";

import RuleDetailModal from "@/components/RuleDetailModal";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Severity styling
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

// Table component
const RuleTable = ({
  title,
  rules,
  searchTerm,
  setSearchTerm,
  filterSeverity,
  setFilterSeverity,
  sortOrder,
  setSortOrder,
  onRowClick,
}) => {
  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules.filter((rule) => {
      const matchesSearch =
        rule.ruleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruleId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity =
        filterSeverity === "all" || rule.severity.toLowerCase() === filterSeverity;

      return matchesSearch && matchesSeverity;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [rules, searchTerm, filterSeverity, sortOrder]);

  return (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-[var(--foreground)]">
        {title}
      </h2>

      {/* Filters */}
      <div className="bg-[var(--input-bg)] p-4 rounded-xl mb-6 shadow-md border border-[var(--border-input)] flex flex-col md:flex-row gap-4 md:gap-6 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all duration-200"
            >
              <option value="all">All Severities</option>
              {Object.keys(severityMap).map((key) => (
                <option key={key} value={key}>
                  {severityMap[key].label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] px-4 py-3 rounded-lg hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Sort by Date:{" "}
            {sortOrder === "desc" ? (
              <>
                Newest <ArrowDownWideNarrow size={18} />
              </>
            ) : (
              <>
                Oldest <ArrowUpWideNarrow size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredAndSortedRules.length === 0 ? (
        <div className="text-center text-[var(--text-secondary)] p-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)]">
          <p className="text-xl">No rules found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--input-bg)] rounded-xl shadow-md border border-[var(--border-input)]">
          <table className="min-w-full divide-y divide-[var(--border-input)]">
            <thead className="bg-[var(--hover-bg)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                  Rule Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-input)]">
              {filteredAndSortedRules.map((rule) => {
                const severityData = severityMap[
                  rule.severity.toLowerCase()
                ] || {
                  label: "Unknown",
                  color: "text-gray-400",
                  bg: "bg-gray-600/20",
                };
                return (
                  <tr
                    key={rule._id || rule.ruleId}
                    onClick={() => onRowClick(rule)}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                      {rule.ruleName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={clsx(
                          "px-2 inline-flex text-xs font-semibold rounded-full",
                          severityData.bg,
                          severityData.color
                        )}
                      >
                        {severityData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(rule.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main Page ---
export default function ActiveRulesPage() {
  const [activeTab, setActiveTab] = useState("vulnerabilities");
  const [rulesData, setRulesData] = useState({
    customRules: [],
    bestPractices: [],
    vulnerabilities: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState(null);

  // Individual states for each tab
  const [tabStates, setTabStates] = useState({
    vulnerabilities: {
      searchTerm: "",
      filterSeverity: "all",
      sortOrder: "desc",
    },
    bestPractices: { searchTerm: "", filterSeverity: "all", sortOrder: "desc" },
    customRules: { searchTerm: "", filterSeverity: "all", sortOrder: "desc" },
  });

  // Normalize backend data
  const normalizeRules = (rulesArray) =>
    rulesArray.map((r) => ({
      _id: r._id,
      ruleId: r.rule_id,
      ruleName: r.rule_name,
      description: r.file_content || "",
      severity: r.severity || "informational",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/active-rules", {
          headers: { "x-user-id": "12345", "x-user-role": "rule-maintainer" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch rules");

        setRulesData({
          customRules: normalizeRules(data.groupedRules.customRules),
          bestPractices: normalizeRules(data.groupedRules.bestPractices),
          vulnerabilities: normalizeRules(data.groupedRules.vulnerabilities),
        });
      } catch (err) {
        console.error("Error fetching rules:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (rule) => setSelectedRule(rule);
  const closeModal = () => setSelectedRule(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--foreground)]">
        <Loader2 className="animate-spin mr-2" /> Loading active rules...
      </div>
    );
  }

  const tabs = [
    { key: "vulnerabilities", label: "Vulnerabilities" },
    { key: "bestPractices", label: "Best Practices" },
    { key: "customRules", label: "Custom Rules" },
  ];

  const { searchTerm, filterSeverity, sortOrder } = tabStates[activeTab];

  const updateTabState = (key, value) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [key]: value },
    }));
  };

  return (
    <div
      className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)] flex items-center gap-2">
        Active Rules in the System
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[var(--border-input)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "pb-3 px-4 text-lg font-medium transition-colors duration-200",
              activeTab === tab.key
                ? "border-b-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table for Active Tab */}
      <RuleTable
        title={tabs.find((tab) => tab.key === activeTab).label}
        rules={rulesData[activeTab] || []}
        searchTerm={searchTerm}
        setSearchTerm={(v) => updateTabState("searchTerm", v)}
        filterSeverity={filterSeverity}
        setFilterSeverity={(v) => updateTabState("filterSeverity", v)}
        sortOrder={sortOrder}
        setSortOrder={(v) => updateTabState("sortOrder", v)}
        onRowClick={handleRowClick}
      />

      {/* Modal */}
      {selectedRule && (
        <RuleDetailModal rule={selectedRule} onClose={closeModal} />
      )}
    </div>
  );
}
