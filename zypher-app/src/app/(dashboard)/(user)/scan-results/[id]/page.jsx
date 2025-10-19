"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"; // Added useRouter
import { useEffect, useState } from "react";
import { useRef } from "react";
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
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  const [initialVulnMaxScores, setInitialVulnMaxScores] = useState({});
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const pdfBlobUrlRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
  setMetadataLoaded(true);

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

  // Utility: fetch an image and convert to data URL
  const imageToDataUrl = async (url) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Failed to load image for PDF:', err);
      return null;
    }
  };

  // Build a pdfmake document definition from scanData
  // getRuleNameFn: function to map rule_id -> display name (injected to ensure same mapping as UI)
  const buildDocDefinition = (data, logoDataUrl, getRuleNameFn) => {
    const doc = {
      info: { title: 'Zypher Finding Report' },
      content: [],
      // Use a page background to simulate the site's dark background
      pageMargins: [40, 60, 40, 60],
      // Draw a full-page rectangle as the background so exported PDF pages are actually dark
      background: function(currentPage, pageSize) {
        return {
          canvas: [
            { type: 'rect', x: 0, y: 0, w: pageSize.width, h: pageSize.height, color: '#000000' }
          ]
        };
      },
      styles: {
        header: { fontSize: 20, bold: true, margin: [0, 10, 0, 10], color: '#ffffff' },
        subheader: { fontSize: 14, bold: true, margin: [0, 8, 0, 6], color: '#f3f4f6' },
  small: { fontSize: 9, color: '#d1d5db' },
  // don't force a font name here — let pdfmake use its defaults
  mono: { fontSize: 9, color: '#e5e7eb' },
        cardTitle: { fontSize: 12, bold: true, margin: [0, 4, 0, 4], color: '#fff' },
        filePath: { fontSize: 10, color: '#f9fafb' }
      },
      defaultStyle: { color: '#e5e7eb' },
      header: (currentPage, pageCount) => {
        const left = logoDataUrl ? { image: logoDataUrl, width: 80, margin: [8, 6, 0, 6] } : { text: '' };
        return {
          columns: [left, { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [0, 18, 8, 0], style: 'small' }],
          margin: [0, 0, 0, 6]
        };
      },
      footer: (currentPage, pageCount) => ({
        // stack the line above the footer columns so the line is visible
        stack: [
          { canvas: [ { type: 'line', x1: 40, y1: 0, x2: 550, y2: 0, lineWidth: 1, color: '#ffffff' } ] },
          { columns: [
            { text: `Scan ID: ${scanID}`, alignment: 'left', margin: [40, 4, 0, 0], style: 'small' },
            { text: `${currentPage} / ${pageCount}`, alignment: 'right', margin: [0, 4, 40, 0], style: 'small' }
          ], columnGap: 8 }
        ],
        margin: [0, 6, 0, 0]
      })
    };

    // Cover
    const cover = [];
    if (logoDataUrl) cover.push({ image: logoDataUrl, width: 350, alignment: 'center', margin: [0, 100, 0, 50] });
    cover.push({ text: 'CI/CD Scan Report', style: 'header', alignment: 'center' });
    if (data?.repo_url) {
      cover.push({ text: data.repo_url, style: 'subheader', alignment: 'center' });
    } else if (data?.filename) {
      cover.push({ text: data.filename, style: 'subheader', alignment: 'center' });
    }
    cover.push({ text: `Scan ID: ${scanID}`, style: 'small', alignment: 'center', margin: [0, 10, 0, 0] });
    cover.push({ text: `Generated: ${new Date().toLocaleString()}`, alignment: 'center', style: 'small', margin: [0, 10, 0, 0] });
    cover.push({ text: '\n\n', pageBreak: 'after' });
    doc.content.push(...cover);

    // Table of Contents
    doc.content.push({ text: 'Table of Contents', style: 'header' });
    doc.content.push({ toc: { title: { text: '', style: 'subheader' } }, margin: [0, 0, 0, 10] });

    // Helper: convert raw scan results into the grouped/occurrence structure
    // used by the frontend so the PDF mirrors the UI exactly.
    const formatResultsForPdf = (rawItems = [], scanTypeKey) => {
      // rawItems is an array of { path, findings: [...] }
      return rawItems.map((file) => {
        const filePath = file.path || file.filename || 'file';
        const findings = file.findings || [];

        // Group by rule_id + severity similar to frontend
        const grouped = Object.values(
          findings.reduce((acc, f) => {
            const ruleId = f.rule_id || f.rule || 'unknown';
            const severity = (f.severity || '').toUpperCase() || 'DEFAULT';
            const key = `${ruleId}::${severity}`;
            if (!acc[key]) {
              acc[key] = {
                groupKey: key,
                rule_id: ruleId,
                severity,
                rule_name: f.rule_name || (getRuleNameFn ? getRuleNameFn(ruleId, scanTypeKey) : ruleId) || ruleId,
                description: f.description || f.summary || f.message || '',
                recommendation: f.recommendation || f.remediation || '',
                codeSnippet: f.code || f.snippet || f.source || '',
                occurrences: [],
              };
            }
            // keep the original occurrence object for line numbers and messages
            acc[key].occurrences.push(f);
            return acc;
          }, {})
        );

        return { path: filePath, groups: grouped };
      });
    };

    const addSection = (title, score, items, scanTypeKey) => {
      doc.content.push({ text: title, style: 'header', tocItem: true });
      doc.content.push({ text: `Score: ${score}`, style: 'subheader' });

      // If caller passed raw items (array of files with .findings), normalize them
      const formatted = (items && items.length > 0 && items[0] && items[0].groups === undefined)
        ? formatResultsForPdf(items, scanTypeKey)
        : (items || []);

      if (!formatted || formatted.length === 0) {
        doc.content.push({ text: 'No findings', margin: [0, 4, 0, 8] });
        return;
      }

      for (const file of formatted) {
        doc.content.push({ text: file.path || 'File', style: 'filePath', fontSize: 13, marginBottom: 6 });

        if (!file.groups || file.groups.length === 0) {
          doc.content.push({ text: 'No findings for this file', margin: [0, 6, 0, 12], style: 'small' });
          continue;
        }

        for (const group of file.groups) {
          const representative = (group.occurrences && group.occurrences[0]) || {};
          const ruleName = group.rule_name || representative.rule_name || (getRuleNameFn ? getRuleNameFn(representative.rule_id || representative.rule, scanTypeKey) : (representative.rule_id || 'Unnamed Rule')) || representative.rule_id || 'Unnamed Rule';
          const severity = (group.severity || representative.severity || '').toUpperCase();
          const severityColorMap = { CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981', INFORMATIONAL: '#3b82f6', POSITIVE: '#16a34a' };
          const sevColor = severityColorMap[severity] || '#6b7280';

          const recommendation = group.recommendation || representative.recommendation || representative.remediation || '';
          const description = group.description || representative.description || representative.summary || '';
          const codeSnippet = group.codeSnippet || representative.code || representative.snippet || representative.source || '';

          // build occurrences content with detailed fields per occurrence
          const occurrencesStack = (group.occurrences || []).flatMap((occ, idx) => {
            const occLine = occ.line_number ?? occ.line ?? (occ.location || '');
            const occLocation = occLine ? `Line ${occLine}` : (occ.path || '');
            const occSummary = occ.message || occ.summary || occ.description || '';

            const occItems = [];
            // header for this occurrence
            occItems.push({ text: `${idx + 1}. ${occLocation}${occSummary ? ' — ' + occSummary : ''}`, style: 'small', margin: [0, 2, 0, 4] });

            // description (longer text)
            // if (occ.description || occ.message || occ.summary) {
            //   occItems.push({ text: occ.description || occ.message || occ.summary, style: 'small', margin: [6, 0, 0, 4] });
            // }

            // recommendation (if present)
            const occRec = occ.recommendation || occ.remediation || '';
            if (occRec) {
              occItems.push({ text: 'Recommendation:', style: 'subheader', fontSize: 11, margin: [6, 4, 0, 2] , color: '#fae719'});
              occItems.push({ text: occRec, style: 'small', margin: [6, 0, 0, 6] });
            }

            // code snippet block (render in a monospace box)
            const occCode = occ.snippet || occ.code || occ.source || '';
            if (occCode && String(occCode).trim() !== '') {
              occItems.push({ text: 'Code Snippet:', style: 'subheader', fontSize: 11, margin: [6, 4, 0, 2] ,color: '#19dcfa'} );
              // Use a single-cell table so pdfmake will render fillColor and borders reliably
              occItems.push({
                table: {
                  body: [ [ { text: String(occCode), style: 'mono', margin: [6, 4, 6, 4] } ] ]
                },
                layout: {
                  // show borders on the cell
                  hLineWidth: () => 0, // we'll use cell-level borders instead
                  vLineWidth: () => 0,
                  paddingLeft: () => 0,
                  paddingRight: () => 0
                },
                margin: [6, 0, 0, 8],
                fillColor: '#0D0042',
                border: [true, true, true, true]
              });
            }

            return occItems;
          });
          const ruleIdentifier = `rule-${file.path || 'file'}-${group.groupKey || group.rule_id || 'group'}`;

          // richer layout: left severity column, right details column
          doc.content.push({
        table: {
          widths: [110, '*'],
              body: [[
                // left column: severity badge + rule ids
                    {
                      stack: [
                        // pdfmake expects borderWidth to be a number or an array [left, top, right, bottom]
                        // and does not support `borderStyle`. Remove unsupported props and set explicit widths.
                        { text: (severity || 'N/A'), alignment: 'center', color: sevColor, bold: true, margin: [6, 8, 6, 8], fontSize: 14 },
                        { text: group.rule_id || representative.rule_id || '', style: 'small', alignment: 'center', color: '#f3f4f6', margin: [0, 6, 0, 2] },
                        { text: ruleIdentifier, style: 'small', alignment: 'center', color: '#9ca3af' }
                      ],
                      margin: [0, 4, 8, 4]
                    },
                // right column: rule name, description, occurrences, recommendation, code
                {
                  stack: [
                    { text: ruleName, style: 'cardTitle', fontSize: 16 },
                    description ? { text: description, style: 'small', margin: [0, 6, 0, 6] } : null,
                    { text: `Occurrences (${(group.occurrences || []).length})`, style: 'subheader', fontSize: 13, margin: [0, 6, 0, 4] },
                    // occurrences list (each occurrence already built as small stacks)
                    ...occurrencesStack,
                    // Recommendation highlighted box
                    
                    // code snippet block
                    
                  ].filter(Boolean)
                }
              ]]
            },
            layout: { defaultBorder: false, hLineWidth: () => 0, vLineWidth: () => 0 },
            margin: [0, 6, 0, 12]
          });
        }
      }
    };

    // Helper to tolerate different backend shapes for scores (file scans sometimes put score at top-level)
    const getScanScore = (scanObj = {}) => {
      if (!scanObj) return 'N/A';
      const stats = scanObj.stats || {};
      // Check common names in order of preference
      return (
        stats.vuln_score ??
        stats.bp_score ??
        stats.custom_rules_score ??
        stats.cust_score ??
        stats.custScore ??
        stats.score ??
        scanObj.score ??
        scanObj.vuln_score ??
        scanObj.bp_score ??
        'N/A'
      );
    };

    const vulnScore = getScanScore(data?.vulnerabilityScan);
    const vulnStats = data?.vulnerabilityScan?.stats || {};
    const scannedFilesCount = vulnStats.scanned_files ?? (data?.vulnerabilityScan?.results?.length || 0);
    const totalFindingsCount = (vulnStats.total_findings ?? vulnStats.total) || (data?.vulnerabilityScan?.results || []).reduce((acc, f) => acc + (f.findings?.length || 0), 0);

    doc.content.push({ text: 'Vulnerability Summary', style: 'header', tocItem: true });
    // Summary: score, scanned files, total findings and severity breakdown
    const severityColorMapSummary = { CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981', INFORMATIONAL: '#3b82f6', POSITIVE: '#16a34a' };
    const sevCounts = {
      CRITICAL: vulnStats.critical ?? 0,
      HIGH: vulnStats.high ?? 0,
      MEDIUM: vulnStats.medium ?? 0,
      LOW: vulnStats.low ?? 0,
      INFORMATIONAL: vulnStats.informational ?? vulnStats.info ?? 0,
      POSITIVE: vulnStats.positive ?? 0,
    };

    doc.content.push({
      columns: [
        {
          width: 200,
          stack: [
            { text: 'Score', style: 'small' },
            { text: String(vulnScore), style: 'header', margin: [0, 4, 0, 8] },
            { columns: [ { width: '*', stack: [ { text: 'Scanned Files', style: 'small' }, { text: String(scannedFilesCount), style: 'subheader' } ] }, { width: '*', stack: [ { text: 'Total Findings', style: 'small' }, { text: String(totalFindingsCount), style: 'subheader' } ] } ], columnGap: 12 }
          ],
          margin: [0, 0, 12, 0]
        },
        {
          width: '*',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { stack: [ { text: 'Critical', style: 'small', color: '#ffffff' }, { text: String(sevCounts.CRITICAL), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.CRITICAL, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'High', style: 'small', color: '#ffffff' }, { text: String(sevCounts.HIGH), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.HIGH, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'Medium', style: 'small', color: '#ffffff' }, { text: String(sevCounts.MEDIUM), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.MEDIUM, margin: [6,6,6,6], alignment: 'center' }
              ],
              [
                { stack: [ { text: 'Low', style: 'small', color: '#ffffff' }, { text: String(sevCounts.LOW), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.LOW, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'Informational', style: 'small', color: '#ffffff' }, { text: String(sevCounts.INFORMATIONAL), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.INFORMATIONAL, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'none', style: 'small', color: '#000000' }, { text: String(sevCounts.POSITIVE), style: 'subheader', color: '#000000' } ], fillColor: '#000000', margin: [6,6,6,6], alignment: 'center' }
              ]
            ]
          },
          layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
        }
      ],
      margin: [0, 6, 0, 12]
    });
    // Best Practices summary (same layout)
  const bpScore = getScanScore(data?.bestPracticesScan);
  const bpStats = data?.bestPracticesScan?.stats || {};
    const bpSevCounts = {
      CRITICAL: bpStats.critical ?? 0,
      HIGH: bpStats.high ?? 0,
      MEDIUM: bpStats.medium ?? 0,
      LOW: bpStats.low ?? 0,
      INFORMATIONAL: bpStats.informational ?? bpStats.info ?? 0,
      POSITIVE: bpStats.positive ?? 0,
    };

    doc.content.push({
      text: 'Best Practices Summary',
      style: 'header',
      tocItem: true
    });
    doc.content.push({
      columns: [
        {
          width: 200,
          stack: [
            { text: 'Score', style: 'small' },
            { text: String(bpScore), style: 'header', margin: [0, 4, 0, 8] },
            { columns: [ { width: '*', stack: [ { text: 'Scanned Files', style: 'small' }, { text: String(bpStats.scanned_files ?? 0), style: 'subheader' } ] }, { width: '*', stack: [ { text: 'Total Findings', style: 'small' }, { text: String(bpStats.total_findings ?? bpStats.total ?? 0), style: 'subheader' } ] } ], columnGap: 12 }
          ],
          margin: [0, 0, 12, 0]
        },
        {
          width: '*',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { stack: [ { text: 'Critical', style: 'small', color: '#ffffff' }, { text: String(bpSevCounts.CRITICAL), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.CRITICAL, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'High', style: 'small', color: '#ffffff' }, { text: String(bpSevCounts.HIGH), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.HIGH, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'Medium', style: 'small', color: '#ffffff' }, { text: String(bpSevCounts.MEDIUM), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.MEDIUM, margin: [6,6,6,6], alignment: 'center' }
              ],
              [
                { stack: [ { text: 'Low', style: 'small', color: '#ffffff' }, { text: String(bpSevCounts.LOW), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.LOW, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'Informational', style: 'small', color: '#ffffff' }, { text: String(bpSevCounts.INFORMATIONAL), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.INFORMATIONAL, margin: [6,6,6,6], alignment: 'center' },
                { stack: [ { text: 'none', style: 'small', color: '#000000' }, { text: String(bpSevCounts.POSITIVE), style: 'subheader', color: '#000000' } ], fillColor: '#000000', margin: [6,6,6,6], alignment: 'center' }
              ]
            ]
          },
          layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
        }
      ],
      margin: [0, 6, 0, 12]
    });

    // Custom Rules summary (if present)
    if (data?.customRuleScan) {
      // tolerate multiple possible backend keys for the custom rules score
  const crStats = data.customRuleScan.stats || {};
  const crScore = getScanScore(data.customRuleScan);
      const crSevCounts = {
        CRITICAL: crStats.critical ?? 0,
        HIGH: crStats.high ?? 0,
        MEDIUM: crStats.medium ?? 0,
        LOW: crStats.low ?? 0,
        INFORMATIONAL: crStats.informational ?? crStats.info ?? 0,
        POSITIVE: crStats.positive ?? 0,
      };

      doc.content.push({ text: 'Custom Rules Summary', style: 'header', tocItem: true });
      doc.content.push({
        columns: [
          {
            width: 200,
            stack: [
              { text: 'Score', style: 'small' },
              { text: String(crScore), style: 'header', margin: [0, 4, 0, 8] },
              { columns: [ { width: '*', stack: [ { text: 'Scanned Files', style: 'small' }, { text: String(crStats.scanned_files ?? 0), style: 'subheader' } ] }, { width: '*', stack: [ { text: 'Total Findings', style: 'small' }, { text: String(crStats.total_findings ?? crStats.total ?? 0), style: 'subheader' } ] } ], columnGap: 12 }
            ],
            margin: [0, 0, 12, 0]
          },
          {
            width: '*',
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { stack: [ { text: 'Critical', style: 'small', color: '#ffffff' }, { text: String(crSevCounts.CRITICAL), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.CRITICAL, margin: [6,6,6,6], alignment: 'center' },
                  { stack: [ { text: 'High', style: 'small', color: '#ffffff' }, { text: String(crSevCounts.HIGH), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.HIGH, margin: [6,6,6,6], alignment: 'center' },
                  { stack: [ { text: 'Medium', style: 'small', color: '#ffffff' }, { text: String(crSevCounts.MEDIUM), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.MEDIUM, margin: [6,6,6,6], alignment: 'center' }
                ],
                [
                  { stack: [ { text: 'Low', style: 'small', color: '#ffffff' }, { text: String(crSevCounts.LOW), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.LOW, margin: [6,6,6,6], alignment: 'center' },
                  { stack: [ { text: 'Informational', style: 'small', color: '#ffffff' }, { text: String(crSevCounts.INFORMATIONAL), style: 'subheader', color: '#ffffff' } ], fillColor: severityColorMapSummary.INFORMATIONAL, margin: [6,6,6,6], alignment: 'center' },
                  { stack: [ { text: 'none', style: 'small', color: '#000000' }, { text: String(crSevCounts.POSITIVE), style: 'subheader', color: '#000000' } ], fillColor: '#000000', margin: [6,6,6,6], alignment: 'center' }
                ]
              ]
            },
            layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
          }
        ],
        margin: [0, 6, 0, 12]
      });
    }

  // Pre-format results and set explicit rule display names using getRuleName
  try {
    const vulnRaw = data?.vulnerabilityScan?.results || [];
    const formattedVuln = formatResultsForPdf(vulnRaw, 'vulnerabilities').map((f) => ({
      ...f,
      groups: (f.groups || []).map((g) => ({ ...g, rule_name: getRuleName(g.rule_id || g.rule_id, 'vulnerabilities') }))
    }));
    addSection('Vulnerabilities', vulnScore, formattedVuln, 'vulnerabilities');
    // console.log('Vulnerabilities Section:', scanData.vulnerabilityScan.results[0].findings[0]);

    const bpRaw = data?.bestPracticesScan?.results || [];
    const formattedBp = formatResultsForPdf(bpRaw, 'best-practices').map((f) => ({
      ...f,
      groups: (f.groups || []).map((g) => ({ ...g, rule_name: getRuleName(g.rule_id || g.rule_id, 'best-practices') }))
    }));
    addSection('Best Practices', bpScore, formattedBp, 'best-practices');

    if (data?.customRuleScan) {
      const crStats = data.customRuleScan.stats || {};
      const crScore = crStats.custom_rules_score ?? crStats.cust_score ?? crStats.custScore ?? crStats.score ?? 'N/A';
      const crRaw = data.customRuleScan.results || [];
      const formattedCr = formatResultsForPdf(crRaw, 'custom-rules').map((f) => ({
        ...f,
        groups: (f.groups || []).map((g) => ({ ...g, rule_name: getRuleName(g.rule_id || g.rule_id, 'custom-rules') }))
      }));
      addSection('Custom Rules', crScore, formattedCr, 'custom-rules');
    }
  } catch (err) {
    // Fall back to default behavior if formatting fails
    console.warn('PDF formatting pre-pass failed, falling back to raw addSection calls', err);
    addSection('Vulnerabilities', vulnScore, data?.vulnerabilityScan?.results || [], 'vulnerabilities');
    addSection('Best Practices', bpScore, data?.bestPracticesScan?.results || [], 'best-practices');
    if (data?.customRuleScan) {
      const crStats = data.customRuleScan.stats || {};
      const crScore = crStats.custom_rules_score ?? crStats.cust_score ?? crStats.custScore ?? crStats.score ?? 'N/A';
      addSection('Custom Rules', crScore, data.customRuleScan.results || [], 'custom-rules');
    }
  }

    return doc;
  };

  // Generate PDF when scanData becomes available
  useEffect(() => {
    // Wait until we have scanData and rule metadata loaded so getRuleName can resolve
    if (!scanData || !metadataLoaded) return;
    let cancelled = false;

    const generatePdf = async () => {
      setIsGeneratingPdf(true);
      setPdfReady(false);

      // Load logo as data URL
      const logoUrl = '/Images/ZypherLogo-white.png';
      const logoDataUrl = await imageToDataUrl(logoUrl);

      try {
        // No runtime font embedding: use pdfmake defaults and generic monospace
        // defensive dynamic import: pdfmake and vfs_fonts export shapes vary across bundlers
        const pdfmakeModule = await import('pdfmake/build/pdfmake');
        const pdfmake = pdfmakeModule && (pdfmakeModule.default || pdfmakeModule.pdfMake || pdfmakeModule);

        let possibleVfs = null;
        try {
          const vfsModule = await import('pdfmake/build/vfs_fonts');
          possibleVfs = vfsModule && (vfsModule.pdfMake?.vfs || vfsModule.vfs || vfsModule.default?.vfs || vfsModule.default?.pdfMake?.vfs);
        } catch (e) {
          console.warn('pdfmake vfs import failed, continuing without embedded fonts', e?.message || e);
        }

  if (!pdfmake) throw new Error('pdfmake module could not be loaded');
  if (possibleVfs) pdfmake.vfs = possibleVfs;

  // Build the doc definition directly from the scan data. (Instrumentation and
  // sanitizer removed — we keep the doc builder small and rely on explicit
  // type correctness in `buildDocDefinition`.)
  var docDef = buildDocDefinition(scanData, logoDataUrl, getRuleName);

  // Lightweight inspector: log any suspicious long hyphenated strings or
  // canvas numeric fields that are non-numeric. This helps trace the exact
  // docDef path that causes pdfmake's "unsupported number" error without
  // mutating data.
  const inspectDocDefForIssues = (root) => {
    const offenders = [];
    const suspiciousPattern = /[0-9A-Fa-f]{4,}-[0-9A-Fa-f\-]{10,}|\d{4,}-\d{2,}-\d{2,}|\d+-\d+-\d+-\d+/;

    const visit = (node, path = []) => {
      if (node === null || node === undefined) return;
      if (typeof node === 'string') {
        if (suspiciousPattern.test(node) && node.length > 20) offenders.push({ path: path.join('.'), value: node });
        return;
      }
      if (typeof node === 'number' || typeof node === 'boolean') return;
      if (Array.isArray(node)) return node.forEach((n, i) => visit(n, path.concat(`[${i}]`)));
      if (typeof node === 'object') {
        // Check canvas primitives for non-numeric numeric fields
        if (node.type === 'rect' || node.type === 'line') {
          const numericFields = node.type === 'rect' ? ['x', 'y', 'w', 'h', 'lineWidth'] : ['x1', 'y1', 'x2', 'y2', 'lineWidth'];
          numericFields.forEach((f) => {
            if (Object.prototype.hasOwnProperty.call(node, f)) {
              const val = node[f];
              if (typeof val !== 'number') offenders.push({ path: path.concat(f).join('.'), value: val });
            }
          });
        }
        Object.keys(node).forEach((k) => visit(node[k], path.concat(k)));
        return;
      }
    };

    try { visit(root, []); } catch (e) { /* PDF inspector failed during development; ignore */ }

    // Do not log inspector results in production; caller may decide what to do
    if (offenders.length > 0) {
      /* offenders detected */
    }
    return offenders;
  };

  // Run the inspector (silent in production)
  try { inspectDocDefForIssues(docDef); } catch (e) { /* inspector threw; ignore */ }

  // Wrap dynamic render functions (background/header/footer) so we can
  // inspect their returned doc fragments at render time (pdfmake calls
  // these with pageSize/currentPage). This helps catch values that only
  // appear when the functions execute.
  const wrapRenderInspector = (fn, name) => {
    if (typeof fn !== 'function') return fn;
    return function wrapped(...args) {
        try {
        const res = fn.apply(this, args);
        try { inspectDocDefForIssues(res); } catch (e) { /* inspector threw inside render; ignore */ }
        return res;
      } catch (e) {
        // rethrow so pdfmake observes same behavior
        throw e;
      }
    };
  };

  // Sanitize doc fragments at render time or top-level: coerce numeric-like
  // string values used by pdfmake's canvas/table rendering into numbers.
  // Log replacements so we can trace the offending path/value.
  const sanitizeDocDef = (root) => {
    if (!root || typeof root !== 'object') return [];
    const replacements = [];
    const numericLike = (s) => typeof s === 'string' && /^\s*-?\d+(?:\.\d+)?\s*$/.test(String(s));

    const coerce = (val) => {
      if (typeof val === 'number') return { ok: true, value: val };
      if (numericLike(val)) {
        const n = Number(String(val).trim());
        if (!Number.isNaN(n)) return { ok: true, value: n };
      }
      return { ok: false };
    };

    const visit = (node, path = []) => {
      if (node === null || node === undefined) return;
      if (Array.isArray(node)) return node.forEach((n, i) => visit(n, path.concat(`[${i}]`)));
      if (typeof node !== 'object') return;

      // canvas primitives
      if (node.type === 'rect' || node.type === 'line') {
        const numericFields = node.type === 'rect' ? ['x', 'y', 'w', 'h', 'lineWidth'] : ['x1', 'y1', 'x2', 'y2', 'lineWidth'];
        numericFields.forEach((f) => {
          if (Object.prototype.hasOwnProperty.call(node, f)) {
            const val = node[f];
            const r = coerce(val);
            if (r.ok) {
              if (typeof val !== 'number') {
                replacements.push({ path: path.concat(f).join('.'), from: val, to: r.value });
                node[f] = r.value;
              }
            } else if (typeof val !== 'number') {
              // non-coercible values -> replace with 0 to avoid crash
              replacements.push({ path: path.concat(f).join('.'), from: val, to: 0 });
              node[f] = 0;
            }
          }
        });
      }

      // table widths: can be numbers, strings like '100', '*', 'auto'
      if (node.table && Array.isArray(node.table.widths)) {
        node.table.widths = node.table.widths.map((w, idx) => {
          if (typeof w === 'number') return w;
          if (numericLike(w)) {
            const n = Number(String(w).trim());
            replacements.push({ path: path.concat('table.widths', `[${idx}]`).join('.'), from: w, to: n });
            return n;
          }
          return w; // keep '*' and 'auto' and other layouts
        });
      }

      Object.keys(node).forEach((k) => visit(node[k], path.concat(k)));
    };

    try { visit(root, []); } catch (e) { console.warn('[PDF SANITIZE] Failed scanning docDef', e); }
    if (replacements.length > 0) console.warn('[PDF SANITIZE] Coerced/replaced numeric fields (path/from->to):', replacements.slice(0, 200));
    return replacements;
  };

  try {
    if (docDef.background) docDef.background = wrapRenderInspector(docDef.background, 'background');
    if (docDef.header) docDef.header = wrapRenderInspector(docDef.header, 'header');
    if (docDef.footer) docDef.footer = wrapRenderInspector(docDef.footer, 'footer');
  } catch (e) {
    console.warn('[PDF INSPECT] Failed to wrap render functions', e);
  }

  // Run a quick sanitization pass on the top-level docDef to coerce any
  // numeric-like strings into real numbers (and guard against bad values).
  try { sanitizeDocDef(docDef); } catch (e) { console.warn('[PDF SANITIZE] top-level sanitize failed', e); }

  // diagnostics removed

  // create the PDF using pdfmake with default settings (no embedded fonts)
  try {
    const pdfDocGenerator = pdfmake.createPdf(docDef);

    // Simple blob generation path (no instrumentation)
    pdfDocGenerator.getBlob((blob) => {
      if (cancelled) return;
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
        pdfBlobUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      pdfBlobUrlRef.current = url;
      setPdfUrl(url);
      setPdfReady(true);
      setIsGeneratingPdf(false);
    });
  } catch (err) {
    console.error('Error creating PDF generator or generating blob:', err);
    setIsGeneratingPdf(false);
  }
      } catch (err) {
        console.error('Error generating PDF:', err);
        setIsGeneratingPdf(false);
      }
    };

  generatePdf();

    return () => {
      cancelled = true;
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
        pdfBlobUrlRef.current = null;
      }
    };
  }, [scanData, metadataLoaded]);

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
    // normalize score field names so UI matches PDF regardless of backend key naming
    const normalizeScore = (s) => (s?.custom_rules_score ?? s?.cust_score ?? s?.custScore ?? s?.score ?? s?.vuln_score ?? s?.bp_score ?? s?.score ?? undefined);
    if (type === "file") {
      displayScore = normalizeScore(stats) ?? stats?.score;
    } else if (type === "repo") {
      if (currentScanTypeKey === "vulnerabilityScan") {
        displayScore = stats?.vuln_score ?? normalizeScore(stats);
      } else if (currentScanTypeKey === "bestPracticesScan") {
        displayScore = stats?.bp_score ?? normalizeScore(stats);
      } else if (currentScanTypeKey === "customRuleScan") {
        displayScore = normalizeScore(stats) ?? stats?.cust_score ?? '0';
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-sm text-[var(--text-secondary)]">
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center">
            <span>Scan ID:</span>
            <span className="font-medium text-[var(--foreground)] ml-2">
              {scanID}
            </span>
          </div>
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center ">
            <span>Scan Type:</span>
            <span className="font-medium text-[var(--foreground)] capitalize ml-2">
              {type}
            </span>
          </div>
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center ">
            <span>Scan Date:</span>
            <span className="font-medium text-[var(--foreground)] ml-2">
              {formattedTimestamp}
            </span>
          </div>
          <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)] flex items-center">
            <span>Generate Report:</span>
            <div className="font-medium text-[var(--foreground)] ml-2">
              {isGeneratingPdf ? (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--border-input)] text-sm"
                >
                  <Loader2 className="animate-spin" size={14} /> Generating...
                </button>
                ) : pdfReady && pdfUrl ? (
                <div className="inline-flex items-center gap-2">
                  <a
                    href={pdfUrl}
                    download={`zypher-finding-report-${scanID}.pdf`}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--brand-yellow)] text-[var(--background)] text-sm hover:brightness-95"
                  >
                    <FileText size={14} /> Download PDF
                  </a>
                </div>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--border-input)] text-sm"
                >
                  Preparing...
                </button>
              )}
            </div>
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
