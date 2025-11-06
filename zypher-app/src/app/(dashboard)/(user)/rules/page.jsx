"use client";

import { useState, useEffect } from 'react';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import {
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  FlaskConical, 
  Code, 
  Hourglass, 
  BookOpen, 
  Hash, 
  AlignLeft, 
  ServerCog, 
  SlidersHorizontal, 
  CalendarDays,
  UserCheck,
  ClipboardCheck,
  Search,        // 🔍 Added search icon
  Filter         // 🔽 Filter icon
} from 'lucide-react';

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

export default function RulesPage() {
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [exampleCode, setExampleCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [userActivityStatus, setUserActivityStatus] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 🔍 Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUserActivity();
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await fetch('/api/custom-rule-request');
      if (response.ok) {
        const data = await response.json();
        setUserRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching custom rule requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchUserActivity = async () => {
    try {
      const response = await fetch('/api/user-activity', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setUserActivityStatus(data.data || null);
        // If user is not allowed to request custom rules, prompt to upgrade
        if (data?.data && data.data.allowCustomRuleRequests === false) {
          setShowUpgradeModal(true);
        }
      } else {
        console.error('Failed to fetch user activity');
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const handleSubmitRule = async (e) => {
    e.preventDefault();
    setSubmissionFeedback(null);

    if (!ruleName.trim() || !description.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Rule Name and Description are required.' });
      return;
    }

    if(userActivityStatus && userActivityStatus.allowCustomRuleRequests === false){
      setShowUpgradeModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/custom-rule-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_name: ruleName,
          rule_description: description,
          suggested_severity: severity,
          sample_code: exampleCode
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmissionFeedback({
          type: 'success',
          message: 'Rule request submitted successfully! Our team will review it shortly.'
        });
        setTimeout(() => setSubmissionFeedback(null), 5000);
        setRuleName('');
        setDescription('');
        setSeverity('medium');
        setExampleCode('');
        fetchUserRequests();
      } else {
        throw new Error(data.error || 'Failed to submit rule request.');
      }
    } catch (error) {
      setSubmissionFeedback({ type: 'error', message: error.message });
      setTimeout(() => setSubmissionFeedback(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  // 🔍 Filter and search logic
  const filteredRequests = userRequests.filter((rule) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-[var(--background)] p-6 rounded-xl shadow-xl border border-[var(--border-input)] max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Please upgrade your plan</h3>
            <p className="text-[var(--text-secondary)] mb-5">Custom rule requests are not available on your current plan.</p>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-[var(--brand-yellow)] text-[var(--background)] font-bold hover:brightness-110 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Custom Rule Development</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 bg-[var(--input-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-input)] flex flex-col justify-between min-h-[80vh]">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Request a New Rule or Best Practice</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Got a specific vulnerability or best practice you'd like us to add? Describe it here and our rule developers will review your request.
            </p>

            <form onSubmit={handleSubmitRule} className="space-y-6">
              {/* Rule Name */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Hash size={16} /> Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g., Disallow Hardcoded API Keys"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <AlignLeft size={16} /> Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the vulnerability or best practice..."
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <SlidersHorizontal size={16} /> Suggested Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-input)] py-3 px-4 rounded-lg"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Informational</option>
                </select>
              </div>

              {/* Example Code */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <ServerCog size={16} /> Example Code (Optional)
                </label>
                <textarea
                  rows="6"
                  value={exampleCode}
                  onChange={(e) => setExampleCode(e.target.value)}
                  placeholder="Paste an example code snippet..."
                  className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)]"
                />
              </div>

              {/* Feedback */}
              {submissionFeedback && (
                <div className={clsx(
                  "p-3 rounded-lg text-sm mb-4 flex items-center justify-center gap-2",
                  submissionFeedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                )}>
                  {submissionFeedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{submissionFeedback.message}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1"
              >
                {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <>Submit <Send size={20} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-[var(--input-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-input)] flex flex-col min-h-[80vh]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Your Requested Custom Rules</h2>
            {/* 🔍 Search + Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-[var(--text-secondary)]" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-[var(--text-secondary)]" size={16} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-sm"
                >
                  <option value="all">All</option>
                  {Object.keys(statusMap).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p className="text-[var(--text-secondary)] mb-4">Track the status of your rule submissions.</p>

          {/* Scrollable container */}
          <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '100vh' }}>
            {isLoadingRequests ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-[var(--brand-yellow)]" />
                <span className="ml-2 text-[var(--text-secondary)]">Loading your requests...</span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>No custom rule requests found.</p>
              </div>
            ) : (
              filteredRequests.map((rule) => {
                const statusInfo = statusMap[rule.status] || { label: rule.status, color: 'text-gray-400', bg: 'bg-gray-600/20', icon: null };
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={rule._id} className="bg-[var(--background)] p-5 rounded-lg border border-[var(--border-input)] hover:border-[var(--brand-yellow)] transition-all duration-200 shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{rule.name}</h3>
                      <span className={clsx("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1", statusInfo.bg, statusInfo.color)}>
                        {StatusIcon && <StatusIcon size={14} />} {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">{rule.description}</p>
                    {rule.suggested_severity && (
                      <div className="text-xs text-[var(--text-secondary)] mb-2">
                        Severity: <span className="font-medium capitalize">{rule.suggested_severity}</span>
                      </div>
                    )}
                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <CalendarDays size={12} /> Submitted: {formatDate(rule.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
