"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import {
  Search, Filter, Clock, Calendar, CheckCircle, XCircle, ChevronDown, Code, Play, ArrowRight, X, FlaskConical,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const assignedRulesData = [
  {
    id: 'R001',
    name: 'Insecure Password Policy',
    severity: 'High',
    targetFileType: 'Auth.py',
    status: 'To be developed',
    submittedDate: '2025-07-01',
    description: 'The current authentication module accepts passwords shorter than 8 characters, making it vulnerable to brute-force attacks. A new rule is needed to enforce stronger password policies, including length and complexity requirements.',
    exampleCode: `// Example vulnerable code snippet
function login(user, pass) {
    if (pass.length < 5) {
        // Weak check
        return false; 
    }
    // ...
}`,
  },
  {
    id: 'R005',
    name: 'Unencrypted Database Connections',
    severity: 'Critical',
    targetFileType: 'DB_config.json',
    status: 'Under development',
    submittedDate: '2025-07-10',
    description: 'Database connections are being established without SSL/TLS encryption. The rule should identify unencrypted connection strings and flag them as high risk.',
    exampleCode: `// Example configuration vulnerability
{
    "db_host": "192.168.1.1",
    "db_port": 5432,
    "ssl_enabled": false
}`,
  },
  {
    id: 'R010',
    name: 'Cross-Site Scripting (XSS) in Forms',
    severity: 'Medium',
    targetFileType: 'FormHandler.js',
    status: 'To be developed',
    submittedDate: '2025-06-28',
    description: 'User input in form submissions is not properly sanitized, allowing for potential XSS injection. The rule needs to ensure all user input is sanitized before rendering.',
    exampleCode: `// Example XSS vulnerability
const user_input = req.query.comment;
res.send('Your comment: ' + user_input); // No sanitization
`,
  },
];

const developedRulesData = [
  {
    id: 'R002',
    name: 'SQL Injection Prevention',
    severity: 'High',
    targetFileType: 'SQLQueries.php',
    status: 'Under testing',
    submittedDate: '2025-06-15',
    description: 'A rule to identify and prevent dynamic SQL queries without parameterized statements. The rule is currently being tested for false positives and performance.',
    exampleCode: `// Developed rule logic snippet
if (is_concatenated_sql(query)) {
    return 'SQL Injection Vulnerability';
}`,
  },
  {
    id: 'R003',
    name: 'API Key Hardcoding Check',
    severity: 'Low',
    targetFileType: 'Config.yaml',
    status: 'Published',
    submittedDate: '2025-05-20',
    description: 'Identifies hardcoded API keys and credentials within configuration files.',
    exampleCode: `// Rule successfully implemented.
// Example: Detect 'api_key = "secret_key"'`,
  },
  {
    id: 'R004',
    name: 'Unused Dependencies Removal',
    severity: 'Low',
    targetFileType: 'package.json',
    status: 'Discarded',
    submittedDate: '2025-06-01',
    description: 'The Rule Maintainer discarded this rule due to complexity in distinguishing genuinely unused dependencies.',
    exampleCode: `// Discarded rule logic
// Attempts to analyze import usage across files.`,
  },
];


