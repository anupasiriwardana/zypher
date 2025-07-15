"use client";

import { useState } from "react";
import { Upload, Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";
import * as yaml from 'yaml';

export default function UploadConfigPageContent() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [scanResults, setScanResults] = useState(null); // To store API response

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (!newFile) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target.result;
      let parsedContent = null;
      let error = null;

      try {
        if (newFile.name.endsWith('.yaml') || newFile.name.endsWith('.yml')) {
          parsedContent = yaml.parse(fileContent);
        } else if (newFile.name.endsWith('.json')) {
          parsedContent = JSON.parse(fileContent);
        }
      } catch (e) {
        error = `Failed to parse ${newFile.name}: ${e.message}`;
        console.error(error);
        setParseError(error);
      }

      setFiles(prev => [...prev, {
        fileObject: newFile,
        content: fileContent,
        parsedContent,
        error
      }]);

      setSelectedFile({
        fileObject: newFile,
        content: fileContent,
        parsedContent,
        error
      });
    };

    reader.onerror = () => {
      const error = "Error reading file";
      console.error(error);
      setParseError(error);
    };

    if (newFile.type.includes("text") || 
        newFile.name.endsWith(".json") || 
        newFile.name.endsWith(".yaml") || 
        newFile.name.endsWith(".yml")) {
      reader.readAsText(newFile);
    } else {
      reader.readAsDataURL(newFile);
    }

    e.target.value = null;
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    
    setScanning(true);
    setScanResult(null);
    setParseError(null);
    setScanResults(null);

    try {
      const response = await fetch('/api/scan-individual-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.fileObject.name,
          content: selectedFile.content
        })
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      if(data.error) {
        throw new Error(data.error);
      }
      setScanResults(data);
      if(data.bestPractices.status === 'success' && data.vulnerabilities.status === 'success') {
        setScanResult('success');
      }else{
        setScanResult('failure');
      }
      console.log('Scan results:', data);

    } catch (error) {
      console.error('Scan error:', error.message);
      setScanResult('failure');
      setParseError(error.message);
    } finally {
      setScanning(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setScanResult(null);
    setParseError(null);
    setScanResults(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 flex-grow">
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
                      setParseError(null);
                    }}
                    className={`relative w-full text-left px-4 py-3 rounded-md transition-all duration-200 ease-in-out
                                flex items-center justify-between group
                                ${selectedFile?.fileObject?.name === file.fileObject.name
                        ? "bg-[var(--brand-yellow)] text-[var(--background)] font-medium shadow-md"
                        : "bg-[var(--button-bg)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] text-[var(--foreground)]"
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <FileText size={20} className={selectedFile?.fileObject?.name === file.fileObject.name ? "text-[var(--background)]" : "text-[var(--text-secondary)] group-hover:text-[var(--brand-yellow)]"} />
                      <span className="truncate">{file.fileObject.name}</span>
                    </span>
                    {selectedFile?.fileObject?.name === file.fileObject.name && (
                      <CheckCircle size={20} className="text-[var(--background)]" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <label className="inline-flex items-center justify-center bg-[var(--brand-yellow)] text-[var(--background)] rounded-full px-6 py-3 cursor-pointer font-bold transition hover:brightness-110 shadow-lg text-lg">
          {files.length === 0 ? "Upload File" : "Add More Files"}
          <Upload className="ml-3 w-5 h-5" />
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".yaml,.yml,.json"
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
            {parseError && (
              <div className="mb-4 p-4 bg-red-600/20 text-red-400 rounded-lg w-full max-w-2xl">
                <p className="font-medium">Parse Error:</p>
                <p>{parseError}</p>
              </div>
            )}

            {scanning ? (
              <div className="flex flex-col items-center gap-6 text-[var(--brand-yellow)] animate-pulse-slow">
                <Loader2 className="w-16 h-16 animate-spin" />
                <p className="text-xl font-semibold">Scanning {selectedFile.fileObject.name}...</p>
                <p className="text-sm text-[var(--text-secondary)]">This might take a moment.</p>
              </div>
            ) : scanResult ? (
              <div className="w-full max-w-4xl">
                {scanResult === 'success' ? (
                  <div className="text-center">
                    <CheckCircle size={80} className="mx-auto mb-6 text-green-500 drop-shadow-lg" />
                    <h3 className="text-3xl font-bold mb-3">Scan Complete!</h3>
                    
                    {/* {scanResults?.findings?.length > 0 ? (
                      <div className="text-left">
                        <div className="mb-6 p-4 bg-green-600/10 rounded-lg">
                          <p className="text-lg">
                            Found {scanResults.findings.length} issue{scanResults.findings.length !== 1 ? 's' : ''} in{' '}
                            <span className="font-semibold">{selectedFile.fileObject.name}</span>
                          </p>
                          <div className="flex gap-4 mt-2 justify-center">
                            {scanResults.stats.critical > 0 && (
                              <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm">
                                {scanResults.stats.critical} Critical
                              </span>
                            )}
                            {scanResults.stats.high > 0 && (
                              <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm">
                                {scanResults.stats.high} High
                              </span>
                            )}
                            {scanResults.stats.medium > 0 && (
                              <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm">
                                {scanResults.stats.medium} Medium
                              </span>
                            )}
                            {scanResults.stats.low > 0 && (
                              <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm">
                                {scanResults.stats.low} Low
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {scanResults.findings.map((finding, i) => (
                            <div key={i} className={`p-4 rounded-lg ${
                              finding.severity === 'CRITICAL' ? 'bg-red-500/10' :
                              finding.severity === 'HIGH' ? 'bg-orange-500/10' :
                              finding.severity === 'MEDIUM' ? 'bg-yellow-500/10' :
                              'bg-blue-500/10'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold">
                                    {finding.rule_id}: {finding.description}
                                  </p>
                                  <p className="text-sm opacity-80">Line {finding.line_number}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  finding.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                                  finding.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                  finding.severity === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  {finding.severity}
                                </span>
                              </div>
                              {finding.mitigation && (
                                <div className="mt-2 p-2 bg-white/20 rounded">
                                  <p className="text-sm font-semibold">Recommendation:</p>
                                  <p className="text-sm">{finding.mitigation}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-[var(--text-secondary)] mb-6">
                        No issues found in <span className="font-semibold text-[var(--foreground)]">{selectedFile.fileObject.name}</span>
                      </p>
                    )} */}

                    <button
                      onClick={clearSelectedFile}
                      className="mt-6 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] font-semibold px-8 py-3 rounded-full hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] transition shadow-md"
                    >
                      Scan Another File
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <XCircle size={80} className="mx-auto mb-6 text-red-500 drop-shadow-lg" />
                    <h3 className="text-3xl font-bold mb-3">Scan Failed!</h3>
                    <p className="text-lg text-[var(--text-secondary)] mb-6">
                      {parseError || 'Unknown error occurred during scanning'}
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
                <p className="text-2xl font-semibold text-[var(--foreground)]">{selectedFile.fileObject.name}</p>
                <FileText size={60} className="text-[var(--text-secondary)]" />
                <p className="text-lg text-[var(--text-secondary)]">Ready to analyze your file?</p>
                <button
                  onClick={handleScan}
                  className="bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition shadow-lg text-lg"
                  disabled={scanning || !!parseError}
                >
                  {scanning ? (
                    <>
                      <Loader2 className="animate-spin mr-2 inline" size={20} />
                      Scanning...
                    </>
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