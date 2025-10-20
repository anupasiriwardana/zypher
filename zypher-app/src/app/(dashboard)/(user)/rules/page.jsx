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
  FileType, 
  CalendarDays,
  UserCheck,        // For Assigned status
  ClipboardCheck,   // For Ready for Testing status
} from 'lucide-react';
import {session} from "next-auth";
const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const statusMap = {
  'Pending Review': {
    label: 'Pending Review',
    color: 'text-blue-400',
    bg: 'bg-blue-600/20',
    icon: Hourglass
  },
  'Assigned': {
    label: 'Assigned to Developer',
    color: 'text-indigo-400',
    bg: 'bg-indigo-600/20',
    icon: UserCheck
  },
  'Under Development': {
    label: 'Under Development',
    color: 'text-purple-400',
    bg: 'bg-purple-600/20',
    icon: Code
  },
  'Ready for Testing': {
    label: 'Ready for Testing',
    color: 'text-amber-400',
    bg: 'bg-amber-600/20',
    icon: ClipboardCheck
  },
  'Being Tested': {
    label: 'Being Tested',
    color: 'text-orange-400',
    bg: 'bg-orange-600/20',
    icon: FlaskConical
  },
  'Approved': {
    label: 'Approved',
    color: 'text-green-400',
    bg: 'bg-green-600/20',
    icon: CheckCircle
  },
  'Successfully Published': {
    label: 'Successfully Published',
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/20',
    icon: BookOpen
  },
  'Rejected': {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-600/20',
    icon: XCircle
  },
};

export default function RulesPage() {
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [targetFileTypes, setTargetFileTypes] = useState('');
  const [exampleCode, setExampleCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [userActivityStatus, setUserActivityStatus] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch user's custom rule requests
  useEffect(() => {
    fetchUserActivity();
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await fetch('/api/custom-rule-request', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRequests(data.requests || []);
      } else {
        console.error('Failed to fetch custom rule requests');
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

    // Basic validation
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Set a timeout to clear the feedback after 5 seconds
        setTimeout(() => {
          setSubmissionFeedback(null);
        }, 5000);
        // Clear form fields
        setRuleName('');
        setDescription('');
        setSeverity('medium');
        setTargetFileTypes('');
        setExampleCode('');
        // Refresh the requests list
        fetchUserRequests();
      } else {
        throw new Error(data.error || 'Failed to submit rule request. Please try again.');
      }
    } catch (error) {
      setSubmissionFeedback({
        type: 'error',
        message: error.message || 'An unexpected error occurred.'
      });
      // Set a timeout to clear the error feedback after 5 seconds
      setTimeout(() => {
        setSubmissionFeedback(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        {/* Left Panel: Custom Rule Submission Form */}
        <div className="w-full lg:w-1/2 bg-[var(--input-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-input)]">
          <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Request a New Rule or Best Practice</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Got a specific vulnerability or best practice you'd like us to add? Describe it here and our rule developers will review your request.
          </p>

          <form onSubmit={handleSubmitRule} className="space-y-6">
            {/* Rule Name */}
            <div>
              <label htmlFor="ruleName" className=" text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Hash size={16} /> Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ruleName"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., Disallow Hardcoded API Keys"
                className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <AlignLeft size={16} /> Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                placeholder="Explain the vulnerability or best practice, why it's important, and its impact."
                className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            {/* Severity */}
            <div className="w-full">
              <label htmlFor="severity" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Suggested Severity
              </label>
              <div className="relative">
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Informational</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" /></svg>
                </div>
              </div>
            </div>

            {/* Example Code */}
            <div>
              <label htmlFor="exampleCode" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <ServerCog size={16} /> Example Code (Optional)
              </label>
              <textarea
                id="exampleCode"
                value={exampleCode}
                onChange={(e) => setExampleCode(e.target.value)}
                rows="6"
                placeholder="Paste an example code snippet (YAML, JSON, etc.) where this rule should ideally trigger."
                className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
                disabled={isSubmitting}
              ></textarea>
            </div>

            {/* Submission Feedback */}
            {submissionFeedback && (
              <div className={clsx(
                "p-3 rounded-lg text-sm mb-4 flex items-center justify-center gap-2",
                submissionFeedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              )}>
                {submissionFeedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span>{submissionFeedback.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit <Send size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: List of Previously Requested Custom Rules */}
        <div className="w-full lg:w-1/2 bg-[var(--input-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-input)]">
          <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Your Requested Custom Rules</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Track the status of rules you've submitted. Our team will update their progress here.
          </p>

          <div className="space-y-4">
            {isLoadingRequests ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-[var(--brand-yellow)]" />
                <span className="ml-2 text-[var(--text-secondary)]">Loading your requests...</span>
              </div>
            ) : userRequests.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>You haven't submitted any custom rule requests yet.</p>
                <p className="text-sm mt-2">Submit your first request using the form on the left!</p>
              </div>
            ) : (
              userRequests.map((rule) => {
                const statusInfo = statusMap[rule.status] || {
                  label: rule.status,
                  color: 'text-gray-400',
                  bg: 'bg-gray-600/20',
                  icon: null
                };
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={rule._id}
                    className="bg-[var(--background)] p-5 rounded-lg border border-[var(--border-input)] hover:border-[var(--brand-yellow)] transition-all duration-200 shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{rule.name}</h3>
                      <span className={clsx("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1", statusInfo.bg, statusInfo.color)}>
                        {StatusIcon && <StatusIcon size={14} />} {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">{rule.description}</p>
                    {rule.suggested_severity && (
                      <div className="text-xs text-[var(--text-secondary)] mb-2">
                        Suggested Severity: <span className="font-medium capitalize">{rule.suggested_severity}</span>
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