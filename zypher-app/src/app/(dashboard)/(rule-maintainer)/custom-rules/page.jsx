"use client";

import { useState, useMemo, useCallback } from 'react';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import {
  Search, ArrowDownWideNarrow, ArrowUpWideNarrow,
  Hourglass, Code, FlaskConical, CheckCircle, XCircle, BookOpen,
} from 'lucide-react';

import RuleDetailModal from '@/components/RuleDetailModal';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const initialApprovedRules = [
  {
    id: "RULE-001",
    ruleName: "No Hardcoded API Keys (YAML)",
    description: "Detects API keys or sensitive strings directly embedded in YAML config files.",
    severity: "critical",
    targetFileTypes: ".yml, .yaml",
    exampleCode: `apiVersion: v1\nkind: ConfigMap\ndata:\n  apiKey: "your_hardcoded_api_key_123"\n`,
    status: "approved",
    submittedDate: "2025-06-01T09:00:00Z", // Assuming this is the approval date for this context
    developedCode: `// Rule logic for YAML parsing\nfunction detectHardcodedApiKey(fileContent) {\n  // Regex to find common API key patterns in YAML\n  const regex = /(apiKey|secret|token):\\s*['"]?[a-zA-Z0-9_-]{16,64}['"]?/g;\n  return fileContent.match(regex);\n}\n`,
    testDetails: "Passed 100+ positive and negative test cases. No false positives observed. Performance: ~50ms/file.",
  },
  {
    id: "RULE-002",
    ruleName: "Force HTTPS in Ingress",
    description: "Ensures all Kubernetes Ingress resources use HTTPS and redirect HTTP traffic.",
    severity: "high",
    targetFileTypes: ".yml, .yaml",
    exampleCode: `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  annotations:\n    nginx.ingress.kubernetes.io/ssl-redirect: "false"\nspec:\n  rules:\n    - host: example.com\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: my-service\n                port:\n                  number: 80\n`,
    status: "approved",
    submittedDate: "2025-05-20T14:30:00Z",
    developedCode: `// Logic for Kubernetes Ingress parsing\nfunction enforceHttps(ingressConfig) {\n  // Check for 'nginx.ingress.kubernetes.io/ssl-redirect: "true"'\n  // And ensure no direct HTTP endpoints without redirect\n  return config.annotations['nginx.ingress.kubernetes.io/ssl-redirect'] !== 'true';\n}\n`,
    testDetails: "Comprehensive tests against various ingress versions (nginx, traefik). All expected insecure configurations caught. Test coverage: 92%.",
  },
  {
    id: "RULE-003",
    ruleName: "Restrict Root User in Dockerfile",
    description: "Flags Dockerfiles that do not explicitly set a non-root user.",
    severity: "medium",
    targetFileTypes: "Dockerfile",
    exampleCode: `FROM alpine\nRUN apk add curl\nUSER root\nCMD ["curl", "example.com"]\n`,
    status: "approved",
    submittedDate: "2025-04-15T11:00:00Z",
    developedCode: `// Dockerfile AST analysis\nfunction checkRootUser(dockerfileAST) {\n  const userCommands = dockerfileAST.filter(node => node.command === 'USER');\n  if (userCommands.length === 0 || userCommands[userCommands.length - 1].value === 'root') {\n    return true; // Root user not restricted\n  }\n  return false;\n}\n`,
    testDetails: "Tested on single-stage, multi-stage builds, and different base images. Minor false positive with specific build-time user changes, documented.",
  },
  {
    id: "RULE-004",
    ruleName: "No Public S3 Buckets (Terraform)",
    description: "Identifies Terraform configurations that provision publicly accessible S3 buckets.",
    severity: "critical",
    targetFileTypes: ".tf",
    exampleCode: `resource "aws_s3_bucket" "b" {\n  bucket = "my-public-bucket"\n  acl    = "public-read"\n}\n`,
    status: "approved",
    submittedDate: "2025-03-10T16:00:00Z",
    developedCode: `// Terraform HCL parser logic\nfunction detectPublicS3(tfConfig) {\n  const s3Buckets = tfConfig.resources.filter(r => r.type === 'aws_s3_bucket');\n  for (const bucket of s3Buckets) {\n    if (bucket.attributes.acl === 'public-read' || bucket.attributes.acl === 'public-read-write') {\n      return true;\n    }\n    if (bucket.attributes.public_access_block && !bucket.attributes.public_access_block.block_public_acls) {\n      return true;\n    }\n  }\n  return false;\n}\n`,
    testDetails: "Successfully caught all known public S3 bucket configurations. Includes checks for ACLs and public access blocks. Highly reliable.",
  },
  {
    id: "RULE-005",
    ruleName: "SQL Injection Prevention",
    description: "Finds common patterns indicative of potential SQL injection vulnerabilities.",
    severity: "critical",
    targetFileTypes: ".py, .js, .php",
    exampleCode: `query = "SELECT * FROM users WHERE name = '" + user_input + "'";`,
    status: "approved",
    submittedDate: "2025-02-28T10:00:00Z",
    developedCode: `// AST traversal for vulnerable SQL query construction\nfunction detectSqlInjection(ast) {\n  // Placeholder for complex AST analysis logic\n  return ast.some(node => node.type === 'StringLiteral' && node.value.includes('SELECT') && node.parent.type === 'BinaryExpression' && node.parent.operator === '+');\n}\n`,
    testDetails: "Extensive test suite covering parameterized queries, ORM usage, and raw SQL. Minor false positives with very specific ORM patterns, which are being addressed in v1.1.",
  },
];


