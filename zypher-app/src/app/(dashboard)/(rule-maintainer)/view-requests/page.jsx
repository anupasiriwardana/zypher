"use client";

import { useState, useMemo, useCallback } from 'react';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import {
  Search, ArrowDownWideNarrow, ArrowUpWideNarrow,
  Hourglass, Code, FlaskConical, CheckCircle, XCircle, BookOpen,
} from 'lucide-react';

import RuleRequestDetailModal from '@/components/RuleRequestDetailModal';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});


const initialRuleRequests = [
  {
    id: "req-001",
    ruleName: "No Hardcoded API Keys in YAML",
    description: "Detects API keys or sensitive strings directly embedded in YAML configuration files, which can lead to security breaches.",
    severity: "critical",
    targetFileTypes: ".yml, .yaml",
    exampleCode: `apiVersion: v1\nkind: ConfigMap\ndata:\n  apiKey: "your_hardcoded_api_key_123"\n`,
    status: "yet-to-review", // 'yet-to-review', 'being-developed', 'being-tested', 'to-be-approved', 'discarded', 'approved'
    submittedDate: "2025-07-08T10:00:00Z",
    requesterId: "user-alpha",
    developerNotes: null,
    testerNotes: null,
    discardReason: null,
  },
  {
    id: "req-002",
    ruleName: "Force HTTPS in Ingress Resources",
    description: "Ensures all Kubernetes Ingress resources use HTTPS and redirect HTTP traffic, preventing insecure communication.",
    severity: "high",
    targetFileTypes: ".yml, .yaml",
    exampleCode: `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  annotations:\n    nginx.ingress.kubernetes.io/ssl-redirect: "false"\nspec:\n  rules:\n    - host: example.com\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: my-service\n                port:\n                  number: 80\n`,
    status: "being-developed",
    submittedDate: "2025-07-05T14:30:00Z",
    requesterId: "user-beta",
    developerNotes: "Initial regex patterns created. Need to test against various ingress versions.",
    testerNotes: null,
    discardReason: null,
  },
  {
    id: "req-003",
    ruleName: "Restrict Root User in Dockerfile",
    description: "Flags Dockerfiles that do not explicitly set a non-root user for running processes, improving container security.",
    severity: "medium",
    targetFileTypes: "Dockerfile",
    exampleCode: `FROM alpine\nRUN apk add curl\nUSER root\nCMD ["curl", "example.com"]\n`,
    status: "being-tested",
    submittedDate: "2025-07-01T09:15:00Z",
    requesterId: "user-gamma",
    developerNotes: "Rule implemented using AST parsing for USER command.",
    testerNotes: "Passed basic test cases. Testing edge cases now, especially multi-stage builds.",
    discardReason: null,
  },
  {
    id: "req-004",
    ruleName: "No Public S3 Buckets in Terraform",
    description: "Identifies Terraform configurations that provision publicly accessible S3 buckets, preventing data exposure.",
    severity: "critical",
    targetFileTypes: ".tf",
    exampleCode: `resource "aws_s3_bucket" "b" {\n  bucket = "my-public-bucket"\n  acl    = "public-read"\n}\n`,
    status: "to-be-approved",
    submittedDate: "2025-06-25T11:00:00Z",
    requesterId: "user-delta",
    developerNotes: "Rule uses Terraform HCL parsing to check 'acl' and 'public_access_block' settings. Ready for internal testing.",
    testerNotes: null, // Still waiting for tester notes
    discardReason: null,
  },
 
  {
    id: "req-006",
    ruleName: "Ensure Strong Password Policies",
    description: "A general best practice. Not directly scannable through files but could be a meta-rule.",
    severity: "informational",
    targetFileTypes: "N/A",
    exampleCode: ``,
    status: "discarded",
    submittedDate: "2025-06-10T08:00:00Z",
    requesterId: "user-zeta",
    developerNotes: null,
    testerNotes: null,
    discardReason: "Too broad, not directly scannable from config files. Better suited for policy documentation.",
  },
  {
    id: "req-007",
    ruleName: "Detect Public SSH Keys in Repos",
    description: "Identifies exposed SSH private keys within source code repositories, a critical security vulnerability.",
    severity: "critical",
    targetFileTypes: ".pem, .key, .pub",
    exampleCode: `-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n`,
    status: "yet-to-review",
    submittedDate: "2025-07-07T11:45:00Z",
    requesterId: "user-eta",
    developerNotes: null,
    testerNotes: null,
    discardReason: null,
  },
  {
    id: "req-008",
    ruleName: "Verify Helm Chart Integrity",
    description: "A rule to ensure Helm charts are signed and verified before deployment, preventing tampering.",
    severity: "high",
    targetFileTypes: ".tgz, Chart.yaml",
    exampleCode: `apiVersion: v2\nname: my-chart\nversion: 0.1.0\n`,
    status: "yet-to-review",
    submittedDate: "2025-07-06T13:00:00Z",
    requesterId: "user-theta",
    developerNotes: null,
    testerNotes: null,
    discardReason: null,
  },
  {
    id: "req-009",
    ruleName: "Avoid Outdated Base Images in Docker",
    description: "Flags Dockerfiles that use base images older than 6 months or with known critical vulnerabilities.",
    severity: "medium",
    targetFileTypes: "Dockerfile",
    exampleCode: `FROM ubuntu:18.04\nRUN apt-get update\n`,
    status: "being-developed",
    submittedDate: "2025-07-03T10:00:00Z",
    requesterId: "user-iota",
    developerNotes: "Researching vulnerability databases integration. Initial parsing logic for FROM statement is complete.",
    testerNotes: null,
    discardReason: null,
  },
  {
    id: "req-010",
    ruleName: "SQL Injection Prevention Check",
    description: "A rule to find common patterns indicative of potential SQL injection vulnerabilities in code.",
    severity: "critical",
    targetFileTypes: ".py, .js, .php",
    exampleCode: `query = "SELECT * FROM users WHERE name = '" + user_input + "'";`,
    status: "to-be-approved",
    submittedDate: "2025-06-20T09:00:00Z",
    requesterId: "user-kappa",
    developerNotes: "Implemented AST traversal for string concatenations in SQL queries. Needs extensive test data.",
    testerNotes: "Passed 95% of test cases including complex nested queries. Found one false positive with a specific ORM usage.",
    discardReason: null,
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

// --- Reusable Table Component ---
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
  showStatusFilter = true, // Option to hide status filter for "yet-to-review" table
  availableStatuses, // For status filter options specific to this table
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Rule ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Rule Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Target File Types
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Submitted Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-input)]">
              {filteredAndSortedRequests.map((request) => {
                const statusData = requestStatusMap[request.status] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20', icon: null };
                const severityData = severityMap[request.severity] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20' };
                const StatusIcon = statusData.icon;

                return (
                  <tr
                    key={request.id}
                    onClick={() => onRowClick(request)}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--brand-yellow)] group-hover:text-[var(--foreground)]">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-[var(--foreground)] group-hover:text-[var(--brand-yellow)]">
                      {request.ruleName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", severityData.bg, severityData.color)}>
                        {severityData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {request.targetFileTypes || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1", statusData.bg, statusData.color)}>
                        {StatusIcon && <StatusIcon size={14} />} {statusData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(request.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
export default function ViewRequestsPage() {
  const [ruleRequests, setRuleRequests] = useState(initialRuleRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // States for 'Yet to Review' table
  const [yrSearchTerm, setYrSearchTerm] = useState('');
  const [yrFilterSeverity, setYrFilterSeverity] = useState('all');
  const [yrSortOrder, setYrSortOrder] = useState('desc');

  // States for 'Complete List' table
  const [clSearchTerm, setClSearchTerm] = useState('');
  const [clFilterStatus, setClFilterStatus] = useState('all');
  const [clFilterSeverity, setClFilterSeverity] = useState('all');
  const [clSortOrder, setClSortOrder] = useState('desc');

  const yetToReviewRequests = useMemo(() => {
    return ruleRequests.filter(req => req.status === 'yet-to-review');
  }, [ruleRequests]);

  const handleUpdateRuleStatus = useCallback((id, newStatus, additionalNotes = {}) => {
    setRuleRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id
          ? { ...req, status: newStatus, ...additionalNotes }
          : req
      )
    );
  }, []);

  const openModal = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>

      {/* Custom Rules to be Forwarded to the Developer Table */}
      <RuleRequestsTable
        title="Custom Rules to be Forwarded to the Developer"
        requests={yetToReviewRequests}
        searchTerm={yrSearchTerm}
        setSearchTerm={setYrSearchTerm}
        filterSeverity={yrFilterSeverity}
        setFilterSeverity={setYrFilterSeverity}
        sortOrder={yrSortOrder}
        setSortOrder={yrSortOrder} 
        onRowClick={openModal}
        showStatusFilter={false}
        availableStatuses={['yet-to-review']} 
      />

      <div className="my-10 border-t border-[var(--border-input)]"></div> 

      {/* Complete List of Rule Requests Table */}
      <RuleRequestsTable
        title="Complete List of Rule Requests"
        requests={ruleRequests}
        searchTerm={clSearchTerm}
        setSearchTerm={setClSearchTerm}
        filterStatus={clFilterStatus}
        setFilterStatus={setClFilterStatus}
        filterSeverity={clFilterSeverity}
        setFilterSeverity={setClFilterSeverity}
        sortOrder={clSortOrder}
        setSortOrder={setClSortOrder}
        onRowClick={openModal}
        showStatusFilter={true}
        availableStatuses={Object.keys(requestStatusMap)}
      />

      {/* Rule Request Detail Modal */}
      <RuleRequestDetailModal
        request={selectedRequest}
        onClose={closeModal}
        onUpdateStatus={handleUpdateRuleStatus}
      />
    </div>
  );
}