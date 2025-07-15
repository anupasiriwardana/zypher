"use client";

import { useState } from 'react';
import { 
  Link2, ArrowRight, Loader2, CheckCircle, XCircle, FileText, BarChart2, Bug,
  FolderOpen, Code, TerminalSquare, ChevronDown, ChevronUp 
} from 'lucide-react'; 
import clsx from 'clsx';

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

export default function PasteUrlPageContent() { 
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [scanResults, setScanResults] = useState(null); 
  const [activeTab, setActiveTab] = useState('vulnerabilities');
  const [expandedFiles, setExpandedFiles] = useState(new Set()); 

  // Function to toggle file expansion
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

    if (!url.trim()) {
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
        body: JSON.stringify({ repoUrl: url }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error occurred.' }));
        throw new Error(errorData.message || 'Failed to initiate scan. Please check the URL and try again.');
      }

      const data = await res.json();
      console.log('Scan results:', data); 

      if (data.vulnerabilityScanResults || data.bestPracticesScanResults) {
        setScanResults(data); 
        setFeedback({ type: 'success', message: 'Scan initiated successfully! Results displayed below.' });
        setUrl('');
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

  // function to render a single scan type's results (Vulnerability or Best Practice)
  const renderScanTypeResults = (scanTypeData) => {
    if (!scanTypeData) {
      return <p className="text-[var(--text-secondary)] text-center py-8">No results available for this scan type.</p>;
    }

    const { stats, results, status, repo_url } = scanTypeData;

    return (
      <div className="mt-8 text-left animate-fadeIn">
        {/* Summary Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md min-w-[150px]">
              <p className="text-sm text-[var(--text-secondary)]">Scanned Files</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.scanned_files || 0}</p>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md min-w-[150px]">
              <p className="text-sm text-[var(--text-secondary)]">Total Findings</p>
              <p className="text-3xl font-bold text-red-400">{stats.total_findings || 0}</p>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md min-w-[150px]">
              <p className="text-sm text-[var(--text-secondary)]">Critical / High</p>
              <p className="text-3xl font-bold text-orange-400">{stats.critical || 0} / {stats.high || 0}</p>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md min-w-[150px]">
              <p className="text-sm text-[var(--text-secondary)]">Medium / Low</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.medium || 0} / {stats.low || 0}</p>
            </div>
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
        
                const groupedFindings = fileResult.findings.reduce((acc, finding) => {
                  if (!acc[finding.rule_id]) {
                    acc[finding.rule_id] = [];
                  }
                  acc[finding.rule_id].push(finding);
                  return acc;
                }, {});

                const isFileExpanded = expandedFiles.has(fileResult.path);

                return (
                  <div key={fileIndex} className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner">
                    <button
                      className="w-full text-left flex items-center justify-between gap-x-2 flex-wrap min-w-0 cursor-pointer"
                      onClick={() => toggleFileExpansion(fileResult.path)}
                    >
                      <h4 className="text-xl font-semibold text-[var(--brand-yellow)] flex items-center gap-x-2 flex-wrap min-w-0">
                        <FolderOpen size={20} /> File: <span className="break-words">{fileResult.path}</span>
          
                        {fileResult.findings?.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
                                {fileResult.findings.length} findings
                            </span>
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
                                            <Code size={16} className="text-[var(--text-secondary)]" /> Rule: <span className="break-words">{ruleId}</span>
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
    <div className="text-center bg-[var(--input-bg)] p-8 md:p-12 rounded-3xl mb-12 shadow-xl border border-[var(--border-input)] max-w-screen-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--foreground)]">
        Scan Your Repository by URL
      </h1>
      <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
        Simply paste the URL of your Git repository (e.g., GitHub, GitLab, Bitbucket) below to start a comprehensive security scan.
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

          {activeTab === 'vulnerabilities' && renderScanTypeResults(scanResults.vulnerabilityScanResults)}
          {activeTab === 'best-practices' && renderScanTypeResults(scanResults.bestPracticesScanResults)}

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
  );
}