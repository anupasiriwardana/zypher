// src/app/dashboard/(user)/scan-results/page.js
"use client";

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import ScanResultCard from "@/components/ScanResultCard"; // Import the new card component
import { Lexend } from 'next/font/google';
import clsx from 'clsx';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Dummy Data for Scan Results
const allDummyScans = [
  {
    id: "scan-repo-alpha-123",
    scanName: "Project Alpha Repo Scan",
    type: "paste-url",
    date: "July 5, 2025",
    time: "03:45 pm",
    overallStatus: "warnings",
    description: "Repository scan for the main Project Alpha codebase, detected multiple warnings.",
    files: [ /* detailed file results would be here */ ]
  },
  {
    id: "scan-file-npm-456",
    fileName: "npm-zypher.yml",
    type: "upload-file",
    date: "July 4, 2025",
    time: "10:20 am",
    overallStatus: "completed",
    description: "Single file scan for CI pipeline configuration. No critical issues.",
    files: [ /* single file details here */ ]
  },
  {
    id: "scan-repo-beta-789",
    scanName: "Beta Feature Branch",
    type: "paste-url",
    date: "July 3, 2025",
    time: "09:00 am",
    overallStatus: "failed",
    description: "Full repository scan on new feature branch, critical vulnerabilities found.",
    files: [ /* detailed file results would be here */ ]
  },
  {
    id: "scan-file-staging-101",
    fileName: "staging-deploy.yml",
    type: "upload-file",
    date: "July 2, 2025",
    time: "05:15 pm",
    overallStatus: "completed",
    description: "Deployment script review for staging environment. Passed all checks.",
    files: [ /* single file details here */ ]
  },
  {
    id: "scan-repo-prod-202",
    scanName: "Production Env Config",
    type: "paste-url",
    date: "June 30, 2025",
    time: "11:00 am",
    overallStatus: "completed",
    description: "Audit of production environment configurations. All clear.",
    files: [ /* detailed file results would be here */ ]
  },
  {
    id: "scan-file-dev-303",
    fileName: "dev-secrets.json",
    type: "upload-file",
    date: "June 28, 2025",
    time: "08:30 am",
    overallStatus: "warnings",
    description: "Scan of development secrets file, identified potential leakage.",
    files: [ /* single file details here */ ]
  },
];

export default function ScanResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'warnings', 'failed'
  const [filterType, setFilterType] = useState('all'); // 'all', 'upload-file', 'paste-url'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc' for date

  const filteredAndSortedScans = useMemo(() => {
    let filtered = allDummyScans.filter(scan => {
      const matchesSearch = scan.scanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            scan.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            scan.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || scan.overallStatus === filterStatus;
      const matchesType = filterType === 'all' || scan.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort by date (most recent first by default)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [searchTerm, filterStatus, filterType, sortOrder]);

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Scan Results</h1>

      {/* Search and Filter Bar */}
      <div className="bg-[var(--input-bg)] p-6 rounded-xl mb-8 shadow-md border border-[var(--border-input)] flex flex-col md:flex-row gap-4 md:gap-6 items-center">
        {/* Search Input */}
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="text"
            placeholder="Search scans by name, file, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative flex-grow">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="warnings">Warnings</option>
              <option value="failed">Failed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
            </div>
          </div>

          {/* Type Filter */}
          <div className="relative flex-grow">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="upload-file">Uploaded Files</option>
              <option value="paste-url">Repository URLs</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
            </div>
          </div>

          {/* Sort Order Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] px-4 py-3 rounded-lg hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {sortOrder === 'desc' ? (
              <>Oldest <ArrowUpWideNarrow size={18} /></>
            ) : (
              <>Newest <ArrowDownWideNarrow size={18} /></>
            )}
          </button>
        </div>
      </div>

      {/* Scan Results Grid */}
      {filteredAndSortedScans.length === 0 ? (
        <div className="text-center text-[var(--text-secondary)] p-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)]">
          <p className="text-xl">No scan results found matching your criteria.</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedScans.map((scan) => (
            <ScanResultCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  );
}