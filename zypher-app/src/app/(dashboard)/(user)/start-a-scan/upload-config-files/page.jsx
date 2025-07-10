// src/app/dashboard/(user)/upload-config-files/page.js
"use client";

import { useState } from "react";
import { Upload, Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

// This component is now designed to be rendered within another page.
// It no longer needs its own 'main' tag or 'Head' component.
export default function UploadConfigPageContent() { // Renamed export
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // 'success', 'failure', or null

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      setFiles(prev => [...prev, newFile]);
      setSelectedFile(newFile); // Automatically select the newly added file
      setScanResult(null); // Reset scan result when a new file is added
      e.target.value = null; // Clear input so same file can be selected again if needed
    }
  };

  const handleScan = () => {
    if (!selectedFile) return;

    setScanning(true);
    setScanResult(null); // Clear previous result

    // Simulate API call with a random success/failure
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% chance of success for demo
      setScanning(false);
      setScanResult(isSuccess ? 'success' : 'failure');
      // In a real app, you'd process the file and display detailed results
    }, 2500); // Shorter scan time for better UX
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setScanResult(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 flex-grow"> {/* Removed overall padding, it's handled by parent */}

      {/* LEFT SIDEBAR - File List & Upload */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-[var(--border-input)] rounded-lg p-6 bg-[var(--input-bg)] shadow-xl flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Files Added</h2>

        {files.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-[var(--text-secondary)] mb-6 py-8 border border-dashed border-[var(--border-input)] rounded-md">
            <Upload size={32} className="mb-3 text-[var(--text-secondary)]" />
            <p>Upload a file to get started</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar mb-6">
            <ul className="space-y-3">
              {files.map((file, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      setSelectedFile(file);
                      setScanResult(null);
                    }}
                    className={`relative w-full text-left px-4 py-3 rounded-md transition-all duration-200 ease-in-out
                                flex items-center justify-between group
                                ${selectedFile === file
                                    ? "bg-[var(--brand-yellow)] text-[var(--background)] font-medium shadow-md"
                                    : "bg-[var(--button-bg)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] text-[var(--foreground)]"
                                }`}
                  >
                    <span className="flex items-center gap-3">
                      <FileText size={20} className={selectedFile === file ? "text-[var(--background)]" : "text-[var(--text-secondary)] group-hover:text-[var(--brand-yellow)]"} />
                      <span className="truncate">{file.name}</span>
                    </span>
                    {selectedFile === file && (
                       <CheckCircle size={20} className="text-[var(--background)]" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Button */}
        <label className="inline-flex items-center justify-center bg-[var(--brand-yellow)] text-[var(--background)] rounded-full px-6 py-3 cursor-pointer font-bold transition hover:brightness-110 shadow-lg text-lg">
          {files.length === 0 ? "Upload File" : "Add More Files"}
          <Upload className="ml-3 w-5 h-5" />
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* RIGHT PANEL - Scan Area & Results */}
      <div className="flex-1 flex flex-col rounded-lg bg-[var(--input-bg)] shadow-xl p-8 items-center justify-center relative min-h-[400px]">
        {!selectedFile && files.length > 0 && (
          <div className="text-center text-[var(--text-secondary)] animate-fadeIn">
            <p className="text-xl mb-4">Please select a file from the left to start scanning.</p>
            <FileText size={48} className="mx-auto opacity-70" />
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] animate-fadeIn">
            <p className="text-xl mb-4">No files uploaded yet.</p>
            <p>Use the "Upload File" button to begin.</p>
            <Upload size={48} className="mt-4 mx-auto opacity-70" />
          </div>
        )}

        {selectedFile && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            {scanning ? (
              <div className="flex flex-col items-center gap-6 text-[var(--brand-yellow)] animate-pulse-slow">
                <Loader2 className="w-16 h-16 animate-spin" />
                <p className="text-xl font-semibold">Scanning {selectedFile.name}...</p>
                <p className="text-sm text-[var(--text-secondary)]">This might take a moment.</p>
              </div>
            ) : scanResult ? (
              <div className="text-center w-full px-4 animate-fadeIn">
                {scanResult === 'success' ? (
                  <div className="text-[var(--brand-yellow)]">
                    <CheckCircle size={80} className="mx-auto mb-6 drop-shadow-lg" />
                    <h3 className="text-3xl font-bold mb-3">Scan Complete!</h3>
                    <p className="text-lg text-[var(--text-secondary)] mb-6">
                      No critical issues found in <span className="font-semibold text-[var(--foreground)]">{selectedFile.name}</span>.
                    </p>
                    <button
                      onClick={clearSelectedFile}
                      className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] font-semibold px-8 py-3 rounded-full hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] transition shadow-md"
                    >
                      Scan Another File
                    </button>
                  </div>
                ) : (
                  <div className="text-red-500">
                    <XCircle size={80} className="mx-auto mb-6 drop-shadow-lg" />
                    <h3 className="text-3xl font-bold mb-3">Scan Failed!</h3>
                    <p className="text-lg text-[var(--text-secondary)] mb-6">
                      Issues detected in <span className="font-semibold text-[var(--foreground)]">{selectedFile.name}</span>.
                      Please review the details. (This is a placeholder)
                    </p>
                    <button
                      onClick={clearSelectedFile}
                      className="bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] font-semibold px-8 py-3 rounded-full hover:border-red-500 hover:text-red-500 transition shadow-md"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 animate-fadeIn">
                <p className="text-2xl font-semibold text-[var(--foreground)]">{selectedFile.name}</p>
                <FileText size={60} className="text-[var(--text-secondary)]" />
                <p className="text-lg text-[var(--text-secondary)]">Ready to analyze your file?</p>
                <button
                  onClick={handleScan}
                  className="bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition shadow-lg text-lg"
                  disabled={scanning}
                >
                  {scanning ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    'Start Scan'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}