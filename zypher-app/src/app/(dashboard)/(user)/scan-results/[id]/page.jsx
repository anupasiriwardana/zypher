"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"; // Added useRouter
import { useEffect, useState } from "react";
import {
  Link2,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  BarChart2,
  Bug,
  FolderOpen,
  Code,
  TerminalSquare,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SeverityBadge = ({ severity }) => {
  const normalizedSeverity = severity?.toUpperCase();
  const badgeClasses = {
    CRITICAL: "bg-red-600/20 text-red-400",
    HIGH: "bg-orange-600/20 text-orange-400",
    MEDIUM: "bg-yellow-600/20 text-yellow-400",
    LOW: "bg-green-600/20 text-green-400",
    POSITIVE: "bg-green-500/20 text-green-300",
    INFORMATIONAL: "bg-blue-600/20 text-blue-400",
    DEFAULT: "bg-gray-600/20 text-gray-400",
  };
  return (
    <span
      className={clsx(
        "px-3 py-1 rounded-full text-xs font-semibold shrink-0",
        badgeClasses[normalizedSeverity] || badgeClasses["DEFAULT"]
      )}
    >
      {normalizedSeverity}
    </span>
  );
};

const CircularProgressBar = ({
  score,
  maxScore,
  label = "Score",
  riskFactor,
}) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const safeMaxScore = maxScore && maxScore > 0 ? maxScore : 1;
  const displayProgress = score;

  const progressRatio = Math.max(
    0,
    Math.min(1, displayProgress / safeMaxScore)
  );
  const strokeDashoffset = circumference - progressRatio * circumference;

  let textColor = "text-gray-400";
  let strokeColor = "stroke-gray-500";

  if (riskFactor) {
    switch (riskFactor?.toUpperCase()) {
      case "CRITICAL":
        textColor = "text-red-400";
        strokeColor = "stroke-red-500";
        break;
      case "HIGH":
        textColor = "text-orange-400";
        strokeColor = "stroke-orange-500";
        break;
      case "MEDIUM":
        textColor = "text-yellow-400";
        strokeColor = "stroke-yellow-500";
        break;
      case "LOW":
        textColor = "text-green-400";
        strokeColor = "stroke-green-500";
        break;
      case "POSITIVE":
        textColor = "text-green-300";
        strokeColor = "stroke-green-400";
        break;
      case "INFORMATIONAL":
        textColor = "text-blue-400";
        strokeColor = "stroke-blue-500";
        break;
      default:
        textColor = "text-gray-400";
        strokeColor = "stroke-gray-500";
    }
  } else {
    if (safeMaxScore === 100) {
      if (score >= 90) {
        textColor = "text-green-400";
        strokeColor = "stroke-green-500";
      } else if (score >= 70) {
        textColor = "text-yellow-400";
        strokeColor = "stroke-yellow-500";
      } else if (score >= 50) {
        textColor = "text-orange-400";
        strokeColor = "stroke-orange-500";
      } else {
        textColor = "text-red-400";
        strokeColor = "stroke-red-500";
      }
    } else {
      textColor = "text-gray-400";
      strokeColor = "stroke-gray-500";
    }
  }

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={clsx("transition-all duration-500 ease-out", strokeColor)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={clsx("text-3xl font-bold", textColor)}>{score}</span>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
    </div>
  );
};

