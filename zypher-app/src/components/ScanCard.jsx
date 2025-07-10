"use client";

import { FileText, ArrowRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react"; 
import Link from "next/link";
import clsx from "clsx";

export default function ScanCard({ fileName, description, date, status }) {

  const statusInfo = {
    completed: { icon: CheckCircle, color: "text-green-400", label: "Completed" },
    warnings: { icon: AlertTriangle, color: "text-yellow-400", label: "Warnings" },
    failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  };

  const currentStatus = statusInfo[status] || { icon: FileText, color: "text-[var(--text-secondary)]", label: status };
  const StatusIcon = currentStatus.icon;


  const detailsHref = `/dashboard/(user)/scan-results/${fileName.replace(".yml", "").replace(".json", "").replace(/\s/g, '-')}`;

  return (
    <Link href={detailsHref} className="block">
      <div className="relative rounded-2xl border border-[var(--border-input)] p-6 bg-[var(--input-bg)] overflow-hidden
                      hover:shadow-xl hover:border-[var(--brand-yellow)] transform hover:-translate-y-1 transition-all duration-300 group">
    
        <div
          className="absolute inset-0 bg-gradient-to-br from-[rgba(252,232,3,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <div className="relative z-10 flex flex-col h-full"> 
          <div className="text-xs text-[var(--text-secondary)] mb-2">{date}</div> 

          <div className="flex items-center gap-3 mb-3"> 
            <FileText size={20} className="text-[var(--foreground)]" /> 
            <h3 className="font-semibold text-lg text-[var(--foreground)] truncate">{fileName}</h3> 
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-4 flex-grow">{description}</p> 

          <div className="flex justify-between items-end mt-auto"> 
            <div className={clsx("flex items-center gap-2 text-sm font-medium", currentStatus.color)}>
              <StatusIcon size={16} /> 
              <span>{currentStatus.label}</span>
            </div>
            <span className="text-[var(--brand-yellow)] text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              View Results <ArrowRight size={16} /> 
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}