"use client";

import { useEffect, useState } from 'react';
import FileScanCard from "@/components/FileScanCard";
import RepoScanCard from "@/components/RepoScanCard";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import { Lexend } from 'next/font/google';
import { useRouter } from 'next/navigation';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function StartScanPage() {
  const [recentScans, setRecentScans] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPastScanData = async () => {
      try {
        const res = await fetch('/api/scan-results', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch scan results.');

        const fileScans = (data.pastFileScanResults || []).map(scan => ({
          id: scan._id,
          type: 'file',
          createdAt: scan.createdAt,
          filename: scan.filename,
          vulnerabilityFindings: scan.vulnerabilityScan?.stats?.total_findings || 0,
          bestPracticeFindings: scan.bestPracticesScan?.stats?.total_findings || 0,
          risk : scan.vulnerabilityScan.stats.risk_factor
        }));

        const repoScans = (data.pastRepoScanResults || []).map(scan => ({
          id: scan._id,
          type: 'repo',
          createdAt: scan.createdAt,
          repoUrl: scan.repo_url,
          vulnerabilityFindings: scan.vulnerabilityScan?.stats?.total_findings || 0,
          bestPracticeFindings: scan.bestPracticesScan?.stats?.total_findings || 0,
          risk : scan.vulnerabilityScan.stats.risk_factor
        }));

        const combined = [...fileScans, ...repoScans]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);

        setRecentScans(combined);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPastScanData();
  }, []);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen`}>
      <div className="animate-fadeInUp">
        <div className="text-center bg-[var(--input-bg)] p-8 md:p-12 rounded-3xl mb-12 shadow-xl border border-[var(--border-input)]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--foreground)]">
            Proactive security for your configuration files
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Upload your configuration files or paste a repository URL to instantly scan for vulnerabilities and best practice violations.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <button
              onClick={() => router.push('/start-a-scan/upload-config-files')}
              className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1"
            >
              Upload Configuration Files <UploadCloud size={20} />
            </button>
            <button
              onClick={() => router.push('/start-a-scan/paste-url')}
              className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1"
            >
              Paste Repository URL <LinkIcon size={20} />
            </button>
          </div>
        </div>

        {/* Recent Scans Section */}
        <div className="animate-fadeInUp delay-200">
          <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Recent Scans</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentScans.map((scan, index) => {
              const date = formatDateTime(scan.createdAt);
              if (scan.type === 'file') {
                return (
                  <FileScanCard
                    key={index}
                    filename={scan.filename}
                    date={date}
                    scanDataId={scan.id}
                    vulnerabilityFindings={scan.vulnerabilityFindings}
                    bestPracticeFindings={scan.bestPracticeFindings}
                    risk={scan.risk}
                  />
                );
              } else {
                return (
                  <RepoScanCard
                    key={index}
                    repoUrl={scan.repoUrl}
                    date={date}
                    scanDataId={scan.id}
                    vulnerabilityFindings={scan.vulnerabilityFindings}
                    bestPracticeFindings={scan.bestPracticeFindings}
                    risk={scan.risk}
                  />
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