export default function AssignedRulesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const router = useRouter();

  //function for filtering and searching
  const filterRules = (rules) => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            rule.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = !activeFilters.severity || rule.severity === activeFilters.severity;
      const matchesStatus = !activeFilters.status || rule.status === activeFilters.status;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  };

  const assignedRulesFiltered = useMemo(() => filterRules(assignedRulesData), [searchTerm, activeFilters]);
  const developedRulesFiltered = useMemo(() => filterRules(developedRulesData), [searchTerm, activeFilters]);

  const handleRowClick = (rule) => {
    setSelectedRule(rule);
    setShowModal(true);
  };

  const handleStartDeveloping = (ruleId) => {
    // Redirect to development workspace with the selected rule ID
    router.push(`/dashboard/(rule-developer)/development-workspace?ruleId=${ruleId}`);
  };

  const handleStartUpgrading = (ruleId) => {
    router.push(`/dashboard/(rule-developer)/development-workspace?upgradeRuleId=${ruleId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To be developed':
        return 'text-blue-400 bg-blue-600/20';
      case 'Under development':
        return 'text-yellow-400 bg-yellow-600/20';
      case 'Under testing':
        return 'text-purple-400 bg-purple-600/20';
      case 'Published':
        return 'text-green-400 bg-green-600/20';
      case 'Discarded':
        return 'text-red-400 bg-red-600/20';
      default:
        return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400';
      case 'High':
        return 'text-orange-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const commonTableHeaders = [
    // { key: 'id', label: 'Rule ID' },
    { key: 'name', label: 'Rule Name' },
    { key: 'severity', label: 'Severity' },
    // { key: 'targetFileType', label: 'Target File Type' },
    { key: 'status', label: 'Status' },
    { key: 'submittedDate', label: 'Submitted Date' },
  ];

  //component for search and filters
  const FilterBar = ({ onSearchChange, onFilterChange, type }) => {
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    const assignedStatuses = ['To be developed', 'Under development'];
    const developedStatuses = ['Under testing', 'Published', 'Discarded'];
    const statuses = type === 'assigned' ? assignedStatuses : developedStatuses;

    return (
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by Rule ID or Name..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 shadow-inner"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-2/3">
          {/* Severity Filter */}
          <div className="relative w-full md:w-auto">
            <select
              className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent shadow-inner cursor-pointer"
              onChange={(e) => onFilterChange('severity', e.target.value === 'All' ? null : e.target.value)}
            >
              <option value="All">All Severities</option>
              {severities.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative w-full md:w-auto">
            <select
              className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent shadow-inner cursor-pointer"
              onChange={(e) => onFilterChange('status', e.target.value === 'All' ? null : e.target.value)}
            >
              <option value="All">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>
        </div>
      </div>
    );
  };

  const TableSection = ({ title, rules, type }) => {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-[var(--brand-yellow)]">{title}</h2>
          <span className="text-[var(--text-secondary)] text-lg">({rules.length} rules)</span>
        </div>

        <FilterBar 
          onSearchChange={(value) => setSearchTerm(value)} 
          onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))} 
          type={type}
        />

        <div className="bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-[var(--border-input)] text-left">
            <thead className="bg-[var(--hover-bg)]">
              <tr>
                {commonTableHeaders.map(header => (
                  <th key={header.key} className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-input)]">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={commonTableHeaders.length} className="px-6 py-10 text-center text-[var(--text-secondary)] text-lg">
                    No {title.toLowerCase()} found matching criteria.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr 
                    key={rule.id} 
                    onClick={() => handleRowClick(rule)}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200 cursor-pointer group"
                  >
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">{rule.id}</td> */}
                    <td className="px-6 py-4 text-sm text-[var(--foreground)] font-medium group-hover:text-[var(--brand-yellow)] transition-colors">{rule.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getSeverityColor(rule.severity)}>{rule.severity}</span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{rule.targetFileType}</td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(rule.status))}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {rule.submittedDate}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Rule Detail Modal ---
  const RuleDetailModal = ({ rule, onClose, onActionClick, isDeveloped }) => {
    if (!rule) return null;

    const actionText = isDeveloped ? "Start Upgrading" : "Start Developing";
    
    // Determine the syntax highlighter language based on the file type (simple mapping for example)
    const language = rule.targetFileType.split('.').pop().toLowerCase();

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 flex justify-center items-center p-6 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[var(--input-bg)] rounded-xl shadow-2xl border border-[var(--border-input)] p-10 w-full max-w-4xl transform transition-all duration-300 scale-100 animate-slideUp overflow-hidden">
          
          {/* Header and Close Button */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-3xl font-bold text-[var(--brand-yellow)] mb-2">{rule.name}</h3>
              <p className="text-xl text-[var(--foreground)]">{rule.id} | <span className={getSeverityColor(rule.severity)}>{rule.severity}</span></p>
            </div>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors">
              <X size={30} />
            </button>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2"><FlaskConical size={20} /> Description</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed">{rule.description}</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2"><Code size={20} /> Example Code ({language})</h4>
              <div className="rounded-lg overflow-hidden border border-[var(--border-input)] shadow-xl">
                <SyntaxHighlighter language={language} style={coldarkDark} customStyle={{ padding: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {rule.exampleCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          {/* Action Button and Status */}
          <div className="flex justify-between items-center pt-6 border-t border-[var(--border-input)]">
            <div className="flex items-center gap-4">
              <span className="text-[var(--foreground)] font-semibold">Current Status:</span>
              <span className={clsx("px-4 py-2 rounded-full text-sm font-semibold", getStatusColor(rule.status))}>
                {rule.status}
              </span>
            </div>
            <button
              onClick={() => {
                onActionClick(rule.id);
                onClose();
              }}
              className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-xl text-base"
            >
              {isDeveloped ? <Play size={20} /> : <Code size={20} />}
              {actionText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-8 md:p-10 lg:p-12 ${lexend.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>

      {/* Assigned Rules Table (To be developed / Under development) */}
      <TableSection 
        title="Assigned Rules"
        rules={assignedRulesFiltered.filter(r => ['To be developed', 'Under development'].includes(r.status))}
        type="assigned"
      />

      {/* Developed Rules Table (Under testing / Published / Discarded) */}
      <TableSection 
        title="Developed Rules"
        rules={developedRulesFiltered.filter(r => ['Under testing', 'Published', 'Discarded'].includes(r.status))}
        type="developed"
      />

      {/* Rule Detail Modal */}
      {showModal && selectedRule && (
        <RuleDetailModal
          rule={selectedRule}
          onClose={() => setShowModal(false)}
          onActionClick={selectedRule.status === 'To be developed' || selectedRule.status === 'Under development' ? handleStartDeveloping : handleStartUpgrading}
          isDeveloped={['Under testing', 'Published', 'Discarded'].includes(selectedRule.status)}
        />
      )}
    </div>
  );
}