"use client";

import { useEffect, useState } from 'react';
import {
  Link2, ArrowRight, Loader2, CheckCircle, XCircle, FileText, BarChart2, Bug,
  FolderOpen, Code, TerminalSquare, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

const SeverityBadge = ({ severity }) => {
  const normalizedSeverity = severity?.toUpperCase();
  const badgeClasses = {
    'CRITICAL': 'bg-red-600/20 text-red-400',
    'HIGH': 'bg-orange-600/20 text-orange-400',
    'MEDIUM': 'bg-yellow-600/20 text-yellow-400',
    'LOW': 'bg-green-600/20 text-green-400',
    'POSITIVE': 'bg-green-500/20 text-green-300', 
    'INFORMATIONAL': 'bg-blue-600/20 text-blue-400',
    'DEFAULT': 'bg-gray-600/20 text-gray-400',
  };
  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-xs font-semibold shrink-0",
      badgeClasses[normalizedSeverity] || badgeClasses['DEFAULT']
    )}>
      {normalizedSeverity}
    </span>
  );
};

// Circular Progress Bar function
const CircularProgressBar = ({ score, maxScore, label = "Score", riskFactor }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // Ensure maxScore is a positive number to avoid division by zero or negative
  const safeMaxScore = (maxScore && maxScore > 0) ? maxScore : 1;
  const displayProgress = score;

  const progressRatio = Math.max(0, Math.min(1, displayProgress / safeMaxScore));
  const strokeDashoffset = circumference - progressRatio * circumference;

  let textColor = "text-gray-400";
  let strokeColor = "stroke-gray-500";

  if (riskFactor) {
    switch (riskFactor?.toUpperCase()) {
      case 'CRITICAL':
        textColor = "text-red-400";
        strokeColor = "stroke-red-500";
        break;
      case 'HIGH':
        textColor = "text-orange-400";
        strokeColor = "stroke-orange-500";
        break;
      case 'MEDIUM':
        textColor = "text-yellow-400";
        strokeColor = "stroke-yellow-500";
        break;
      case 'LOW':
        textColor = "text-green-400";
        strokeColor = "stroke-green-500";
        break;
      case 'POSITIVE': 
        textColor = "text-green-300";
        strokeColor = "stroke-green-400";
        break;
      case 'INFORMATIONAL':
        textColor = "text-blue-400";
        strokeColor = "stroke-blue-500";
        break;
      default:
        textColor = "text-gray-400";
        strokeColor = "stroke-gray-500";
    }
  } else {
    // Logic for Best Practices Score (assuming maxScore is 100)
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

export default function PasteUrlPageContent() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerabilities');
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [initialVulnMaxScores, setInitialVulnMaxScores] = useState({}); //state for storing initial vulnerability max scores per URL in localStorage

  const [vulnRuleMetadata, setVulnRuleMetadata] = useState([]);
  const [bpRuleMetadata, setBpRuleMetadata] = useState([]);

  const router = useRouter();

  // Load initialVulnMaxScores from localStorage and fetch rule metadata on component mount
  useEffect(() => {
    try {
      const storedScores = localStorage.getItem('initialVulnMaxScores');
      if (storedScores) {
        setInitialVulnMaxScores(JSON.parse(storedScores));
      }
    } catch (error) {
      console.error("Failed to load initialVulnMaxScores from localStorage", error);
    }

    // Fetch rule metadata
    const fetchRuleMetadata = async () => {
      try {
        const res = await fetch('/api/rule-metadata', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.error) {
            throw new Error(data.error);
          } else {
            throw new Error('Failed to fetch rule metadata');
          }
        }

        setVulnRuleMetadata(data.vuln_rule_metadata || []);
        setBpRuleMetadata(data.bp_rule_metadata || []);
        // console.log("fetched rule metadata:", data);

      } catch (error) {
        console.error(error);
      }
    }
    fetchRuleMetadata();
  }, []);
  //get rule names from metadata
  const getRuleName = (ruleId, scanType) => {
    if (scanType === 'vulnerabilities') {
      const rule = vulnRuleMetadata.find(r => r.rule_id === ruleId);
      return rule ? rule.name : ruleId;
    } else if (scanType === 'best-practices') {
      const rule = bpRuleMetadata.find(r => r.rule_id === ruleId);
      return rule ? rule.name : ruleId;
    }
    return ruleId;
  };

  // Function to determine the highest severity for a file from its findings
  const getFileHighestSeverity = (findings) => {
    if (!findings || findings.length === 0) {
      return 'DEFAULT';
    }

    // Define the order of severity from highest to lowest
    const severitiesOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL', 'POSITIVE'];
    let highestSeverity = 'DEFAULT';
    let highestSeverityIndex = severitiesOrder.length; 

    for (const finding of findings) {
      const currentSeverity = finding.severity?.toUpperCase();
      const currentSeverityIndex = severitiesOrder.indexOf(currentSeverity);

      // If current severity is found in the order and is higher (lower index) than the current highest
      if (currentSeverityIndex !== -1 && currentSeverityIndex < highestSeverityIndex) {
        highestSeverity = currentSeverity;
        highestSeverityIndex = currentSeverityIndex;
      }
    }
    return highestSeverity;
  };

  // Function to toggle file expansion in the detailed findings section
  const toggleFileExpansion = (filePath) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setScanResults(null);
    setActiveTab('vulnerabilities'); 
    setExpandedFiles(new Set()); 

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setFeedback({ type: 'error', message: 'Please enter a URL to scan.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/scan-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: trimmedUrl }), // Use trimmedUrl here
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error occurred.' }));
        throw new Error(errorData.message || 'Failed to initiate scan. Please check the URL and try again.');
      }

      const data = await res.json();

      if (data.vulnerabilityScanResults || data.bestPracticesScanResults) {
        setScanResults(data);
        setFeedback({ type: 'success', message: 'Scan initiated successfully! Results displayed below.' });
        setUrl(''); 

        // Logic to store initial vulnerability max score
        if (data.vulnerabilityScanResults?.stats?.['vuln score'] !== undefined) {
          setInitialVulnMaxScores(prevScores => {
            const currentInitialScore = prevScores[trimmedUrl];
            let newScores = { ...prevScores };

            // Only set the initial max score if it hasn't been set before for this URL.
            // This ensures it represents the FIRST scan's score for that URL.
            if (currentInitialScore === undefined) {
              newScores[trimmedUrl] = data.vulnerabilityScanResults.stats['vuln score'];
              // Save to localStorage immediately after updating state
              localStorage.setItem('initialVulnMaxScores', JSON.stringify(newScores));
            }
            // If currentInitialScore is already defined, it remains the initial score.
            return newScores;
          });
        }

      } else {
        throw new Error('Scan response missing expected results.');
      }

    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to initiate scan. Please try again.' });
      setScanResults(null);
    } finally {
      setIsLoading(false);
    }
  };


  const renderScanTypeResults = (scanTypeData, scanType, repoUrl) => {
    if (!scanTypeData) {
      return <p className="text-[var(--text-secondary)] text-center py-8">No results available for this scan type.</p>;
    }

    const { stats, results } = scanTypeData; // Destructure relevant data

    // Determine the max score for vulnerability progress bar
    const vulnMaxScoreForProgressBar = (scanType === 'vulnerabilities' && initialVulnMaxScores[repoUrl] !== undefined)
      ? initialVulnMaxScores[repoUrl]
      : (stats?.['vuln score'] !== undefined && stats['vuln score'] > 0 ? stats['vuln score'] : 5000); 

    return (
      <div className="mt-8 text-left animate-fadeIn">
        {/* Summary Section */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-8 items-stretch">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                {/* Scanned Files */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">Scanned Files</p>
                  <p className="text-4xl font-bold text-[var(--foreground)]">{stats.scanned_files || 0}</p>
                </div>
                {/* Total Findings */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">Total Findings</p>
                  <p className="text-4xl font-bold text-red-400">{stats.total_findings || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
                {/* Critical Findings */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">Critical Findings</p>
                  <p className="text-4xl font-bold text-red-400">{stats.critical || 0}</p>
                </div>
                {/* High Findings */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">High Findings</p>
                  <p className="text-4xl font-bold text-orange-400">{stats.high || 0}</p>
                </div>
                {/* Medium Findings */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">Medium Findings</p>
                  <p className="text-4xl font-bold text-yellow-400">{stats.medium || 0}</p>
                </div>
                {/* Low Findings */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col justify-center items-center text-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">Low Findings</p>
                  <p className="text-4xl font-bold text-green-400">{stats.low || 0}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {scanType === 'vulnerabilities' && stats['vuln score'] !== undefined && (
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col items-center justify-center space-y-4 h-full">
                <h4 className="text-md font-semibold text-[var(--text-secondary)]">Vulnerability Score</h4>
                <CircularProgressBar
                  score={stats['vuln score']}
                  label="Score"
                  maxScore={vulnMaxScoreForProgressBar} 
                  riskFactor={stats.risk_factor}
                />
                {stats.risk_factor && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-[var(--text-secondary)]">Overall Risk Factor</p>
                    <SeverityBadge severity={stats.risk_factor} />
                  </div>
                )}
              </div>
            )}

            {scanType === 'best-practices' && stats['BSTP score'] !== undefined && (
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col items-center justify-center space-y-4 h-full">
                <h4 className="text-md font-semibold text-[var(--text-secondary)]">Best Practices Score</h4>
                <CircularProgressBar
                  score={stats['BSTP score']}
                  label="Score"
                  maxScore={100} // BP score is always out of 100
    
                />
                {stats['BSTP score'] !== undefined && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-[var(--text-secondary)]">Overall Best Practices Rating</p>
                    {stats['BSTP score'] >= 90 && <span className="text-green-400 font-semibold">Excellent</span>}
                    {stats['BSTP score'] < 90 && stats['BSTP score'] >= 70 && <span className="text-yellow-400 font-semibold">Good</span>}
                    {stats['BSTP score'] < 70 && stats['BSTP score'] >= 50 && <span className="text-orange-400 font-semibold">Needs Improvement</span>}
                    {stats['BSTP score'] < 50 && <span className="text-red-400 font-semibold">Poor</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Findings Section */}
        {results && results.length > 0 ? (
          <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border-input)] shadow-md overflow-x-auto custom-scrollbar">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <Bug size={24} className="text-red-400" />
              Detailed Findings
            </h3>
            <div className="space-y-8">
              {results.map((fileResult, fileIndex) => {

                // Group findings by rule_id
                const groupedFindings = fileResult.findings.reduce((acc, finding) => {
                  if (!acc[finding.rule_id]) {
                    acc[finding.rule_id] = [];
                  }
                  acc[finding.rule_id].push(finding);
                  return acc;
                }, {});

                const isFileExpanded = expandedFiles.has(fileResult.path);
                const fileHighestSeverity = getFileHighestSeverity(fileResult.findings); // Get highest severity for the file

                return (
                  <div key={fileIndex} className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner">
                    <button
                      className="w-full text-left flex items-center justify-between gap-x-2 flex-wrap min-w-0 cursor-pointer"
                      onClick={() => toggleFileExpansion(fileResult.path)}
                    >
                      <h4 className="text-xl font-semibold text-[var(--brand-yellow)] flex items-center gap-x-2 flex-wrap min-w-0">
                        <FolderOpen size={20} /> File: <span className="break-words">{fileResult.path}</span>

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
                        {isFileExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </button>

                    {isFileExpanded && (
                      <div className="mt-4 space-y-4 animate-fadeIn">
                        {Object.entries(groupedFindings).length > 0 ? (
                          Object.entries(groupedFindings).map(([ruleId, findingsForRule], ruleIndex) => (
                            <div key={ruleIndex} className="p-4 rounded-md bg-[var(--background)] border border-[var(--border-input)]">
                              <div className="flex flex-wrap justify-between items-center mb-2 gap-x-4 gap-y-2 min-w-0">
                                <p className="text-md font-medium text-[var(--foreground)] flex items-center gap-2 min-w-0">
                                  <Code size={16} className="text-[var(--text-secondary)]" /> Rule: <span className="break-words">{getRuleName(ruleId, scanType)}</span>
                                </p>
                                <SeverityBadge severity={findingsForRule[0].severity} />
                              </div>

                              {/* List individual occurrences for a specific rule */}
                              <div className="mt-4 space-y-3 border-t border-[var(--border-input)] pt-3">
                                <p className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
                                  <TerminalSquare size={16} /> Occurrences:
                                </p>
                                {findingsForRule.map((occurrence, occIndex) => (
                                  <div key={occIndex} className="p-3 bg-[var(--input-bg)] rounded-md border border-[var(--border-input)]">
                                    <p className="text-[var(--text-secondary)] text-xs mb-1">Line: <span className="text-[var(--foreground)] font-mono">{occurrence.line_number}</span></p>

                                    <p className="text-[var(--text-secondary)] text-sm mb-1 break-words">{occurrence.description}</p>

                                    {occurrence.recommendation && (
                                      <div className="mt-3 p-2 rounded-md bg-[var(--input-bg)] border border-[var(--border-input)] text-xs text-[var(--text-secondary)] break-words">
                                        <strong className="text-[var(--brand-yellow)]">Recommendation: </strong> {occurrence.recommendation}
                                      </div>
                                    )}

                                    {occurrence.snippet && occurrence.snippet.trim() !== "" && (
                                      <pre className="bg-[var(--background)] p-2 rounded text-xs overflow-x-auto custom-scrollbar whitespace-pre-wrap font-mono mt-2">
                                        <code>{occurrence.snippet}</code>
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[var(--text-secondary)] text-center py-4">No findings in this file.</p>
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
            <p className="text-xl font-semibold mb-2">No findings for this scan type! 🎉</p>
            <p>Your repository appears secure based on our current rules.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeInUp max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push('/start-a-scan')}
        className="mb-6 inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft size={20} /> Back to Scan Options
      </button>
      <div className="text-center bg-[var(--input-bg)] p-8 md:p-12 rounded-3xl mb-12 shadow-xl border border-[var(--border-input)]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--foreground)]">
          Scan Your Repository by URL
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
          Simply paste the URL of your GitHub repository below to start a comprehensive security scan.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative mb-6">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://github.com/your-org/your-repo.git"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 text-lg"
              disabled={isLoading}
            />
          </div>

          {feedback && (
            <div className={clsx(
              "p-3 rounded-lg text-sm mb-6 flex items-center justify-center gap-2",
              feedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
            )}>
              {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1 w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                Start Scan <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* --- Scan Results Display --- */}
        {scanResults && (
          <div className="mt-32">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-8 flex items-center justify-center sm:justify-start gap-3">
              <BarChart2 size={32} className="text-[var(--brand-yellow)]" />
              Scan Results Overview
            </h2>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border-input)] mb-6 justify-center sm:justify-start overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('vulnerabilities')}
                className={clsx(
                  "px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-200 whitespace-nowrap",
                  activeTab === 'vulnerabilities'
                    ? "border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                )}
              >
                Vulnerabilities
                {scanResults.vulnerabilityScanResults?.stats?.total_findings > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400">
                    {scanResults.vulnerabilityScanResults.stats.total_findings}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('best-practices')}
                className={clsx(
                  "px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-200 whitespace-nowrap",
                  activeTab === 'best-practices'
                    ? "border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                )}
              >
                Best Practices
                {scanResults.bestPracticesScanResults?.stats?.total_findings > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400">
                    {scanResults.bestPracticesScanResults.stats.total_findings}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'vulnerabilities' && scanResults.vulnerabilityScanResults && (
              renderScanTypeResults(scanResults.vulnerabilityScanResults, 'vulnerabilities', scanResults.repoUrl)
            )}
            {activeTab === 'best-practices' && scanResults.bestPracticesScanResults && (
              renderScanTypeResults(scanResults.bestPracticesScanResults, 'best-practices', scanResults.repoUrl)
            )}

            {/* Raw Data */}
            <div className="mt-12 text-left">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[var(--text-secondary)]" />
                Complete Raw Scan Data
              </h3>
              <pre className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] text-[var(--text-secondary)] overflow-x-auto text-sm">
                {JSON.stringify(scanResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}