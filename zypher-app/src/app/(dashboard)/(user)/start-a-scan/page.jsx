// src/app/dashboard/(user)/start-a-scan/page.js
"use client";

import { useState } from 'react';
import ScanCard from "@/components/ScanCard";
import Link from "next/link";
import { ArrowRight, UploadCloud, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Lexend } from 'next/font/google';


import UploadConfigPageContent from './upload-config-files/page';
import PasteUrlPageContent from './paste-url/page'; 

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const dummyScans = [
  {
    date: "June 7, 2025, 5:42 pm",
    status: "completed",
    fileName: "npm-zypher.yml",
    description: "Defines the CI pipeline for building, testing, and deploying a Node.js app using GitHub Actions.",
  },
  {
    date: "June 7, 2025, 11:56 am",
    status: "warnings",
    fileName: "staging-deploy.yml",
    description: "Handles deployment to staging with approval and rollback.",
  },
  {
    date: "June 2, 2025, 2:42 am",
    status: "completed",
    fileName: "prod-deploy.yml",
    description: "Manages production deployments using Docker and Kubernetes.",
  },
  {
    date: "May 12, 2025, 12:31 pm",
    status: "completed",
    fileName: "test-workflow.yml",
    description: "Runs tests and lint checks in QA pipeline.",
  },
  {
    date: "May 1, 2025, 10:00 am",
    status: "failed",
    fileName: "dev-config.json",
    description: "Development environment configuration with security vulnerabilities.",
  },
];

export default function StartScanPage() {
  // State to manage which content to display: 'default', 'upload', 'paste-url'
  const [currentView, setCurrentView] = useState('default');

  const handleBack = () => {
    setCurrentView('default');
  };

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen`}> 
      {currentView === 'default' && (
        <div className="animate-fadeInUp"> 
        
          <div className="text-center bg-[var(--input-bg)] p-8 md:p-12 rounded-3xl mb-12 shadow-xl border border-[var(--border-input)]">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--foreground)]">
              Proactive security for your config files
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
              Upload your configuration files or paste a repository URL to instantly scan for vulnerabilities and best practice violations.
            </p>

            <div className="flex justify-center gap-6 flex-wrap">

              <button
                onClick={() => setCurrentView('upload')}
                className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1"
              >
                Upload Config Files <UploadCloud size={20} />
              </button>
              <button
                onClick={() => setCurrentView('paste-url')}
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
              {dummyScans.map((scan, index) => (
                <ScanCard key={index} {...scan} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Render UploadConfigPageContent when currentView is 'upload' */}
      {currentView === 'upload' && (
        <div className="animate-fadeInUp"> 
          <button
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={20} /> Back to Scan Options
          </button>
          <UploadConfigPageContent />
        </div>
      )}

      {/* Render PasteUrlPageContent when currentView is 'paste-url' */}
      {currentView === 'paste-url' && (
        <div className="animate-fadeInUp">
          <button
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={20} /> Back to Scan Options
          </button>
          <PasteUrlPageContent />
        </div>
      )}
    </div>
  );
}