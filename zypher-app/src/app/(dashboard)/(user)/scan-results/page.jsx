"use client";

import { useEffect, useState, useMemo } from 'react';
import { Search, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import RepoScanCard from '@/components/RepoScanCard';
import FileScanCard from '@/components/FileScanCard';
import { Lexend } from 'next/font/google';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function ScanResultsPage() {
  const [allScans, setAllScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'LOW', 'MEDIUM', 'CRITICAL'
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch('/api/scan-results');
        const data = await res.json();

        const fileScans = (data.pastFileScanResults || []).map(scan => ({
          id: scan._id,
          type: 'file',
          createdAt: scan.createdAt,
          filename: scan.filename,
          vulnerabilityFindings: scan.vulnerabilityScan?.stats?.total_findings || 0,
          bestPracticeFindings: scan.bestPracticesScan?.stats?.total_findings || 0,
          risk: scan.vulnerabilityScan?.stats?.risk_factor || "LOW"
        }));

        const repoScans = (data.pastRepoScanResults || []).map(scan => ({
          id: scan._id,
          type: 'repo',
          createdAt: scan.createdAt,
          repoUrl: scan.repo_url,
          vulnerabilityFindings: scan.vulnerabilityScan?.stats?.total_findings || 0,
          bestPracticeFindings: scan.bestPracticesScan?.stats?.total_findings || 0,
          risk: scan.vulnerabilityScan?.stats?.risk_factor || 'N/A',
        }));

        const combined = [...fileScans, ...repoScans];
        setAllScans(combined);
      } catch (err) {
        console.error('Failed to load scan results:', err);
      }
    };
    fetchScans();
  }, []);

  const filteredScans = useMemo(() => {
    let filtered = [...allScans];

    if (searchTerm) {
      filtered = filtered.filter(scan =>
        (scan.filename || scan.repoUrl || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(scan => scan.risk === filterStatus);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allScans, searchTerm, filterStatus, sortOrder]);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className={`p-2 md:p-8 lg:p-4 ${lexend.className} animate-fadeInUp`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Scan Results</h1>

      {/* Search + Filter Bar */}
      <div className="bg-[var(--input-bg)] p-6 rounded-xl mb-8 shadow-md border border-[var(--border-input)] flex flex-col md:flex-row gap-4 md:gap-6 items-center">
        {/* Search */}
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="text"
            placeholder="Search scans by filename or repo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-3 px-4 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] px-4 py-3 rounded-lg hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)]"
        >
          {sortOrder === 'desc' ? (
            <>Oldest <ArrowUpWideNarrow size={18} /></>
          ) : (
            <>Newest <ArrowDownWideNarrow size={18} /></>
          )}
        </button>
      </div>

      {/* Scan Grid */}
      {filteredScans.length === 0 ? (
        <p className="text-center text-[var(--text-secondary)] p-10 bg-[var(--input-bg)] rounded-xl">
          No matching scan results found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredScans.map((scan, index) => {
            const date = formatDateTime(scan.createdAt);
            return scan.type === 'file' ? (
              <FileScanCard
                key={scan.id}
                filename={scan.filename}
                date={date}
                scanDataId={scan.id}
                vulnerabilityFindings={scan.vulnerabilityFindings}
                bestPracticeFindings={scan.bestPracticeFindings}
                risk={scan.risk}
              />
            ) : (
              <RepoScanCard
                key={scan.id}
                repoUrl={scan.repoUrl}
                date={date}
                scanDataId={scan.id}
                vulnerabilityFindings={scan.vulnerabilityFindings}
                bestPracticeFindings={scan.bestPracticeFindings}
                risk={scan.risk}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
