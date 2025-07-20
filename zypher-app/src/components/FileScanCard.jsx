"use client";

import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FileScanCard({ filename, date, scanDataId, vulnerabilityFindings, bestPracticeFindings }) {
  const href = `/scan-results/${scanDataId}`;

  return (
    <Link href={href} className="block">
      <div className="rounded-2xl border border-[var(--border-input)] p-6 bg-[var(--input-bg)] hover:shadow-xl hover:border-[var(--brand-yellow)] transform hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(252,232,3,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="text-xs text-[var(--text-secondary)] mb-2">{date}</div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} className="text-[var(--foreground)]" />
            <h3 className="font-semibold text-lg text-[var(--foreground)] truncate">{filename}</h3>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Vulnerabilities: <strong>{vulnerabilityFindings}</strong>, Best Practice Suggestions: <strong>{bestPracticeFindings}</strong>
          </p>

          <div className="text-[var(--brand-yellow)] text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
            View Results <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
