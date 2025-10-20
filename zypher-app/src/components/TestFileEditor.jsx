"use client";

import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save, Loader2, CheckCircle, AlertCircle, FileText, Eye } from 'lucide-react';

const TestFileEditor = ({ 
  selectedRule, 
  testFileContent, 
  setTestFileContent,
  ruleFileContent,
  testOutput, 
  isTesting, 
  isSaving,
  saveFeedback,
  onRunTest, 
  onSaveTest,
  onPublish,
  onReject
}) => {
  const [showRuleFile, setShowRuleFile] = useState(false);

  // Handle view toggle with proper content management
  const handleViewToggle = (showRule) => {
    setShowRuleFile(showRule);
  };

  if (!selectedRule) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a rule to start testing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0 overflow-hidden h-full">
      {/* Header with rule info and view toggle */}
      <div className="flex items-center justify-between mb-4 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-input)]">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">{selectedRule.name}</h3>
          <p className="text-sm text-[var(--text-secondary)] truncate">Rule ID: {selectedRule.id}</p>
        </div>
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={() => handleViewToggle(false)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              !showRuleFile 
                ? 'bg-[var(--brand-yellow)] text-[var(--background)]' 
                : 'bg-[var(--button-bg)] text-[var(--foreground)] hover:bg-[var(--hover-bg)]'
            }`}
          >
            Test File
          </button>
          <button
            onClick={() => handleViewToggle(true)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              showRuleFile 
                ? 'bg-[var(--brand-yellow)] text-[var(--background)]' 
                : 'bg-[var(--button-bg)] text-[var(--foreground)] hover:bg-[var(--hover-bg)]'
            }`}
          >
            <Eye size={16} />
            Rule File
          </button>
        </div>
      </div>

      {/* Save Feedback */}
      {saveFeedback && (
        <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
          saveFeedback.type === 'success' 
            ? 'bg-green-900/20 border-green-500/30 text-green-400' 
            : saveFeedback.type === 'error'
            ? 'bg-red-900/20 border-red-500/30 text-red-400'
            : 'bg-blue-900/20 border-blue-500/30 text-blue-400'
        }`}>
          {saveFeedback.type === 'success' && <CheckCircle size={16} />}
          {saveFeedback.type === 'error' && <AlertCircle size={16} />}
          <span className="text-sm">{saveFeedback.message}</span>
        </div>
      )}

      {/* Editor Section */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        {!showRuleFile ? (
          // Test File Editor
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-[var(--foreground)]">Test File (YAML)</h4>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={onSaveTest}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Test
                </button>
                <button
                  onClick={onRunTest}
                  disabled={isTesting || !testFileContent.trim()}
                  className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] hover:brightness-110 disabled:opacity-50 text-[var(--background)] px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Run Test
                </button>
              </div>
            </div>
            <div className="flex-1 border border-[var(--border-input)] rounded-lg overflow-hidden min-h-0 max-w-70%">
              <Editor
                key={`test-${selectedRule?.id || 'default'}`}
                height="100%"
                width="73%"
                language="yaml"
                value={testFileContent}
                onChange={(value) => setTestFileContent(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 2,
                  wordWrapColumn: 80,
                  wordWrapMinified: true,
                  wrappingIndent: 'indent',
                }}
              />
            </div>
          </>
        ) : (
          // Rule File Viewer (Read-only)
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-[var(--foreground)]">Rule File (Python) - Read Only</h4>
              <span className="text-sm text-[var(--text-secondary)] bg-[var(--input-bg)] px-2 py-1 rounded flex-shrink-0">
                View Only
              </span>
            </div>
            <div className="flex-1 border border-[var(--border-input)] rounded-lg overflow-hidden min-h-0">
              <Editor
                key={`rule-${selectedRule?.id || 'default'}`}
                height="100%"
                width="73%"
                language="python"
                value={ruleFileContent}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 4,
                  wordWrapColumn: 80,
                  wordWrapMinified: true,
                  wrappingIndent: 'indent',
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Test Console Output */}
      <div className="mt-4">
        <h4 className="text-md font-medium text-[var(--foreground)] mb-2">Test Console</h4>
        <div className="bg-black border border-[var(--border-input)] rounded-lg p-4 h-40 overflow-y-auto font-mono text-sm">
          <pre className="text-green-400 whitespace-pre-wrap">
            {testOutput || 'Test output will appear here...'}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-input)]">
        <button
          onClick={onReject}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          <AlertCircle size={16} />
          Request Modifications
        </button>
        <button
          onClick={onPublish}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          <CheckCircle size={16} />
          Approve & Publish
        </button>
      </div>
    </div>
  );
};

export default TestFileEditor;
