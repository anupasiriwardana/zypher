"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';

import {
  FlaskConical, CheckCircle, XCircle, AlertCircle, Info, FileCode2, Clock, Trash2, Code,
  ExternalLink, ChevronRight, ChevronDown, MonitorCheck, History, Search, Filter, RefreshCcw,
} from 'lucide-react';

import RuleDetailsModal from '@/components/RuleImplementorDetailModal'; 
import TestHistoryModal from '@/components/RuleImplementorTestHistory'; 

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const rulesAwaitingTesting = [
  {
    id: 'R005',
    name: 'Unencrypted DB Connections',
    severity: 'High',
    targetFileType: 'JSON/YAML',
    status: 'To be tested',
    dateAdded: '2025-07-10',
    developerNotes: 'New rule developed by Alice Developer. Needs comprehensive security testing against various DB configurations, specifically checking for false negatives with custom ports.',
    codeFiles: [
      { name: 'db_connection_rule.json', content: '{\n  "ruleName": "Unencrypted DB Connections",\n  "pattern": "ssl_enabled: false",\n  "severity": "Critical"\n}', language: 'json' },
      { name: 'config_schema.yaml', content: 'schema: db-config\nversion: 1.0\nfields:\n  - name: ssl_enabled\n    type: boolean', language: 'yaml' },
    ],
  },
  {
    id: 'R018',
    name: 'Weak Crypto Algorithm Check',
    severity: 'Medium',
    targetFileType: 'Python/JS',
    status: 'To be tested',
    dateAdded: '2025-07-12',
    developerNotes: 'Rule R018 detects use of MD5 or SHA1 algorithms. Please ensure it correctly identifies insecure implementations and handles edge cases with legacy systems.',
    codeFiles: [
      { name: 'crypto_check.py', content: 'def check_algo(algo):\n  if algo == "MD5" or algo == "SHA1":\n    return False\n  return True', language: 'python' },
    ],
  },
];

const pastTestHistory = [
  {
    id: 'R001',
    name: 'SQL Injection Prevention',
    severity: 'Critical',
    targetFileType: 'JSON',
    status: 'Test Passed',
    dateAdded: '2025-07-01',
    developerNotes: 'Initial version of SQL injection detection rule.',
    testNotes: 'Passed all positive and negative test cases. Performance metrics look good. Ready for deployment.',
    codeFiles: [{ name: 'sql_rule.json', content: '{"ruleName": "SQL Injection Prevention", ...}', language: 'json' }],
    testFiles: [{ name: 'test_cases_v1.yaml', content: 'test1: pass\ntest2: fail\n...', language: 'yaml' }],
  },
  {
    id: 'R003',
    name: 'Unvalidated Redirects',
    severity: 'High',
    targetFileType: 'JS',
    status: 'Test Failed',
    dateAdded: '2025-07-05',
    developerNotes: 'Checks for open redirects. Needs robust URL validation.',
    testNotes: 'Failed testing when a relative URL was provided without a leading slash. Bug logged for developer review.',
    codeFiles: [{ name: 'redirect_logic.js', content: 'function validateRedirect(url) { ... }', language: 'javascript' }],
    testFiles: [{ name: 'test_cases_redirect.json', content: '{"test_case": "relative_url_no_slash", "expected": "fail"}', language: 'json' }],
  },
  {
    id: 'R008',
    name: 'Exposure of Sensitive Info',
    severity: 'Medium',
    targetFileType: 'Python',
    status: 'Test Discarded',
    dateAdded: '2025-06-30',
    developerNotes: 'Initial draft for detecting API keys in code.',
    testNotes: 'Rule logic was too broad, leading to many false positives. Test discarded, rule sent back for refinement.',
    codeFiles: [{ name: 'api_key_check.py', content: 'import re\nregex = "API_KEY=.*"', language: 'python' }],
    testFiles: [{ name: 'test_cases_discarded.txt', content: 'Test cases were inconclusive due to false positives.', language: 'text' }],
  },
];

const StatusBadge = ({ status }) => {
  const statusClasses = {
    'To be tested': 'bg-blue-600/20 text-blue-400',
    'Test Passed': 'bg-green-600/20 text-green-400',
    'Test Failed': 'bg-red-600/20 text-red-400',
    'Test Discarded': 'bg-gray-600/20 text-gray-400',
  };
  const Icon = {
    'To be tested': Info,
    'Test Passed': CheckCircle,
    'Test Failed': XCircle,
    'Test Discarded': Trash2,
  }[status] || Info;

  return (
    <span className={clsx(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
      statusClasses[status]
    )}>
      <Icon size={14} className="mr-2" />
      {status}
    </span>
  );
};

