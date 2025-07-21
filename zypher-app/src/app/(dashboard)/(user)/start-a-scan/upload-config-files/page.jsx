"use client";

import { useState, useEffect } from "react";
import {
  Upload, Loader2, FileText, CheckCircle, XCircle,
  BarChart2, Bug, Code, TerminalSquare, ChevronDown, ChevronUp, ArrowLeft
} from "lucide-react";
import clsx from "clsx";
import * as yaml from 'yaml';
import { useRouter } from "next/navigation";

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

export default function UploadConfigPageContent() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerabilities');
  const [expandedRules, setExpandedRules] = useState(new Set());
  const [error, setError] = useState('');

  const [vulnRuleMetadata, setVulnRuleMetadata] = useState([]);
  const [bpRuleMetadata, setBpRuleMetadata] = useState([]);

  const router = useRouter();

  useEffect(() => {
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
        console.log("fetched rule metadata:", data);

      } catch (error) {
        console.error(error);
      }
    }
    fetchRuleMetadata();
  }, []);

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

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (!newFile) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target.result;
      let parsedContent = null;
      let error = null;

      try {
        if (newFile.name.endsWith('.yaml') || newFile.name.endsWith('.yml')) {
          parsedContent = yaml.parse(fileContent);
        }
      } catch (e) {
        error = `Failed to parse ${newFile.name}: ${e.message}`;
        console.error(error);
        setParseError(error);
      }

      setFiles(prev => [...prev, {
        fileObject: newFile,
        content: fileContent,
        parsedContent,
        error
      }]);

      setSelectedFile({
        fileObject: newFile,
        content: fileContent,
        parsedContent,
        error
      });

      setScanResult(null);
      setParseError(null);
      setScanResults(null);
      setExpandedRules(new Set());
      setActiveTab('vulnerabilities');
    };

    reader.onerror = () => {
      const error = "Error reading file";
      console.error(error);
      setParseError(error);
    };

    if (newFile.type.includes("text") ||
      newFile.name.endsWith(".yaml") ||
      newFile.name.endsWith(".yml")) {
      reader.readAsText(newFile);
    } else {
      reader.readAsDataURL(newFile);
    }

    e.target.value = null;
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    // Check file extension before scanning
    const fileName = selectedFile.fileObject.name;
    if (!fileName.endsWith('.yml') && !fileName.endsWith('.yaml')) {
      setParseError('Only .yml or .yaml files are supported for scanning.');
      return;
    }

    setScanning(true);
    setScanResult(null);
    setParseError(null);
    setScanResults(null);
    setExpandedRules(new Set());
    setActiveTab('vulnerabilities');

    try {
      const response = await fetch('/api/scan-individual-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.fileObject.name,
          content: selectedFile.content
        })
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setScanResults(data);

      if (data.bestPractices?.status === 'success' && data.vulnerabilities?.status === 'success') {
        setScanResult('success');
      } else {
        setScanResult('failure');
      }
      console.log('Scan results:', data);

    } catch (error) {
      console.error('Scan error:', error.message);
      setScanResult('failure');
      setParseError(error.message);
    } finally {
      setScanning(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setScanResult(null);
    setParseError(null);
    setScanResults(null);
    setExpandedRules(new Set());

  };

  // Function to toggle individual rule expansion
  const toggleRuleExpansion = (ruleId) => {
    setExpandedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  // function to render a single scan type's results (Vulnerability or Best Practice)
  const renderScanTypeResults = (scanTypeData, scanType) => {
    if (!scanTypeData || !scanTypeData.findings) {
      return <p className="text-[var(--text-secondary)] text-center py-8">No results available for this scan type.</p>;
    }

    const { stats, findings, filename } = scanTypeData;

    return (
      <div className="mt-8 text-left animate-fadeIn">
        {/* Summary Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border-input)] shadow-md min-w-[150px]">
              <p className="text-sm text-[var(--text-secondary)]">Scanned File</p>
              <p className="text-xl font-bold text-[var(--foreground)] truncate">{filename || 'N/A'}</p>
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
        {findings && findings.length > 0 ? (
          <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border-input)] shadow-md custom-scrollbar">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <Bug size={24} className="text-red-400" />
              Detailed Findings
            </h3>
            <div className="space-y-8">
              {/* Group findings by rule_id */}
              {Object.entries(findings.reduce((acc, finding) => {
                if (!acc[finding.rule_id]) {
                  acc[finding.rule_id] = [];
                }
                acc[finding.rule_id].push(finding);
                return acc;
              }, {})).map(([ruleId, findingsForRule], ruleIndex) => {
                const isRuleExpanded = expandedRules.has(ruleId);
                return (
                  <div key={ruleIndex} className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner">
                    <button
                      className="w-full text-left flex items-center justify-between gap-x-2 flex-wrap min-w-0 cursor-pointer"
                      onClick={() => toggleRuleExpansion(ruleId)}
                    >
                      <h4 className="text-xl font-semibold text-[var(--brand-yellow)] flex items-center gap-x-2 flex-wrap min-w-0">
                        <Code size={20} /> Rule: <span className="break-words">{getRuleName(ruleId, scanType)}</span>
                        {findingsForRule.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
                            {findingsForRule.length} occurrence{findingsForRule.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </h4>
                      {/* Display severity badge of the first finding for the rule */}
                      {findingsForRule[0]?.severity && (
                        <SeverityBadge severity={findingsForRule[0].severity} />
                      )}
                      <span className="ml-auto shrink-0 text-[var(--text-secondary)]">
                        {isRuleExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </button>

                    {/* Conditionally render details based on expansion state */}
                    {isRuleExpanded && (
                      <div className="mt-4 space-y-4 animate-fadeIn">
                        {findingsForRule.map((occurrence, occIndex) => (
                          <div key={occIndex} className="p-3 bg-[var(--background)] rounded-md border border-[var(--border-input)]">
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border-input)] shadow-md text-center text-[var(--text-secondary)]">
            <p className="text-xl font-semibold mb-2">No findings for this scan type!</p>
            <p>This file appears clean based on our current rules.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeInUp">
      <button
        onClick={() => router.push('/start-a-scan')}
        className="mb-6 inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft size={20} /> Back to Scan Options
      </button>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 flex-grow">
        {/* LEFT SIDEBAR - File List & Upload */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-[var(--border-input)] rounded-lg p-6 bg-[var(--input-bg)] shadow-xl flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Files Added</h2>

          {files.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-[var(--text-secondary)] mb-6 py-8 border border-dashed border-[var(--border-input)] rounded-md">
              <Upload size={32} className="mb-3 text-[var(--text-secondary)]" />
              <p>Upload a file to get started</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar mb-6">
              <ul className="space-y-3">
                {files.map((file, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setScanResult(null);
                        setParseError(null);
                        setScanResults(null);
                        setExpandedRules(new Set());
                        setActiveTab('vulnerabilities');
                      }}
                      className={`relative w-full text-left px-4 py-3 rounded-md transition-all duration-200 ease-in-out
                              flex items-center justify-between group
                              ${selectedFile?.fileObject?.name === file.fileObject.name
                          ? "bg-[var(--brand-yellow)] text-[var(--background)] font-medium shadow-md"
                          : "bg-[var(--button-bg)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] text-[var(--foreground)]"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <FileText size={20} className={selectedFile?.fileObject?.name === file.fileObject.name ? "text-[var(--background)]" : "text-[var(--text-secondary)] group-hover:text-[var(--brand-yellow)]"} />
                        <span className="truncate">{file.fileObject.name}</span>
                      </span>
                      {selectedFile?.fileObject?.name === file.fileObject.name && (
                        <CheckCircle size={20} className="text-[var(--background)]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="inline-flex items-center justify-center bg-[var(--brand-yellow)] text-[var(--background)] rounded-full px-6 py-3 cursor-pointer font-bold transition hover:brightness-110 shadow-lg text-lg">
            {files.length === 0 ? "Upload File" : "Add More Files"}
            <Upload className="ml-3 w-5 h-5" />
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".yaml,.yml,.json"
            />
          </label>
        </div>

        {/* RIGHT PANEL - Scan Area & Results */}
        <div className="flex-1 flex flex-col rounded-lg bg-[var(--input-bg)] shadow-xl p-8 items-center justify-center relative min-h-[400px]">
          {!selectedFile && files.length > 0 && (
            <div className="text-center text-[var(--text-secondary)] animate-fadeIn">
              <p className="text-xl mb-4">Please select a file from the left to start scanning.</p>
              <FileText size={48} className="mx-auto opacity-70" />
            </div>
          )}

          {files.length === 0 && (
            <div className="text-center text-[var(--text-secondary)] animate-fadeIn">
              <p className="text-xl mb-4">No files uploaded yet.</p>
              <p>Use the "Upload File" button to begin.</p>
              <Upload size={48} className="mt-4 mx-auto opacity-70" />
            </div>
          )}

          {selectedFile && (
            <div className="flex flex-col items-center justify-center w-full h-full">
              {parseError && (
                <div className="mb-4 p-4 bg-red-600/20 text-red-400 rounded-lg w-full max-w-2xl">
                  <p className="font-medium">Parse Error:</p>
                  <p>{parseError}</p>
                </div>
              )}

              {scanning ? (
                <div className="flex flex-col items-center gap-6 text-[var(--brand-yellow)] animate-pulse-slow">
                  <Loader2 className="w-16 h-16 animate-spin" />
                  <p className="text-xl font-semibold">Scanning {selectedFile.fileObject.name}...</p>
                  <p className="text-sm text-[var(--text-secondary)]">This might take a moment.</p>
                </div>
              ) : scanResult ? (
                <div className="w-full max-w-4xl">
                  {scanResult === 'success' ? (
                    <div className="text-center">
                      <CheckCircle size={80} className="mx-auto mb-6 text-green-500 drop-shadow-lg" />
                      <h3 className="text-3xl font-bold mb-3">Scan Complete!</h3>

                      {/* Tabs for Vulnerabilities and Best Practices */}
                      {scanResults && (
                        <div className="mt-8">
                          <div className="flex border-b border-[var(--border-input)] mb-6 justify-center overflow-x-auto custom-scrollbar">
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
                              {scanResults.vulnerabilities?.stats?.total_findings > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400">
                                  {scanResults.vulnerabilities.stats.total_findings}
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
                              {scanResults.bestPractices?.stats?.total_findings > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400">
                                  {scanResults.bestPractices.stats.total_findings}
                                </span>
                              )}
                            </button>
                          </div>

                          {activeTab === 'vulnerabilities' && renderScanTypeResults(scanResults.vulnerabilities, 'vulnerabilities')}
                          {activeTab === 'best-practices' && renderScanTypeResults(scanResults.bestPractices, 'best-practices')}

                          {/* Optional: Raw Data Display, similar to PasteUrlPageContent */}
                          {/*<div className="mt-12 text-left">
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-[var(--text-secondary)]" />
                                Complete Raw Scan Data
                            </h3>
                            <pre className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] text-[var(--text-secondary)] overflow-x-auto text-sm">
                                {JSON.stringify(scanResults, null, 2)}
                            </pre>
                        </div>*/}
                        </div>
                      )}

                      <button
                        onClick={clearSelectedFile}
                        className="mt-6 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] font-semibold px-8 py-3 rounded-full hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] transition shadow-md"
                      >
                        Scan Another File
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <XCircle size={80} className="mx-auto mb-6 text-red-500 drop-shadow-lg" />
                      <h3 className="text-3xl font-bold mb-3">Scan Failed!</h3>
                      <p className="text-lg text-[var(--text-secondary)] mb-6">
                        {parseError || 'Unknown error occurred during scanning'}
                      </p>
                      <button
                        onClick={clearSelectedFile}
                        className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] font-semibold px-8 py-3 rounded-full hover:border-red-500 hover:text-red-500 transition shadow-md"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 animate-fadeIn">
                  <p className="text-2xl font-semibold text-[var(--foreground)]">{selectedFile.fileObject.name}</p>
                  <FileText size={60} className="text-[var(--text-secondary)]" />
                  <p className="text-lg text-[var(--text-secondary)]">Ready to analyze your file?</p>
                  <button
                    onClick={handleScan}
                    className="bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition shadow-lg text-lg"
                    disabled={scanning || !!parseError}
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="animate-spin mr-2 inline" size={20} />
                        Scanning...
                      </>
                    ) : (
                      'Start Scan'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}