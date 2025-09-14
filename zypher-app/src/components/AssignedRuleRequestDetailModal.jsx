import React from 'react';
import clsx from 'clsx';
import {
  X, 
  CheckCircle, 
  XCircle, 
  FlaskConical, 
  Code, 
  Hourglass, 
  BookOpen, 
  UserCheck, 
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

const statusMap = {
  'Pending Review': { label: 'Pending Review', color: 'text-blue-400', bg: 'bg-blue-600/20', icon: Hourglass },
  'Assigned': { label: 'Assigned to Developer', color: 'text-indigo-400', bg: 'bg-indigo-600/20', icon: UserCheck },
  'Under Development': { label: 'Under Development', color: 'text-purple-400', bg: 'bg-purple-600/20', icon: Code },
  'Under Modification': { label: 'Modifications Requested', color: 'text-amber-500', bg: 'bg-amber-600/20', icon: AlertCircle },
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

const AssignedRuleRequestDetailModal = ({ request, onClose, onStartDeveloping, onGoToDevelopmentWorkspace }) => {
  if (!request) return null;

  const statusData = statusMap[request.status] || { label: request.status, color: 'text-gray-400', bg: 'bg-gray-600/20', icon: AlertCircle };
  const severityData = severityMap[request.suggested_severity] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20' };
  const StatusIcon = statusData.icon;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canStartDeveloping = request.status === 'Assigned';
  const needsModification = request.status === 'Under Modification';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-[var(--background)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn border border-[var(--border-input)]">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-input)]">
          <h3 className="text-2xl font-bold text-[var(--foreground)]">{request.name}</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-[var(--foreground)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Request ID:</p>
              <p className="font-medium text-[var(--brand-yellow)] text-sm">{request._id}</p>
            </div>
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
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                {request.status === 'Under Modification' ? 'Modification Feedback:' : 'Rejection Reason:'}
              </p>
              <div className={`p-4 rounded-md text-sm border ${
                request.status === 'Under Modification' 
                  ? 'bg-amber-600/20 border-amber-600/30 text-amber-200' 
                  : 'bg-red-600/20 border-red-600/30 text-red-300'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>{request.rejected_reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            {canStartDeveloping && (
              <button
                onClick={() => onStartDeveloping(request._id)}
                className="bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1 w-full flex items-center justify-center gap-3"
              >
                <Code size={20} />
                Start Developing
              </button>
            )}

            {needsModification && (
              <button
                onClick={() => onGoToDevelopmentWorkspace(request._id)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1 w-full flex items-center justify-center gap-3"
              >
                <Code size={20} />
                Go to Development Workspace
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold py-2 px-4 rounded-md w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedRuleRequestDetailModal;
