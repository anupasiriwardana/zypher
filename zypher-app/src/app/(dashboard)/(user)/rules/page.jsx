// src/app/dashboard/(user)/(rules)/page.js
"use client";

import { useState } from 'react';
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
} from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});


const dummyRequestedRules = [
  {
    id: "cr-001",
    name: "Disallow Hardcoded DB Credentials",
    status: "published",
    submittedDate: "2025-06-15",
    briefDescription: "Identifies hardcoded database credentials in YAML config files to prevent security leaks.",
  },
  {
    id: "cr-002",
    name: "Enforce HTTPS for Ingress",
    status: "being-developed",
    submittedDate: "2025-06-20",
    briefDescription: "Ensures all Kubernetes Ingress resources enforce HTTPS redirection for secure communication.",
  },
  {
    id: "cr-003",
    name: "Restrict Wildcard Permissions in IAM",
    status: "pending-review",
    submittedDate: "2025-06-28",
    briefDescription: "Flags AWS IAM policies that grant excessive '*' permissions on critical resources.",
  },
  {
    id: "cr-004",
    name: "No Public S3 Buckets in IaC",
    status: "being-tested",
    submittedDate: "2025-07-01",
    briefDescription: "Checks for publicly accessible AWS S3 buckets defined in Terraform or CloudFormation templates.",
  },
  {
    id: "cr-005",
    name: "Require Image Digests in Deployments",
    status: "published",
    submittedDate: "2025-07-05",
    briefDescription: "Verifies Docker image references use digests instead of mutable tags in Kubernetes deployments.",
  },
  {
    id: "cr-006",
    name: "Deny Root User Execution in Containers",
    status: "pending-review",
    submittedDate: "2025-07-07",
    briefDescription: "Flags Dockerfiles or Kubernetes manifests that allow container processes to run as root.",
  },
];


const statusMap = {
  'pending-review': { label: 'Pending Review', color: 'text-blue-400', bg: 'bg-blue-600/20', icon: Hourglass },
  'being-developed': { label: 'Being Developed', color: 'text-purple-400', bg: 'bg-purple-600/20', icon: Code },
  'being-tested': { label: 'Being Tested', color: 'text-orange-400', bg: 'bg-orange-600/20', icon: FlaskConical },
  'published': { label: 'Successfully Published', color: 'text-green-400', bg: 'bg-green-600/20', icon: BookOpen },
};

export default function RulesPage() {

  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [targetFileTypes, setTargetFileTypes] = useState('');
  const [exampleCode, setExampleCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null); 

  const handleSubmitRule = async (e) => {
    e.preventDefault();
    setSubmissionFeedback(null);

    // Basic validation
    if (!ruleName.trim() || !description.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Rule Name and Description are required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to submit the rule request
      console.log('Submitting custom rule:', {
        ruleName, description, severity, targetFileTypes, exampleCode
      });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Simulate a success or failure
      const success = Math.random() > 0.1; // 90% success rate for demo
      if (success) {
        setSubmissionFeedback({ type: 'success', message: 'Rule request submitted successfully! Our team will review it shortly.' });
        // Clear form fields
        setRuleName('');
        setDescription('');
        setSeverity('medium');
        setTargetFileTypes('');
        setExampleCode('');
      } else {
        throw new Error('Failed to submit rule request. Please try again.');
      }
    } catch (error) {
      setSubmissionFeedback({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Custom Rule Development</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Custom Rule Submission Form */}
        <div className="w-full lg:w-1/2 bg-[var(--input-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-input)]">
          <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Propose a New Rule or Best Practice</h2>
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

            {/* Severity & Target File Types (Flex row for alignment) */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Severity */}
              <div className="w-full sm:w-1/2">
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
                    <option value="informational">Informational</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                  </div>
                </div>
              </div>

              {/* Target File Types */}
              <div className="w-full sm:w-1/2">
                <label htmlFor="fileTypes" className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <FileType size={16} /> Target File Types
                </label>
                <input
                  type="text"
                  id="fileTypes"
                  value={targetFileTypes}
                  onChange={(e) => setTargetFileTypes(e.target.value)}
                  placeholder="e.g., .yml, .json, Dockerfile"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                />
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
                  Publish to be Developed <Send size={20} />
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
            {dummyRequestedRules.map((rule) => {
              const statusInfo = statusMap[rule.status] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-600/20', icon: null };
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={rule.id}
                  className="bg-[var(--background)] p-5 rounded-lg border border-[var(--border-input)] hover:border-[var(--brand-yellow)] transition-all duration-200 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{rule.name}</h3>
                    <span className={clsx("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1", statusInfo.bg, statusInfo.color)}>
                      {StatusIcon && <StatusIcon size={14} />} {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{rule.briefDescription}</p>
                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <CalendarDays size={12} /> Submitted: {rule.submittedDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}