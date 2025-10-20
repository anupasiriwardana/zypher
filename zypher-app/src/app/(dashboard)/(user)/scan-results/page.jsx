"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import RepoScanCard from "@/components/RepoScanCard";
import FileScanCard from "@/components/FileScanCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ScanResultsPage() {
  const [allScans, setAllScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [timeFilter, setTimeFilter] = useState("30"); // 7, 30, 90, all

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch("/api/scan-results");
        const data = await res.json();

        const fileScans = (data.pastFileScanResults || []).map((scan) => ({
          id: scan._id,
          type: "file",
          createdAt: scan.createdAt,
          filename: scan.filename,
          vulnerabilityFindings:
            scan.vulnerabilityScan?.stats?.total_findings || 0,
          bestPracticeFindings:
            scan.bestPracticesScan?.stats?.total_findings || 0,
          customRuleFindings: scan.customRuleScan?.stats?.total_findings || 0,
          severityBreakdown:
            scan.vulnerabilityScan?.stats?.severity_count || {},
          risk: scan.vulnerabilityScan?.stats?.risk_factor || "LOW",
        }));

        const repoScans = (data.pastRepoScanResults || []).map((scan) => ({
          id: scan._id,
          type: "repo",
          createdAt: scan.createdAt,
          repoUrl: scan.repo_url,
          vulnerabilityFindings:
            scan.vulnerabilityScan?.stats?.total_findings || 0,
          bestPracticeFindings:
            scan.bestPracticesScan?.stats?.total_findings || 0,
          customRuleFindings: scan.customRuleScan?.stats?.total_findings || 0,
          severityBreakdown:
            scan.vulnerabilityScan?.stats?.severity_count || {},
          risk: scan.vulnerabilityScan?.stats?.risk_factor || "LOW",
        }));

        setAllScans([...fileScans, ...repoScans]);
      } catch (err) {
        console.error("Failed to load scan results:", err);
      }
    };
    fetchScans();
  }, []);

  const filteredScans = useMemo(() => {
    let filtered = [...allScans];

    if (searchTerm) {
      filtered = filtered.filter((scan) =>
        (scan.filename || scan.repoUrl || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((scan) => scan.risk === filterStatus);
    }

    // Time filter
    if (timeFilter !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(timeFilter));
      filtered = filtered.filter((scan) => new Date(scan.createdAt) >= cutoff);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allScans, searchTerm, filterStatus, sortOrder, timeFilter]);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // 📈 Prepare Line Chart: Scans per day
  const scansPerDay = useMemo(() => {
    const map = {};
    filteredScans.forEach((scan) => {
      const date = new Date(scan.createdAt).toLocaleDateString();
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [filteredScans]);

  // 📊 Prepare Grouped Bar Chart: Severity counts per scan type
  const severityData = useMemo(() => {
    const severityTotals = {
      vulnerability: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      bestPractice: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      customRule: { Critical: 0, High: 0, Medium: 0, Low: 0 },
    };

    filteredScans.forEach((scan) => {
      const sev = scan.severityBreakdown || {};
      if (scan.vulnerabilityFindings)
        Object.keys(sev).forEach((s) => {
          severityTotals.vulnerability[s] =
            (severityTotals.vulnerability[s] || 0) + sev[s];
        });
      if (scan.bestPracticeFindings)
        Object.keys(sev).forEach((s) => {
          severityTotals.bestPractice[s] =
            (severityTotals.bestPractice[s] || 0) + sev[s];
        });
      if (scan.customRuleFindings)
        Object.keys(sev).forEach((s) => {
          severityTotals.customRule[s] =
            (severityTotals.customRule[s] || 0) + sev[s];
        });
    });

    return Object.keys(severityTotals).map((key) => ({
      type: key,
      Critical: severityTotals[key].Critical || 0,
      High: severityTotals[key].High || 0,
      Medium: severityTotals[key].Medium || 0,
      Low: severityTotals[key].Low || 0,
    }));
  }, [filteredScans]);

  return (
    <div className={`p-2 md:p-8 lg:p-4 ${lexend.className} animate-fadeInUp`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">
        Scan Results
      </h1>

      {/* Filters */}
      <div className="bg-[var(--input-bg)] p-6 rounded-xl mb-8 shadow-md border border-[var(--border-input)] flex flex-col md:flex-row gap-4 md:gap-6 items-center">
        {/* Search */}
        <div className="relative flex-grow w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search scans by filename or repo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Time Filter */}
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-2 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] px-4 py-3 rounded-lg hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)]"
        >
          {sortOrder === "desc" ? (
            <>
              Oldest <ArrowUpWideNarrow size={18} />
            </>
          ) : (
            <>
              Newest <ArrowDownWideNarrow size={18} />
            </>
          )}
        </button>
      </div>

      {/* 📈 Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Line Chart: Scans per day */}
        <div className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
            Scans per Day
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scansPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937", // dark gray (like Tailwind's gray-800)
                  border: "1px solid #374151", // subtle border
                  borderRadius: "8px",
                }}
                itemStyle={{
                  color: "#facc15", // yellow text for data
                }}
                labelStyle={{
                  color: "#ffffff", // white for the date label
                }}
                cursor={{ stroke: "#facc15", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#facc15"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
            Findings Distribution by Scan Type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#facc15" }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Legend />
              <Pie
                dataKey="value"
                data={[
                  {
                    name: "Vulnerability",
                    value: filteredScans.reduce(
                      (sum, s) => sum + (s.vulnerabilityFindings || 0),
                      0
                    ),
                  },
                  {
                    name: "Best Practices",
                    value: filteredScans.reduce(
                      (sum, s) => sum + (s.bestPracticeFindings || 0),
                      0
                    ),
                  },
                  {
                    name: "Custom Rules",
                    value: filteredScans.reduce(
                      (sum, s) => sum + (s.customRuleFindings || 0),
                      0
                    ),
                  },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                <Cell fill="#f97316" /> {/* orange */}
                <Cell fill="#22c55e" /> {/* green */}
                <Cell fill="#3b82f6" /> {/* blue */}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of scan cards */}
      {filteredScans.length === 0 ? (
        <p className="text-center text-[var(--text-secondary)] p-10 bg-[var(--input-bg)] rounded-xl">
          No matching scan results found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredScans.map((scan) => {
            const date = formatDateTime(scan.createdAt);
            return scan.type === "file" ? (
              <FileScanCard
                key={scan.id}
                filename={scan.filename}
                date={date}
                scanDataId={scan.id}
                vulnerabilityFindings={scan.vulnerabilityFindings}
                bestPracticeFindings={scan.bestPracticeFindings}
                customRuleFindings={scan.customRuleFindings}
                risk={scan.risk}
              />
            ) : (
              <RepoScanCard
                key={scan.id}
                repoUrl={scan.repoUrl}
                date={date}
                scanDataId={scan.id}
                vulnerabilityFindings={scan.vulnerabilityFindings}
                bestPracticeFindings={scan.bestPracticeFindings}
                customRuleFindings={scan.customRuleFindings}
                risk={scan.risk}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
