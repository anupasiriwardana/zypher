import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import {
  X, User, ChevronsRight, CheckCircle, XCircle, Hourglass,
  Code, FlaskConical, BookOpen, UserCheck, ClipboardCheck, AlertCircle,
  Loader2
} from 'lucide-react';

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

// Add onStartTesting and showActions to props
const RuleRequestDetailModal = ({ request, onClose, onUpdateStatus, onStartTesting, showActions = true }) => {
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [formErrors, setFormErrors] = useState({
    developer: '',
    rejectReason: ''
  });

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (request?.status === 'Pending Review' || request?.status === 'Assigned') {
      fetchDevelopers();
    }
  }, [request]);

  const fetchDevelopers = async () => {
    try {
      setIsLoadingDevelopers(true);
      const response = await fetch('/api/user/rule-developer', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDevelopers(data.rule_developers || []);
        // console.log('Fetched developers:', data.rule_developers);
      } else {
        console.error('Failed to fetch developers');
      }
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setIsLoadingDevelopers(false);
    }
  };

  if (!request) return null;

  const statusData = statusMap[request.status] || { label: request.status, color: 'text-gray-400', bg: 'bg-gray-600/20', icon: AlertCircle };
  const severityData = severityMap[request.suggested_severity] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20' };
  const StatusIcon = statusData.icon;

  const handleAssignDeveloper = useCallback(async () => {
    setFormErrors(prev => ({ ...prev, developer: '' }));

    if (!selectedDeveloper) {
      setFormErrors(prev => ({ ...prev, developer: 'Please select a developer' }));
      return;
    }

    setIsSubmitting(true);
    const result = await onUpdateStatus(request._id, 'Assigned', selectedDeveloper);
    setIsSubmitting(false);

    if (result.success) {
      setSelectedDeveloper('');
    }
  }, [request._id, selectedDeveloper, onUpdateStatus]);

  const handleReject = useCallback(async () => {
    setFormErrors(prev => ({ ...prev, rejectReason: '' }));

    if (!rejectReason.trim()) {
      setFormErrors(prev => ({ ...prev, rejectReason: 'Please provide a rejection reason' }));
      return;
    }

    setIsSubmitting(true);
    const result = await onUpdateStatus(request._id, 'Rejected', null, rejectReason);
    setIsSubmitting(false);

    if (result.success) {
      setRejectReason('');
      setShowRejectForm(false);
    }
  }, [request._id, rejectReason, onUpdateStatus]);

  // Use isSubmitting for button loading state
  const [isStartTesting, setIsStartTesting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
      <div className="bg-[var(--background)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-input)] my-8">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-input)]">
          <h3 className="text-2xl font-bold text-[var(--foreground)]">{request.name}</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-[var(--foreground)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Severity Level:</p>
              <span className={clsx("px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-md", severityData.bg, severityData.color)}>
                {severityData.label}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Current Status:</p>
              <span className={clsx("px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-md items-center gap-1", statusData.bg, statusData.color)}>
                {StatusIcon && <StatusIcon size={16} />} {statusData.label}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Submitted Date:</p>
              <p className="font-medium text-sm">{formatDate(request.createdAt)}</p>
            </div>
            {request.assigned_developer && (
              <div className="md:col-span-2">
                <p className="text-sm text-[var(--text-secondary)]">Assigned Developer:</p>
                <p className="font-medium text-sm">
                  {developers.find(dev => dev._id === request.assigned_developer)?.email || request.assigned_developer.email || 'Unknown Developer'}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-[var(--text-secondary)] mb-2">Description:</p>
            <p className="bg-[var(--input-bg)] p-3 rounded-md text-sm border border-[var(--border-input)]">{request.description}</p>
          </div>

          {request.sample_code && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Example Code:</p>
              <pre className="bg-[var(--input-bg)] p-3 rounded-md text-xs overflow-x-auto border border-[var(--border-input)]">
                <code className="text-[var(--foreground)]">{request.sample_code}</code>
              </pre>
            </div>
          )}

          {request.rejected_reason && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Rejection Reason:</p>
              <p className="bg-red-600/20 p-3 rounded-md text-sm border border-red-600/30 text-red-300">
                {request.rejected_reason}
              </p>
            </div>
          )}

          {/* Action Buttons - only show if showActions is true */}
          {showActions && (
            <div className="mt-8 space-y-4">
              {request.status === 'Pending Review' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <select
                        value={selectedDeveloper}
                        onChange={(e) => setSelectedDeveloper(e.target.value)}
                        className={clsx(
                          "w-full bg-[var(--input-bg)] border text-[var(--foreground)] py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]",
                          formErrors.developer ? "border-red-500" : "border-[var(--border-input)]"
                        )}
                        disabled={isSubmitting || isLoadingDevelopers}
                      >
                        <option value="">Select a developer...</option>
                        {isLoadingDevelopers ? (
                          <option value="" disabled>Loading developers...</option>
                        ) : developers.length === 0 ? (
                          <option value="" disabled>No developers available</option>
                        ) : (
                          developers.map(dev => (
                            <option key={dev._id} value={dev._id}>
                              {dev.email}
                            </option>
                          ))
                        )}
                      </select>
                      {formErrors.developer && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.developer}</p>
                      )}
                    </div>
                    <button
                      onClick={handleAssignDeveloper}
                      disabled={isSubmitting || !selectedDeveloper || isLoadingDevelopers}
                      className="bg-[var(--brand-yellow)] text-black font-semibold py-2 px-4 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                      Assign Developer
                    </button>
                  </div>

                  {!showRejectForm ? (
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 w-full justify-center"
                      disabled={isSubmitting}
                    >
                      <XCircle size={16} /> Reject Request
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 bg-red-600/10 border border-red-600/20 rounded-md">
                      <div>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Please provide a reason for rejection..."
                          className={clsx(
                            "w-full bg-[var(--input-bg)] border text-[var(--foreground)] py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
                            formErrors.rejectReason ? "border-red-500" : "border-[var(--border-input)]"
                          )}
                          rows={3}
                          disabled={isSubmitting}
                        />
                        {formErrors.rejectReason && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.rejectReason}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleReject}
                          disabled={isSubmitting || !rejectReason.trim()}
                          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Reject'}
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md flex-1"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {request.status === 'Ready for Testing' && (
                <>
                  {modalError && (
                    <div className="mb-2 text-red-500 text-sm text-center bg-red-100 rounded p-2">{modalError}</div>
                  )}
                  <button
                    onClick={async () => {
                      setModalError(null);
                      setIsStartTesting(true);
                      await onStartTesting(request._id, setModalError);
                      setIsStartTesting(false);
                    }}
                    disabled={isStartTesting}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 w-full justify-center disabled:opacity-50"
                  >
                    {isStartTesting ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />}
                    Start Testing
                  </button>
                </>
              )}

              {request.status === 'Being Tested' && (
                <button
                  onClick={() => handleStatusUpdate('Approved')}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 w-full justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Approve Rule
                </button>
              )}
            </div>
          )}

          {/* Always show close button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold py-2 px-4 rounded-md w-full disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Avoid SSR/DOM mismatch and ensure we render into body for correct positioning over the viewport
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
};

export default RuleRequestDetailModal;