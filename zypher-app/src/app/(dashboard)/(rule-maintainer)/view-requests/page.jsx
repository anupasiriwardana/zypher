"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import {
  Search, ArrowDownWideNarrow, ArrowUpWideNarrow,
  Hourglass, Code, FlaskConical, CheckCircle, XCircle, BookOpen,
  UserCheck, ClipboardCheck, Loader2, AlertCircle
} from 'lucide-react';

import RuleRequestDetailModal from '@/components/RuleRequestDetailModal';
import { useRouter } from 'next/navigation';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const statusMap = {
  'Pending Review': { label: 'Pending Review', color: 'text-blue-400', bg: 'bg-blue-600/20', icon: Hourglass },
  'Assigned': { label: 'Assigned to Developer', color: 'text-indigo-400', bg: 'bg-indigo-600/20', icon: UserCheck },
  'Under Development': { label: 'Under Development', color: 'text-purple-400', bg: 'bg-purple-600/20', icon: Code },
  'Ready for Testing': { label: 'Ready for Testing', color: 'text-amber-400', bg: 'bg-amber-600/20', icon: ClipboardCheck },
  'Being Tested': { label: 'Being Tested', color: 'text-orange-400', bg: 'bg-orange-600/20', icon: FlaskConical },
  'Approved': { label: 'Approved', color: 'text-green-400', bg: 'bg-green-600/20', icon: CheckCircle },
  'Successfully Published': { label: 'Successfully Published', color: 'text-emerald-400', bg: 'bg-emerald-600/20', icon: BookOpen },
  'Rejected': { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-600/20', icon: XCircle },
};

const severityMap = {
  'critical': { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/20' },
  'high': { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/20' },
  'medium': { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'low': { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-400/20' },
  'info': { label: 'Informational', color: 'text-gray-400', bg: 'bg-gray-400/20' },
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
  showStatusFilter = true,
  availableStatuses,
  isLoading = false
}) => {
  const filteredAndSortedRequests = useMemo(() => {
    if (!requests) return [];

    let filtered = requests.filter(request => {
      const matchesSearch =
        request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = showStatusFilter && filterStatus !== 'all' ? request.status === filterStatus : true;
      const matchesSeverity = filterSeverity === 'all' || request.suggested_severity === filterSeverity;

      return matchesSearch && matchesStatus && matchesSeverity;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [requests, searchTerm, filterStatus, filterSeverity, sortOrder, showStatusFilter]);

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-[var(--foreground)]">{title}</h2>
        <div className="flex justify-center items-center py-20 bg-[var(--input-bg)] rounded-xl">
          <Loader2 size={32} className="animate-spin text-[var(--brand-yellow)] mr-3" />
          <span className="text-[var(--text-secondary)]">Loading requests...</span>
        </div>
      </div>
    );
  }

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
                  <option key={statusKey} value={statusKey}>{statusMap[statusKey]?.label || statusKey}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" /></svg>
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
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" /></svg>
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
                  Rule Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Severity
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
                const statusData = statusMap[request.status] || { label: request.status, color: 'text-gray-400', bg: 'bg-gray-600/20', icon: AlertCircle };
                const severityData = severityMap[request.suggested_severity] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20' };
                const StatusIcon = statusData.icon;

                return (
                  <tr
                    key={request._id}
                    onClick={() => onRowClick(request)}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-[var(--foreground)] group-hover:text-[var(--brand-yellow)]">
                      {request.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", severityData.bg, severityData.color)}>
                        {severityData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1", statusData.bg, statusData.color)}>
                        {StatusIcon && <StatusIcon size={14} />} {statusData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
  const router = useRouter();
  const [ruleRequests, setRuleRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for 'Pending Review' table
  const [prSearchTerm, setPrSearchTerm] = useState('');
  const [prFilterSeverity, setPrFilterSeverity] = useState('all');
  const [prSortOrder, setPrSortOrder] = useState('desc');

  // States for 'Ready for Testing' table
  const [rtSearchTerm, setRtSearchTerm] = useState('');
  const [rtFilterSeverity, setRtFilterSeverity] = useState('all');
  const [rtSortOrder, setRtSortOrder] = useState('desc');

  // States for 'Complete List' table
  const [clSearchTerm, setClSearchTerm] = useState('');
  const [clFilterStatus, setClFilterStatus] = useState('all');
  const [clFilterSeverity, setClFilterSeverity] = useState('all');
  const [clSortOrder, setClSortOrder] = useState('desc');

  // Fetch rule requests from API
  useEffect(() => {
    fetchRuleRequests();
  }, []);

  // Start Testing handler for modal
  // Pass error to modal via callback
  const handleStartTesting = async (requestId, setModalError) => {
    try {
      const response = await fetch('/api/custom-rule-request-start-test', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          requestStatus: 'Being Tested',
        }),
      });
      if (response.ok) {
        // Redirect to testing-workspace with requestId as URL param
        router.push(`/testing-workspace?requestId=${requestId}`);
      } else {
        const errorData = await response.json();
        if (setModalError) setModalError(errorData.error || 'Failed to start testing.');
      }
    } catch (error) {
      if (setModalError) setModalError(error.message);
    }
  };

  const fetchRuleRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/custom-rule-request', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Populate assigned_developer data if it exists
        const requestsWithPopulatedDevelopers = data.requests?.map(request => {
          if (request.assigned_developer && typeof request.assigned_developer === 'string') {
            // If assigned_developer is just an ID, we might need to fetch the developer data
            // For now, we'll just return the request as-is since the modal will handle population
            return request;
          }
          return request;
        }) || [];

        setRuleRequests(requestsWithPopulatedDevelopers);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rule requests');
      }
    } catch (error) {
      console.error('Error fetching rule requests:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingReviewRequests = useMemo(() => {
    return ruleRequests.filter(req => req.status === 'Pending Review');
  }, [ruleRequests]);

  const readyForTestingRequests = useMemo(() => {
    return ruleRequests.filter(req => req.status === 'Ready for Testing');
  }, [ruleRequests]);

  const openModal = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const handleStatusUpdate = async (requestId, status, developerId = null, rejectedReason = null) => {
    try {
      const response = await fetch('/api/custom-rule-request', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status,
          developerId,
          rejected_reason: rejectedReason
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the list to get updated data
        await fetchRuleRequests();
        closeModal();
        return { success: true, data };
      } else {
        const errorMessage = data.details || data.error || 'Failed to update status';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating rule status:', error);
      return { success: false, error: error.message };
    }
  };

  if (error) {
    return (
      <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen flex items-center justify-center`}>
        <div className="text-center text-red-400">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Requests</h2>
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={fetchRuleRequests}
            className="bg-[var(--brand-yellow)] text-[var(--background)] px-6 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Custom Rule Requests</h1>

      {/* Pending Review Rules Table */}
      <RuleRequestsTable
        title="Pending Review Requests"
        requests={pendingReviewRequests}
        searchTerm={prSearchTerm}
        setSearchTerm={setPrSearchTerm}
        filterSeverity={prFilterSeverity}
        setFilterSeverity={setPrFilterSeverity}
        sortOrder={prSortOrder}
        setSortOrder={setPrSortOrder}
        onRowClick={openModal}
        showStatusFilter={false}
        availableStatuses={['Pending Review']}
        isLoading={isLoading}
      />

      <div className="my-10 border-t border-[var(--border-input)]"></div>

      {/* Ready for Testing Rules Table */}
      <RuleRequestsTable
        title="Ready for Testing Requests"
        requests={readyForTestingRequests}
        searchTerm={rtSearchTerm}
        setSearchTerm={setRtSearchTerm}
        filterSeverity={rtFilterSeverity}
        setFilterSeverity={setRtFilterSeverity}
        sortOrder={rtSortOrder}
        setSortOrder={setRtSortOrder}
        onRowClick={openModal}
        showStatusFilter={false}
        availableStatuses={['Ready for Testing']}
        isLoading={isLoading}
      />

      <div className="my-10 border-t border-[var(--border-input)]"></div>

      {/* Complete List of Rule Requests Table */}
      <RuleRequestsTable
        title="All Rule Requests"
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
        availableStatuses={Object.keys(statusMap)}
        isLoading={isLoading}
      />

      {/* Rule Request Detail Modal */}
      {selectedRequest && (
        <RuleRequestDetailModal
          request={selectedRequest}
          onClose={closeModal}
          onUpdateStatus={handleStatusUpdate}
          onStartTesting={handleStartTesting}
        />
      )}
    </div>
  );
}