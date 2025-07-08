"use client";

import {
ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FolderDot, 
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function ScanResultCard({ scan }) {

  const statusInfo = {
    completed: { icon: CheckCircle, color: "text-green-400", label: "Completed" },
    warnings: { icon: AlertTriangle, color: "text-yellow-400", label: "Warnings" },
    failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  };

  const currentStatus = statusInfo[scan.overallStatus] || { icon: FileText, color: "text-[var(--text-secondary)]", label: scan.overallStatus };
  const StatusIcon = currentStatus.icon;

  const PrimaryIcon = scan.type === 'paste-url' ? FolderDot : FileText; 

  return (
    <Link href={`/dashboard/(user)/scan-results/${scan.id}`} className="block h-full"> 
      <div className="relative rounded-2xl border border-[var(--border-input)] p-6 bg-[var(--input-bg)] overflow-hidden h-full flex flex-col justify-between
                      hover:shadow-xl hover:border-[var(--brand-yellow)] transform hover:-translate-y-1 transition-all duration-300 group">

        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(252,232,3,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Date & Time */}
          <div className="text-xs text-[var(--text-secondary)] mb-2">
            {scan.date} at {scan.time}
          </div>

          {/* Scan Name/File Name & Primary Icon */}
          <div className="flex items-center gap-3 mb-3">
            <PrimaryIcon size={20} className="text-[var(--foreground)]" />
            <h3 className="font-semibold text-lg text-[var(--foreground)] truncate">
              {scan.scanName || scan.fileName}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)] mb-4 flex-grow">
            {scan.description}
          </p>

          {/* Status and Hover Arrow */}
          <div className="flex justify-between items-end mt-auto">
            <div className={clsx("flex items-center gap-2 text-sm font-medium", currentStatus.color)}>
              <StatusIcon size={16} />
              <span>{currentStatus.label}</span>
            </div>
            <ArrowRight size={16} className="text-[var(--brand-yellow)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}