const requestStatusMap = {
  'yet-to-review': { label: 'Yet to Review', color: 'text-blue-400', bg: 'bg-blue-600/20', icon: Hourglass },
  'being-developed': { label: 'Being Developed', color: 'text-purple-400', bg: 'bg-purple-600/20', icon: Code },
  'being-tested': { label: 'Being Tested', color: 'text-orange-400', bg: 'bg-orange-600/20', icon: FlaskConical },
  'to-be-approved': { label: 'To Be Approved', color: 'text-green-400', bg: 'bg-green-600/20', icon: CheckCircle },
  'discarded': { label: 'Discarded', color: 'text-red-400', bg: 'bg-red-600/20', icon: XCircle },
  'approved': { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-600/20', icon: BookOpen },
};


const severityMap = {
  'critical': { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/20' },
  'high': { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/20' },
  'medium': { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'low': { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-400/20' },
  'informational': { label: 'Informational', color: 'text-gray-400', bg: 'bg-gray-400/20' },
};


const RuleRequestsTable = ({
  title,
  requests,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterSeverity,
  setFilterSeverity,
  sortOrder,
  setSortOrder,
  onRowClick,
  showStatusFilter = true,
  availableStatuses,
}) => {
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests.filter(request => {
      const matchesSearch =
        request.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = showStatusFilter && filterStatus !== 'all' ? request.status === filterStatus : true;
      const matchesSeverity = filterSeverity === 'all' || request.severity === filterSeverity;

      return matchesSearch && matchesStatus && matchesSeverity;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.submittedDate);
      const dateB = new Date(b.submittedDate);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [requests, searchTerm, filterStatus, filterSeverity, sortOrder, showStatusFilter]);

  return (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-[var(--foreground)]">{title}</h2>

      {/* Search and Filter Bar for this table */}
      <div className="bg-[var(--input-bg)] p-4 rounded-xl mb-6 shadow-md border border-[var(--border-input)] flex flex-col md:flex-row gap-4 md:gap-6 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="text"
            placeholder="Search by ID, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {showStatusFilter && (
            <div className="relative flex-grow">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                {availableStatuses.map(statusKey => (
                  <option key={statusKey} value={statusKey}>{requestStatusMap[statusKey].label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
              </div>
            </div>
          )}

          <div className="relative flex-grow">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Severities</option>
              {Object.keys(severityMap).map(severityKey => (
                <option key={severityKey} value={severityKey}>{severityMap[severityKey].label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
            </div>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] px-4 py-3 rounded-lg hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Sort by Date: {sortOrder === 'desc' ? (
              <>Newest <ArrowDownWideNarrow size={18} /></>
            ) : (
              <>Oldest <ArrowUpWideNarrow size={18} /></>
            )}
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredAndSortedRequests.length === 0 ? (
        <div className="text-center text-[var(--text-secondary)] p-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)]">
          <p className="text-xl">No requests found matching your criteria in this list.</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--input-bg)] rounded-xl shadow-md border border-[var(--border-input)]">
          <table className="min-w-full divide-y divide-[var(--border-input)]">
            <thead className="bg-[var(--hover-bg)]">
              <tr>
                {/* <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Rule ID
                </th> */}
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Rule Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Severity
                </th>
                {/* <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Target File Types
                </th> */}
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Approved Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-input)]">
              {filteredAndSortedRequests.map((rule) => {
                const statusData = requestStatusMap[rule.status] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20', icon: null };
                const severityData = severityMap[rule.severity] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20' };
                const StatusIcon = statusData.icon;

                return (
                  <tr
                    key={rule.id}
                    onClick={() => onRowClick(rule)}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200 cursor-pointer"
                  >
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--brand-yellow)] group-hover:text-[var(--foreground)]">
                      {rule.id}
                    </td> */}
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-[var(--foreground)] group-hover:text-[var(--brand-yellow)]">
                      {rule.ruleName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", severityData.bg, severityData.color)}>
                        {severityData.label}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {rule.targetFileTypes || 'N/A'}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1", statusData.bg, statusData.color)}>
                        {StatusIcon && <StatusIcon size={14} />} {statusData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(rule.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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


// --- Main Page Component ---
export default function CustomRulesPage() {
  const [approvedRules, setApprovedRules] = useState(initialApprovedRules);
  const [selectedRule, setSelectedRule] = useState(null);

  const [crSearchTerm, setCrSearchTerm] = useState('');
  const [crFilterSeverity, setCrFilterSeverity] = useState('all');
  const [crSortOrder, setCrSortOrder] = useState('desc'); 

  const handleRemoveRule = useCallback((ruleIdToRemove) => {
    setApprovedRules(prevRules => prevRules.filter(rule => rule.id !== ruleIdToRemove));
    console.log(`Rule ${ruleIdToRemove} removed.`);
    // In a real app, call API to remove
  }, []);

  const handleUpgradeRule = useCallback((ruleIdToUpgrade) => {
    console.log(`Initiating upgrade for Rule ${ruleIdToUpgrade}.`);
    // Example: change status to 'being-developed' to simulate re-work
    // setApprovedRules(prevRules => prevRules.map(rule =>
    //   rule.id === ruleIdToUpgrade ? { ...rule, status: 'being-developed' } : rule
    // ));
  }, []);

  const openModal = (rule) => {
    setSelectedRule(rule);
  };

  const closeModal = () => {
    setSelectedRule(null);
  };

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Active rules in the system</h1>

      {/* Custom Rules Table */}
      <RuleRequestsTable
        requests={approvedRules}
        searchTerm={crSearchTerm}
        setSearchTerm={setCrSearchTerm}
        filterSeverity={crFilterSeverity}
        setFilterSeverity={setCrFilterSeverity}
        sortOrder={crSortOrder}
        setSortOrder={setCrSortOrder}
        onRowClick={openModal}
        showStatusFilter={false} 
        availableStatuses={['approved']}
      />

      {/* Rule Detail Modal for Approved Rules */}
      <RuleDetailModal
        rule={selectedRule}
        onClose={closeModal}
        onRemove={handleRemoveRule}
        onUpgrade={handleUpgradeRule}
      />
    </div>
  );
}