export default function RulesToTestPage() {
  const router = useRouter();
  
  const [isRuleDetailsModalOpen, setIsRuleDetailsModalOpen] = useState(false);
  const [isTestHistoryModalOpen, setIsTestHistoryModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const [searchAwaiting, setSearchAwaiting] = useState('');
  const [filterAwaitingSeverity, setFilterAwaitingSeverity] = useState('All');
  const [filterAwaitingFileType, setFilterAwaitingFileType] = useState('All');

  const [searchPast, setSearchPast] = useState('');
  const [filterPastSeverity, setFilterPastSeverity] = useState('All');
  const [filterPastFileType, setFilterPastFileType] = useState('All');
  const [filterPastStatus, setFilterPastStatus] = useState('All');

  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const fileTypes = ['All', 'JSON', 'YAML', 'JSON/YAML', 'Python', 'JS'];
  const testStatuses = ['All', 'Test Passed', 'Test Failed', 'Test Discarded'];

  // --- Filtering Logic ---
  const filteredAwaitingRules = useMemo(() => {
    let filtered = rulesAwaitingTesting;

    // Search Filter
    if (searchAwaiting) {
      const searchTerm = searchAwaiting.toLowerCase();
      filtered = filtered.filter(rule => 
        rule.id.toLowerCase().includes(searchTerm) || 
        rule.name.toLowerCase().includes(searchTerm)
      );
    }

    // Severity Filter
    if (filterAwaitingSeverity !== 'All') {
      filtered = filtered.filter(rule => rule.severity === filterAwaitingSeverity);
    }

    // Target File Type Filter
    if (filterAwaitingFileType !== 'All') {
      filtered = filtered.filter(rule => rule.targetFileType.includes(filterAwaitingFileType));
    }

    return filtered;
  }, [searchAwaiting, filterAwaitingSeverity, filterAwaitingFileType]);

  // --- Filtering Logic ---
  const filteredPastHistory = useMemo(() => {
    let filtered = pastTestHistory;

    if (searchPast) {
      const searchTerm = searchPast.toLowerCase();
      filtered = filtered.filter(rule => 
        rule.id.toLowerCase().includes(searchTerm) || 
        rule.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filterPastSeverity !== 'All') {
      filtered = filtered.filter(rule => rule.severity === filterPastSeverity);
    }

    if (filterPastFileType !== 'All') {
      filtered = filtered.filter(rule => rule.targetFileType.includes(filterPastFileType));
    }

    if (filterPastStatus !== 'All') {
      filtered = filtered.filter(rule => rule.status === filterPastStatus);
    }

    return filtered;
  }, [searchPast, filterPastSeverity, filterPastFileType, filterPastStatus]);


  // Handle row click for Rules Awaiting Testing
  const handleAwaitingRuleClick = (rule) => {
    setSelectedRule(rule);
    setIsRuleDetailsModalOpen(true);
  };

  // Handle row click for Past Test History
  const handlePastRuleClick = (rule) => {
    setSelectedRule(rule);
    setIsTestHistoryModalOpen(true);
  };

  const handleStartTesting = (ruleId) => {
    setIsRuleDetailsModalOpen(false);
    router.push(`/dashboard/(rule-implementor)/testing-workspace?ruleId=${ruleId}`);
  };

  const filterInputStyle = "px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all duration-200 shadow-inner";
  const filterGroupStyle = "flex items-center gap-2";

  const renderFilters = (type) => {
    const isAwaiting = type === 'awaiting';
    const searchState = isAwaiting ? searchAwaiting : searchPast;
    const setSearchState = isAwaiting ? setSearchAwaiting : setSearchPast;
    const filterSeverityState = isAwaiting ? filterAwaitingSeverity : filterPastSeverity;
    const setFilterSeverityState = isAwaiting ? setFilterAwaitingSeverity : setFilterPastSeverity;
    const filterFileTypeState = isAwaiting ? filterAwaitingFileType : filterPastFileType;
    const setFilterFileTypeState = isAwaiting ? setFilterAwaitingFileType : setFilterPastFileType;
    const filterStatusState = filterPastStatus;
    const setFilterStatusState = setFilterPastStatus;

    return (
      <div className="flex flex-wrap items-center gap-6 mb-6 ">
        {/* Search Bar */}
        <div className={clsx(filterGroupStyle, "relative flex-grow min-w-[200px] max-w-sm")}>
          <Search size={18} className="absolute left-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            className={clsx(filterInputStyle, "pl-10 w-full")}
          />
        </div>

        {/* Severity Filter */}
        <div className={filterGroupStyle}>
          <Filter size={18} className="text-[var(--text-secondary)]" />
          <select 
            value={filterSeverityState} 
            onChange={(e) => setFilterSeverityState(e.target.value)}
            className={filterInputStyle}
          >
            <option value="All">All Severity</option>
            {severities.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* File Type Filter */}
        <div className={filterGroupStyle}>
          <FileCode2 size={18} className="text-[var(--text-secondary)]" />
          <select 
            value={filterFileTypeState} 
            onChange={(e) => setFilterFileTypeState(e.target.value)}
            className={filterInputStyle}
          >
            <option value="All">All File Types</option>
            {fileTypes.slice(1).map(ft => <option key={ft} value={ft}>{ft}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        {!isAwaiting && (
          <div className={filterGroupStyle}>
            <Info size={18} className="text-[var(--text-secondary)]" />
            <select 
              value={filterStatusState} 
              onChange={(e) => setFilterStatusState(e.target.value)}
              className={filterInputStyle}
            >
              <option value="All">All Statuses</option>
              {testStatuses.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-6 md:p-10 lg:p-4 ${lexend.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
 
      <section className="mb-16">
        <div className="flex items-center text-3xl font-semibold mb-8 text-[var(--foreground)]">
          <FlaskConical size={32} className="mr-3 text-blue-400" />
          <h2 className="text-3xl font-bold">Rules Awaiting Testing</h2>
          <span className="ml-4 px-4 py-1 rounded-full text-base font-medium bg-blue-600/20 text-blue-400">
            {filteredAwaitingRules.length} / {rulesAwaitingTesting.length} Rules
          </span>
        </div>
        
        {/* Filters for Awaiting Testing */}
        {renderFilters('awaiting')}

        <div className="bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-[var(--border-input)]">
              <thead className="bg-[var(--background)]">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rule ID</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rule Name</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Severity</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target File Type</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-input)]">
                {filteredAwaitingRules.map((rule) => (
                  <tr 
                    key={rule.id} 
                    onClick={() => handleAwaitingRuleClick(rule)}
                    className="cursor-pointer hover:bg-[var(--hover-bg)] transition-colors duration-200 group"
                  >
                    <td className="py-5 px-6 whitespace-nowrap text-sm font-medium text-[var(--brand-yellow)]">{rule.id}</td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--foreground)] font-semibold">{rule.name}</td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--foreground)]">
                      <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", {
                        'bg-red-600/20 text-red-400': rule.severity === 'Critical',
                        'bg-orange-600/20 text-orange-400': rule.severity === 'High',
                        'bg-yellow-600/20 text-yellow-400': rule.severity === 'Medium',
                        'bg-green-600/20 text-green-400': rule.severity === 'Low',
                      })}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--text-secondary)]">{rule.targetFileType}</td>
                    <td className="py-5 px-6 whitespace-nowrap">
                      <StatusBadge status={rule.status} />
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--text-secondary)]">{rule.dateAdded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAwaitingRules.length === 0 && (
              <div className="text-center py-10 text-[var(--text-secondary)]">
                <p>No matching rules currently awaiting testing.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center text-3xl font-semibold mb-8 text-[var(--foreground)]">
          <History size={32} className="mr-3 text-gray-400" />
          <h2 className="text-3xl font-bold">Past Test History</h2>
          <span className="ml-4 px-4 py-1 rounded-full text-base font-medium bg-gray-600/20 text-gray-400">
            {filteredPastHistory.length} / {pastTestHistory.length} Records
          </span>
        </div>
        
        {/* Filters for Past Test History */}
        {renderFilters('past')}

        <div className="bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-[var(--border-input)]">
              <thead className="bg-[var(--background)]">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rule ID</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rule Name</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Severity</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target File Type</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-input)]">
                {filteredPastHistory.map((rule) => (
                  <tr 
                    key={rule.id} 
                    onClick={() => handlePastRuleClick(rule)}
                    className="cursor-pointer hover:bg-[var(--hover-bg)] transition-colors duration-200 group"
                  >
                    <td className="py-5 px-6 whitespace-nowrap text-sm font-medium text-[var(--brand-yellow)]">{rule.id}</td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--foreground)] font-semibold">{rule.name}</td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--foreground)]">
                      <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", {
                        'bg-red-600/20 text-red-400': rule.severity === 'Critical',
                        'bg-orange-600/20 text-orange-400': rule.severity === 'High',
                        'bg-yellow-600/20 text-yellow-400': rule.severity === 'Medium',
                        'bg-green-600/20 text-green-400': rule.severity === 'Low',
                      })}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--text-secondary)]">{rule.targetFileType}</td>
                    <td className="py-5 px-6 whitespace-nowrap">
                      <StatusBadge status={rule.status} />
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap text-sm text-[var(--text-secondary)]">{rule.dateAdded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPastHistory.length === 0 && (
              <div className="text-center py-10 text-[var(--text-secondary)]">
                <p>No matching past test records found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modals*/}
      {selectedRule && isRuleDetailsModalOpen && (
        <RuleDetailsModal 
          rule={selectedRule} 
          onClose={() => setIsRuleDetailsModalOpen(false)} 
          onStartTesting={handleStartTesting} 
        />
      )}
      
      {selectedRule && isTestHistoryModalOpen && (
        <TestHistoryModal 
          rule={selectedRule} 
          onClose={() => setIsTestHistoryModalOpen(false)} 
        />
      )}
    </div>
  );
}