const ScanResult = () => {
  const router = useRouter();
  const { id: scanID } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const [scanData, setScanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vulnerabilities");
  const [expandedItems, setExpandedItems] = useState(new Set());

  const [vulnRuleMetadata, setVulnRuleMetadata] = useState([]);
  const [bpRuleMetadata, setBpRuleMetadata] = useState([]);

  const [initialVulnMaxScores, setInitialVulnMaxScores] = useState({});

  useEffect(() => {
    // Load initial max scores from localStorage on component mount
    try {
      const storedScores = localStorage.getItem("initialVulnMaxScores");
      if (storedScores) {
        setInitialVulnMaxScores(JSON.parse(storedScores));
      }
    } catch (e) {
      console.error("Failed to load initialVulnMaxScores from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (!scanID || !type) {
      setError("Scan ID or type is missing in the URL.");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const scanRes = await fetch(
          `/api/scan-results/${scanID}?type=${type}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const scanJson = await scanRes.json();

        if (!scanRes.ok) {
          throw new Error(scanJson.error || "Failed to fetch scan data");
        }

        let processedScanData = { ...scanJson };
        // console.log("Raw scan data:", processedScanData);
        if (type === "file") {
          const groupFindingsForFileScan = (flatFindings, filename) => {
            if (!flatFindings || flatFindings.length === 0) {
              return [];
            }
            return [
              {
                path: filename,
                findings: flatFindings,
              },
            ];
          };

          if (
            processedScanData.vulnerabilityScan &&
            processedScanData.vulnerabilityScan.findings
          ) {
            processedScanData.vulnerabilityScan.results =
              groupFindingsForFileScan(
                processedScanData.vulnerabilityScan.findings,
                processedScanData.filename
              );

            if (!processedScanData.vulnerabilityScan.stats) {
              processedScanData.vulnerabilityScan.stats = {};
            }
            processedScanData.vulnerabilityScan.stats.scanned_files = 1;
          }
          if (
            processedScanData.bestPracticesScan &&
            processedScanData.bestPracticesScan.findings
          ) {
            processedScanData.bestPracticesScan.results =
              groupFindingsForFileScan(
                processedScanData.bestPracticesScan.findings,
                processedScanData.filename
              );

            if (!processedScanData.bestPracticesScan.stats) {
              processedScanData.bestPracticesScan.stats = {};
            }
            processedScanData.bestPracticesScan.stats.scanned_files = 1;
          }
          if (
            processedScanData.customRuleScan &&
            processedScanData.customRuleScan.findings
          ) {
            processedScanData.customRuleScan.results = groupFindingsForFileScan(
              processedScanData.customRuleScan.findings,
              processedScanData.filename
            );

            if (!processedScanData.customRuleScan.stats) {
              processedScanData.customRuleScan.stats = {};
            }
            processedScanData.customRuleScan.stats.scanned_files = 1;
          }
        }
        console.log("Processed scan data:", processedScanData.customRuleScan.stats);
        setScanData(processedScanData);

        const metadataRes = await fetch("/api/rule-metadata", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const metadata = await metadataRes.json();
        if (!metadataRes.ok) {
          throw new Error(metadata.error || "Failed to fetch rule metadata");
        }
        setVulnRuleMetadata(metadata.vuln_rule_metadata || []);
        setBpRuleMetadata(metadata.bp_rule_metadata || []);

        // Save initial vulnerability score as max for repo scans, if it's the first time seeing this repo
        if (
          type === "repo" &&
          processedScanData.repo_url &&
          processedScanData.vulnerabilityScan?.stats?.vuln_score !== undefined
        ) {
          setInitialVulnMaxScores((prevScores) => {
            if (prevScores[processedScanData.repo_url] === undefined) {
              const newScores = {
                ...prevScores,
                [processedScanData.repo_url]:
                  processedScanData.vulnerabilityScan.stats.vuln_score,
              };
              localStorage.setItem(
                "initialVulnMaxScores",
                JSON.stringify(newScores)
              );
              return newScores;
            }
            return prevScores;
          });
        }
      } catch (err) {
        console.error("Error fetching scan details or metadata:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [scanID, type]);

  const getRuleName = (ruleId, scanType) => {
    if (scanType === "vulnerabilities") {
      const rule = vulnRuleMetadata.find((r) => r.rule_id === ruleId);
      return rule ? rule.name : ruleId;
    } else if (scanType === "best-practices") {
      const rule = bpRuleMetadata.find((r) => r.rule_id === ruleId);
      return rule ? rule.name : ruleId;
    }
    return ruleId;
  };

  const getFileHighestSeverity = (findings) => {
    if (!findings || findings.length === 0) {
      return "DEFAULT";
    }

    const severitiesOrder = [
      "CRITICAL",
      "HIGH",
      "MEDIUM",
      "LOW",
      "INFORMATIONAL",
      "POSITIVE",
    ];
    let highestSeverity = "DEFAULT";
    let highestSeverityIndex = severitiesOrder.length;

    for (const finding of findings) {
      const currentSeverity = finding.severity?.toUpperCase();
      const currentSeverityIndex = severitiesOrder.indexOf(currentSeverity);

      if (
        currentSeverityIndex !== -1 &&
        currentSeverityIndex < highestSeverityIndex
      ) {
        highestSeverity = currentSeverity;
        highestSeverityIndex = currentSeverityIndex;
      }
    }
    return highestSeverity;
  };

  const toggleExpansion = (id) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderScanTypeResults = (scanTypeData, currentScanTypeKey) => {
    const repoUrlForMaxScore = type === "repo" ? scanData?.repo_url : null;

    if (!scanTypeData) {
      return (
        <p className="text-[var(--text-secondary)] text-center py-8">
          No results available for this scan type.
        </p>
      );
    }

    const { stats, results } = scanTypeData;

    let vulnMaxScoreForProgressBar;
    let customRuleMaxScoreForProgressBar = 1000;
    if (currentScanTypeKey === "vulnerabilityScan") {
      if (
        type === "repo" &&
        repoUrlForMaxScore &&
        initialVulnMaxScores[repoUrlForMaxScore] !== undefined
      ) {
        // For repo scans, use the stored initial max score if available
        vulnMaxScoreForProgressBar = initialVulnMaxScores[repoUrlForMaxScore];
      } else {
        vulnMaxScoreForProgressBar = 5000;
      }
    } else if (currentScanTypeKey === "customRuleScan") {
      // You can adjust this max score as needed
      customRuleMaxScoreForProgressBar = 1000;
    }

    const ruleMetadataScanType =
      currentScanTypeKey === "vulnerabilityScan"
        ? "vulnerabilities"
        : "best-practices";

    let displayScore;
    if (type === "file") {
      displayScore = stats?.score;
    } else if (type === "repo") {
      if (currentScanTypeKey === "vulnerabilityScan") {
        displayScore = stats?.vuln_score;
      } else if (currentScanTypeKey === "bestPracticesScan") {
        displayScore = stats?.bp_score;
      } else if (currentScanTypeKey === "customRuleScan") {
        displayScore = stats?.cust_score ?? '0'; // or whatever your custom rules score field is
      }
    }

    return (
      <div className="text-left animate-fadeIn">
        {/* Summary Section */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-8 items-stretch">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                {/* Scanned Files */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Scanned Files
                  </p>
                  <p className="text-4xl font-bold text-[var(--foreground)]">
                    {stats.scanned_files || 0}
                  </p>
                </div>
                {/* Total Findings */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Total Findings
                  </p>
                  <p className="text-4xl font-bold text-red-400">
                    {stats.total_findings || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
                {/* Critical */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Critical Findings
                  </p>
                  <p className="text-4xl font-bold text-red-400">
                    {stats.critical || 0}
                  </p>
                </div>
                {/* High */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    High Findings
                  </p>
                  <p className="text-4xl font-bold text-orange-400">
                    {stats.high || 0}
                  </p>
                </div>
                {/* Medium */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Medium Findings
                  </p>
                  <p className="text-4xl font-bold text-yellow-400">
                    {stats.medium || 0}
                  </p>
                </div>
                {/* Low */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Low Findings
                  </p>
                  <p className="text-4xl font-bold text-green-400">
                    {stats.low || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {displayScore !== undefined && (
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col items-center justify-center space-y-4 h-full">
                <h4 className="text-md font-semibold text-[var(--text-secondary)]">
                  {currentScanTypeKey === "vulnerabilityScan"
                    ? "Vulnerability Score"
                    : currentScanTypeKey === "bestPracticesScan"
                    ? "Best Practices Score"
                    : currentScanTypeKey === "customRuleScan"
                    ? "Custom Rules Score"
                    : "Score"}
                </h4>
                <CircularProgressBar
                  score={displayScore}
                  label="Score"
                  maxScore={
                    currentScanTypeKey === "vulnerabilityScan"
                      ? vulnMaxScoreForProgressBar
                      : currentScanTypeKey === "customRuleScan"
                      ? customRuleMaxScoreForProgressBar
                      : 1000
                  }
                  riskFactor={stats.risk_factor}
                />
                {stats.risk_factor && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Overall Risk Factor
                    </p>
                    <SeverityBadge severity={stats.risk_factor} />
                  </div>
                )}
                
              </div>
            )}
          </div>
        )}

        {/* Findings */}
        {results && results.length > 0 ? (
          <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border-input)] shadow-md overflow-x-auto custom-scrollbar">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <Bug size={24} className="text-red-400" />
              Detailed Findings
            </h3>
            <div className="space-y-8">
              {results.map((fileResult, fileIndex) => {
                // Group findings by rule_id for easier display within a file
                const groupedFindings = fileResult.findings.reduce(
                  (acc, finding) => {
                    const ruleKey = `${finding.rule_id}-${finding.severity}`;
                    if (!acc[ruleKey]) {
                      acc[ruleKey] = {
                        rule_id: finding.rule_id,
                        severity: finding.severity,
                        occurrences: [],
                      };
                    }
                    acc[ruleKey].occurrences.push(finding);
                    return acc;
                  },
                  {}
                );

                const isFileExpanded = expandedItems.has(
                  `file-${fileResult.path}`
                );
                const fileHighestSeverity = getFileHighestSeverity(
                  fileResult.findings
                ); // Get highest severity for the file

                return (
                  <div
                    key={fileIndex}
                    className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner"
                  >
                    <button
                      className="w-full text-left flex items-center justify-between gap-x-2 flex-wrap min-w-0 cursor-pointer"
                      onClick={() => toggleExpansion(`file-${fileResult.path}`)}
                    >
                      <h4 className="text-xl font-semibold text-[var(--brand-yellow)] flex items-center gap-x-2 flex-wrap min-w-0">
                        <FolderOpen size={20} /> File:{" "}
                        <span className="break-words">{fileResult.path}</span>
                        {fileResult.findings?.length > 0 && (
                          <>
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
                              {fileResult.findings.length} findings
                            </span>
                            <SeverityBadge severity={fileHighestSeverity} />
                          </>
                        )}
                      </h4>
                      <span className="ml-auto shrink-0 text-[var(--text-secondary)]">
                        {isFileExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    </button>

                    {isFileExpanded && (
                      <div className="mt-4 space-y-4 animate-fadeIn">
                        {Object.entries(groupedFindings).length > 0 ? (
                          Object.entries(groupedFindings).map(
                            ([ruleKey, ruleGroup], ruleIndex) => (
                              <div
                                key={ruleIndex}
                                className="p-4 rounded-md bg-[var(--background)] border border-[var(--border-input)]"
                              >
                                <button
                                  className="w-full text-left flex flex-wrap justify-between items-center mb-2 gap-x-4 gap-y-2 min-w-0 cursor-pointer"
                                  onClick={() =>
                                    toggleExpansion(
                                      `rule-${fileResult.path}-${ruleKey}`
                                    )
                                  }
                                >
                                  <p className="text-md font-medium text-[var(--foreground)] flex items-center gap-2 min-w-0">
                                    <Code
                                      size={16}
                                      className="text-[var(--text-secondary)]"
                                    />{" "}
                                    Rule:{" "}
                                    <span className="break-words">
                                      {getRuleName(
                                        ruleGroup.rule_id,
                                        ruleMetadataScanType
                                      )}
                                    </span>
                                  </p>
                                  <span className="flex items-center gap-2">
                                    <SeverityBadge
                                      severity={ruleGroup.severity}
                                    />
                                    <span className="ml-auto shrink-0 text-[var(--text-secondary)]">
                                      {expandedItems.has(
                                        `rule-${fileResult.path}-${ruleKey}`
                                      ) ? (
                                        <ChevronUp size={20} />
                                      ) : (
                                        <ChevronDown size={20} />
                                      )}
                                    </span>
                                  </span>
                                </button>

                                {expandedItems.has(
                                  `rule-${fileResult.path}-${ruleKey}`
                                ) && (
                                  <div className="mt-4 space-y-3 border-t border-[var(--border-input)] pt-3 animate-fadeIn">
                                    <p className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
                                      <TerminalSquare size={16} /> Occurrences:
                                    </p>
                                    {ruleGroup.occurrences.map(
                                      (occurrence, occIndex) => (
                                        <div
                                          key={occIndex}
                                          className="p-3 bg-[var(--input-bg)] rounded-md border border-[var(--border-input)]"
                                        >
                                          <p className="text-[var(--text-secondary)] text-xs mb-1">
                                            Line:{" "}
                                            <span className="text-[var(--foreground)] font-mono">
                                              {occurrence.line_number}
                                            </span>
                                          </p>

                                          <p className="text-[var(--text-secondary)] text-sm mb-1 break-words">
                                            {occurrence.description}
                                          </p>

                                          {occurrence.recommendation && (
                                            <div className="mt-3 p-2 rounded-md bg-[var(--input-bg)] border border-[var(--border-input)] text-xs text-[var(--text-secondary)] break-words">
                                              <strong className="text-[var(--brand-yellow)]">
                                                Recommendation:{" "}
                                              </strong>{" "}
                                              {occurrence.recommendation}
                                            </div>
                                          )}

                                          {occurrence.snippet &&
                                            occurrence.snippet.trim() !==
                                              "" && (
                                              <pre className="bg-[var(--background)] p-2 rounded text-xs overflow-x-auto custom-scrollbar whitespace-pre-wrap font-mono mt-2">
                                                <code>
                                                  {occurrence.snippet}
                                                </code>
                                              </pre>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-[var(--text-secondary)] text-center py-4">
                            No findings in this file.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border-input)] shadow-md text-center text-[var(--text-secondary)]">
            <p className="text-xl font-semibold mb-2">
              No findings for this scan type! 🎉
            </p>
            <p>
              Your {type === "repo" ? "repository" : "file"} appears secure
              based on our current rules.
            </p>
          </div>
        )}
      </div>
    );
    <div className="mt-12 text-left">
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <FileText size={20} className="text-[var(--text-secondary)]" />
        Complete Raw Scan Data
      </h3>
      <pre className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] text-[var(--text-secondary)] overflow-x-auto text-sm">
        {JSON.stringify(scanData, null, 2)}
      </pre>
    </div>;
  };

  if (isLoading) {
    return (
      <div
        className={clsx(
          "min-h-screen bg-[var(--background-dark)] text-white p-8 flex items-center justify-center",
          lexend.className
        )}
      >
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-purple)]" />
        <p className="ml-3 text-lg text-[var(--text-secondary)]">
          Loading scan results...
        </p>
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
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">
          Error Loading Scan Results
        </h2>
        <p className="text-lg text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2 bg-[var(--brand-purple)] text-white rounded-md hover:bg-[var(--brand-purple-dark)] transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Go Back
        </button>
      </div>
    );
  }

  if (!scanData) {
    return (
      <div
        className={clsx(
          "min-h-screen bg-[var(--background-dark)] text-white p-8 flex flex-col items-center justify-center text-center",
          lexend.className
        )}
      >
        <FileText className="h-16 w-16 text-[var(--text-secondary)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          No Scan Data Found
        </h2>
        <p className="text-lg text-[var(--text-secondary)]">
          It seems there's no data for this scan ID or type.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2 bg-[var(--brand-purple)] text-white rounded-md hover:bg-[var(--brand-purple-dark)] transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Go Back
        </button>
      </div>
    );
  }

  const {
    filename,
    repo_url,
    vulnerabilityScan,
    bestPracticesScan,
    customRuleScan,
    createdAt,
    scan_duration,
  } = scanData;

  const titleText =
    type === "repo"
      ? repo_url
        ? `Repository Scan: ${repo_url}`
        : "Repository Scan"
      : type === "file"
      ? filename
        ? `File Scan: ${filename.split("/").pop()}`
        : "File Scan"
      : "Scan Results";
  const subtitleText =
    type === "repo"
      ? "Explore vulnerabilities and best practices across your repository."
      : type === "file"
      ? "Review the findings for your uploaded file."
      : "Detailed analysis of your code scan.";

  const formattedTimestamp = createdAt
    ? new Date(createdAt).toLocaleString()
    : "N/A";

  return (
    <div
      className={clsx(
        "min-h-screen bg-[var(--background-dark)] text-white p-8",
        lexend.className
      )}
    >
      <div className="max-w-7xl mx-auto py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-[var(--input-bg)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--border-input)] transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back to Scans
        </button>

        <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-3 leading-tight flex items-center flex-wrap">
          {type === "repo" ? (
            <BarChart2 className="mr-3 text-[var(--brand-yellow)]" size={36} />
          ) : (
            <FileText className="mr-3 text-[var(--brand-yellow)]" size={36} />
          )}
          {titleText}
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          {subtitleText}
        </p>

        {type === "repo" && repo_url && (
          <div className="mb-6 flex items-center text-lg text-[var(--text-secondary)]">
            <Link2 size={20} className="mr-2 text-[var(--brand-yellow)]" />
            <a
              href={repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-yellow)] hover:underline break-all"
            >
              {repo_url}
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 text-sm text-[var(--text-secondary)]">
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center justify-between">
            <span>Scan ID:</span>
            <span className="font-medium text-[var(--foreground)]">
              {scanID}
            </span>
          </div>
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center justify-between">
            <span>Scan Type:</span>
            <span className="font-medium text-[var(--foreground)] capitalize">
              {type}
            </span>
          </div>
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center justify-between">
            <span>Scan Date:</span>
            <span className="font-medium text-[var(--foreground)]">
              {formattedTimestamp}
            </span>
          </div>
          {/* Note: scan_duration is currently only in RepoScanResult. 
             If FileScanResult also has it, this will display. */}
          {scan_duration && (
            <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center justify-between">
              <span>Scan Duration:</span>
              <span className="font-medium text-[var(--foreground)]">
                {scan_duration.toFixed(2)} seconds
              </span>
            </div>
          )}
        </div>

        {/* Tabs for Vulnerabilities and Best Practices */}
        <div className="flex border-b border-[var(--border-input)] mb-6">
          <button
            className={clsx(
              "py-3 px-6 text-lg font-medium transition-colors",
              activeTab === "vulnerabilities"
                ? "border-b-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab("vulnerabilities")}
          >
            Vulnerabilities
          </button>
          <button
            className={clsx(
              "py-3 px-6 text-lg font-medium transition-colors",
              activeTab === "best-practices"
                ? "border-b-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab("best-practices")}
          >
            Best Practices
          </button>
          <button
            className={clsx(
              "py-3 px-6 text-lg font-medium transition-colors",
              activeTab === "custom-rules"
                ? "border-b-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab("custom-rules")}
          >
            Custom Rules
          </button>
        </div>

        {/* Render content based on active tab and scan type */}
        {activeTab === "vulnerabilities" &&
          renderScanTypeResults(vulnerabilityScan, "vulnerabilityScan")}
        {activeTab === "best-practices" &&
          renderScanTypeResults(bestPracticesScan, "bestPracticesScan")}
        {activeTab === "custom-rules" &&
          renderScanTypeResults(customRuleScan, "customRuleScan")}
      </div>
    </div>
  );
};

export default ScanResult;
