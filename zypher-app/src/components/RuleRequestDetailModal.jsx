// the popup of the rows of the table in the rule maintainer view request page
import React, { useCallback } from 'react';
import clsx from 'clsx';
import {
  X, Info, ChevronsRight, EyeOff, CheckCircle, XCircle, Hourglass, Code, FlaskConical, BookOpen 
} from 'lucide-react';

const requestStatusMap = {
  'yet-to-review': { label: 'Yet to Review', color: 'text-blue-400', bg: 'bg-blue-600/20', icon: Hourglass },
  'being-developed': { label: 'Being Developed', color: 'text-purple-400', bg: 'bg-purple-600/20', icon: Code },
  'being-tested': { label: 'Being Tested', color: 'text-orange-400', bg: 'bg-orange-600/20', icon: FlaskConical },
  'to-be-approved': { label: 'To Be Approved', color: 'text-green-400', bg: 'bg-green-600/20', icon: CheckCircle },
  'discarded': { label: 'Discarded', color: 'text-red-400', bg: 'bg-red-600/20', icon: XCircle },
};

const severityMap = {
  'critical': { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/20' },
  'high': { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/20' },
  'medium': { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'low': { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-400/20' },
  'informational': { label: 'Informational', color: 'text-gray-400', bg: 'bg-gray-400/20' },
};


const RuleRequestDetailModal = ({ request, onClose, onUpdateStatus }) => {
  if (!request) return null;

  const statusData = requestStatusMap[request.status] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20', icon: null };
  const severityData = severityMap[request.severity] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20' };
  const StatusIcon = statusData.icon;

  const handleDiscard = useCallback(() => {
    if (window.confirm("Are you sure you want to discard this request?")) {
      onUpdateStatus(request.id, 'discarded', { discardReason: "Discarded by maintainer" });
      onClose();
    }
  }, [request.id, onClose, onUpdateStatus]);

  const handleForwardToDeveloper = useCallback(() => {
    if (window.confirm("Are you sure you want to forward this request to a developer?")) {
      onUpdateStatus(request.id, 'being-developed');
      onClose();
    }
  }, [request.id, onClose, onUpdateStatus]);

  const handleApprove = useCallback(() => {
    if (window.confirm("Are you sure you want to approve this rule?")) {
      onUpdateStatus(request.id, 'approved');
      onClose();
    }
  }, [request.id, onClose, onUpdateStatus]);

  const handleReject = useCallback(() => {
    if (window.confirm("Are you sure you want to reject this rule?")) {
      onUpdateStatus(request.id, 'discarded', { discardReason: "Rejected by maintainer during approval phase." });
      onClose();
    }
  }, [request.id, onClose, onUpdateStatus]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-[var(--background)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn border border-[var(--border-input)]">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-input)]">
          <h3 className="text-2xl font-bold text-[var(--foreground)]">{request.ruleName}</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-[var(--foreground)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Rule ID:</p>
              <p className="font-medium text-[var(--brand-yellow)]">{request.id}</p>
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
              <p className="text-sm text-[var(--text-secondary)]">Target File Types:</p>
              <p className="font-medium">{request.targetFileTypes || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Submitted Date:</p>
              <p className="font-medium">{new Date(request.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-[var(--text-secondary)] mb-2">Description:</p>
            <p className="bg-[var(--input-bg)] p-3 rounded-md text-sm border border-[var(--border-input)]">{request.description}</p>
          </div>

          {request.exampleCode && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Example Code:</p>
              <pre className="bg-[var(--input-bg)] p-3 rounded-md text-xs overflow-x-auto border border-[var(--border-input)]">
                <code className="text-[var(--foreground)]">{request.exampleCode}</code>
              </pre>
            </div>
          )}

          {/* Conditional Notes Display */}
          {request.developerNotes && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Developer Notes:</p>
              <p className="bg-[var(--input-bg)] p-3 rounded-md text-sm border border-[var(--border-input)] text-green-300/80">{request.developerNotes}</p>
            </div>
          )}
          {request.testerNotes && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Tester Notes:</p>
              <p className="bg-[var(--input-bg)] p-3 rounded-md text-sm border border-[var(--border-input)] text-purple-300/80">{request.testerNotes}</p>
            </div>
          )}
          {request.discardReason && (
            <div className="mb-6">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Discard Reason:</p>
              <p className="bg-[var(--input-bg)] p-3 rounded-md text-sm border border-[var(--border-input)] text-red-300/80">{request.discardReason}</p>
            </div>
          )}

          {/* Conditional Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            {request.status === 'yet-to-review' && (
              <>
                <button
                  onClick={handleDiscard}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <EyeOff size={20} /> Discard
                </button>
                <button
                  onClick={handleForwardToDeveloper}
                  className="bg-[var(--brand-yellow)] hover:bg-[#ffe01a] text-black font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <ChevronsRight size={20} /> Forward to Developer
                </button>
              </>
            )}

            {request.status === 'to-be-approved' && (
              <>
                <button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <XCircle size={20} /> Reject Rule
                </button>
                <button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <CheckCircle size={20} /> Approve Rule
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold py-2 px-5 rounded-lg transition-colors duration-200 ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleRequestDetailModal;