"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

import {
  Code, Folder, FolderOpen, Search, PlusCircle, FileCode, CheckCircle, Save,
  FileText, FileJson, FileType, FileCode2,
  AlertTriangle, Info, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Helper to get icon based on file extension
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return <FileCode size={20} />;
    case 'py':
      return <FileCode2 size={20} />;
    case 'json':
      return <FileJson size={20} />;
    case 'yml':
    case 'yaml':
      return <FileType size={20} />; 
    default:
      return <FileText size={20} />; 
  }
};

const initialDevelopmentRules = [
  { 
    id: 'R005', 
    name: 'Unencrypted DB Connections', 
    status: 'Under development', 
    files: [
      { name: 'db_connection_rule.json', content: '{\n  "ruleName": "Unencrypted DB Connections",\n  "pattern": "ssl_enabled: false",\n  "severity": "Critical"\n}', language: 'json' },
      { name: 'test_cases.yaml', content: 'test1:\n  config:\n    db_host: localhost\n    ssl_enabled: false\n  expected: fail\ntest2:\n  config:\n    db_host: remote.db\n    ssl_enabled: true\n  expected: pass', language: 'yaml' },
      { name: 'README.md', content: '# Unencrypted DB Connections Rule\n\nThis rule checks for database connection configurations that do not enforce SSL/TLS encryption. Ensure all production database connections use encryption to protect sensitive data in transit.', language: 'markdown' },
    ]
  },
  { 
    id: 'R012', 
    name: 'Log Injection Prevention', 
    status: 'Under development', 
    files: [
      { name: 'log_sanitizer.js', content: '// JavaScript rule logic for sanitizing log inputs\nfunction sanitizeLog(input) {\n  return input.replace(/[\\n\\r]/g, "_");\n}', language: 'javascript' },
      { name: 'validation_test.sh', content: '#!/bin/bash\n\n# Test script for log sanitizer\nLOG_INPUT="User login: admin\\nMalicious injection!"\nSANITIZED_OUTPUT=$(node -e "require(\'./log_sanitizer.js\').sanitizeLog(\'$LOG_INPUT\')")\necho "Sanitized: $SANITIZED_OUTPUT"', language: 'bash' },
    ]
  },
  { 
    id: 'R015', 
    name: 'CORS Configuration Check', 
    status: 'To be developed', 
    files: [
      { name: 'cors_policy.yaml', content: 'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  annotations:\n    nginx.ingress.kubernetes.io/cors-allow-origin: "*"\n    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"\nspec:\n  rules:\n    - host: api.example.com\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: my-service\n                port:\n                  number: 80', language: 'yaml' },
    ]
  },
];

export default function DevelopmentWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [rulesInDev, setRulesInDev] = useState(initialDevelopmentRules);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for sidebar collapse

  // Effect to handle initial rule/file selection from URL query params
  useEffect(() => {
    const ruleIdFromQuery = searchParams.get('ruleId') || searchParams.get('upgradeRuleId');
    if (ruleIdFromQuery) {
      const rule = rulesInDev.find(r => r.id === ruleIdFromQuery);
      if (rule) {
        setSelectedRuleId(rule.id);
        if (rule.files.length > 0) {
          setSelectedFile(rule.files[0]);
        }
      }
    }
  }, [searchParams, rulesInDev]);

  const filteredRules = useMemo(() => {
    if (!searchTerm) {
      return rulesInDev;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return rulesInDev.filter(rule => 
      rule.id.toLowerCase().includes(lowerSearchTerm) || 
      rule.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, rulesInDev]);

  // select rule and open its first file
  const handleFolderClick = (ruleId) => {
    const rule = rulesInDev.find(r => r.id === ruleId);
    if (rule) {
      setSelectedRuleId(rule.id);
      if (rule.files.length > 0) {
        setSelectedFile(rule.files[0]);
      } else {
        setSelectedFile(null);
      }
    }
  };

  //open file in editor
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  // Handle editor content change
  const handleEditorChange = (newValue) => {
    if (selectedRuleId && selectedFile) {
      setRulesInDev(prevRules => prevRules.map(rule => {
        if (rule.id === selectedRuleId) {
          return {
            ...rule,
            files: rule.files.map(file =>
              file.name === selectedFile.name ? { ...file, content: newValue } : file
            )
          };
        }
        return rule;
      }));
    }
  };

  //saving the current file
  const handleSaveFile = async () => {
    if (!selectedFile || !selectedRuleId) {
      setSaveFeedback({ type: 'error', message: 'No file selected to save.' });
      return;
    }
    setIsSaving(true);
    setSaveFeedback(null);
    console.log(`Saving file: ${selectedFile.name} for Rule ${selectedRuleId}`);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveFeedback({ type: 'success', message: `File '${selectedFile.name}' saved successfully!` });
    setIsSaving(false);
  };

  //"Develop a New Rule" button click
  const handleDevelopNewRule = () => {
    const newRuleId = `R${Math.floor(Math.random() * 1000)}`;
    const newRuleName = `New Custom Rule ${newRuleId}`;
    const newRule = {
      id: newRuleId,
      name: newRuleName,
      status: 'To be developed',
      files: [
        { name: 'rule_logic.js', content: '// Start writing your rule logic here...\n', language: 'javascript' },
        { name: 'test_cases.yaml', content: '# Add test cases here...\n', language: 'yaml' },
      ]
    };
    setRulesInDev(prev => [...prev, newRule]);
    setSelectedRuleId(newRule.id);
    setSelectedFile(newRule.files[0]);
    setSaveFeedback({ type: 'info', message: `New rule '${newRuleName}' created. Start coding!` });
  };

  const currentFileContent = selectedFile ? selectedFile.content : '';
  const currentFileLanguage = selectedFile ? selectedFile.language : 'plaintext';

  return (
    <div className={`p-8 md:p-10 lg:p-4 ${lexend.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
      
      {/* Header and Action Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-2xl font-bold text-[var(--foreground)] animate-fadeInUp">
          <Code size={32} className="inline-block mr-4 text-[var(--brand-yellow)]" />
          Development Workspace
        </h1>
        <button
          onClick={handleDevelopNewRule}
          className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-xl text-base"
        >
          <PlusCircle size={20} /> Develop a New Rule
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-200px)]">
        
        {/* Workspace Sidebar / Rule Explorer */}
        <div 
          className={clsx(
            "bg-[var(--input-bg)] rounded-xl shadow-2xl border border-[var(--border-input)] flex flex-col transition-all duration-300 relative",
            isSidebarCollapsed ? "w-[60px] md:w-[70px] p-2" : "w-full md:w-[35%] lg:w-[25%] p-6" // Reduced default width
          )}
        >
          
          {/* Collapse/Expand Button */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={clsx(
              "absolute top-4 transition-all duration-300 z-10 p-2 rounded-full",
              "bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]",
              isSidebarCollapsed ? "-right-4 rotate-0" : "-right-4 rotate-180" // Position outside the main sidebar area
            )}
          >
            <ChevronLeft size={20} />
          </button>

          {!isSidebarCollapsed && (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-[var(--brand-yellow)]">
                Rule Explorer
              </h2>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search Rule ID or Name..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Rule Folders List */}
          <div className="flex flex-col space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-grow">
            {filteredRules.length === 0 ? (
              <div className="text-[var(--text-secondary)] text-center py-10">
                {isSidebarCollapsed ? <Folder size={32} className="mx-auto" /> : 'No active rules found.'}
              </div>
            ) : (
              filteredRules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={clsx(
                    "relative rounded-lg cursor-pointer transition-all duration-200 shadow-md",
                    "hover:bg-[var(--hover-bg)] hover:shadow-lg",
                    selectedRuleId === rule.id 
                      ? "bg-[var(--hover-bg)] border-l-4 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                      : "bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)]",
                    isSidebarCollapsed ? "p-2 text-center" : "p-4"
                  )}
                >
                  <div 
                    onClick={() => handleFolderClick(rule.id)}
                    className={clsx(
                      "flex items-center gap-3 font-semibold",
                      isSidebarCollapsed ? "justify-center" : ""
                    )}
                  >
                    {selectedRuleId === rule.id ? <FolderOpen size={24} /> : <Folder size={24} />}
                    {!isSidebarCollapsed && (
                      <span className="truncate">{rule.id} - {rule.name}</span>
                    )}
                  </div>
                  {/* Nested files */}
                  {selectedRuleId === rule.id && rule.files && rule.files.length > 0 && !isSidebarCollapsed && (
                    <div className="ml-8 mt-3 space-y-2">
                      {rule.files.map(file => (
                        <div 
                          key={file.name}
                          onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                          className={clsx(
                            "flex items-center gap-2 text-sm p-2 rounded-md cursor-pointer",
                            "hover:bg-[var(--hover-bg)]",
                            selectedFile?.name === file.name 
                              ? "bg-[var(--hover-bg)] text-[var(--brand-yellow)] font-medium" 
                              : "text-[var(--text-secondary)]"
                          )}
                        >
                          {getFileIcon(file.name)}
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workspace Area */}
        <div 
          className={clsx(
            "bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] w-full flex flex-col overflow-hidden transition-all duration-300",
            "flex-grow"
          )}
        >
          
          {selectedFile ? (
            <>
              {/* Editor Header*/}
              <div className="flex justify-between items-center border-b border-[var(--border-input)] pb-4 mb-4">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  {getFileIcon(selectedFile.name)} {selectedFile.name}
                  <span className="text-sm text-[var(--text-secondary)] ml-2">({selectedRuleId})</span>
                </h2>
                <button
                  onClick={handleSaveFile}
                  className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-5 py-2 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-sm"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </div>

              {saveFeedback && (
                <div className={clsx(
                  "p-3 rounded-lg text-sm mb-4 flex items-center gap-2",
                  saveFeedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400',
                  saveFeedback.type === 'info' && 'bg-blue-600/20 text-blue-400'
                )}>
                  {saveFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span>{saveFeedback.message}</span>
                </div>
              )}

              {/* Monaco Editor */}
              <div className="flex-grow rounded-lg overflow-hidden border border-[var(--border-input)] shadow-inner">
                <MonacoEditor
                  height="100%"
                  language={currentFileLanguage}
                  theme="vs-dark"
                  value={currentFileContent}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              {/* Bottom Panel*/}
              <div className="mt-4 p-4 bg-[var(--background)] rounded-lg border border-[var(--border-input)] shadow-inner text-sm text-[var(--text-secondary)] h-32 overflow-y-auto">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Output Console</h3>
                <p>
                  <span className="text-green-400">[INFO]</span> Ready to run tests.
                </p>
                <p>
                  <span className="text-yellow-400">[WARNING]</span> Ensure all changes are saved before testing.
                </p>
              </div>
            </>
          ) : (
            // Empty state
            <div className="w-full h-full flex flex-col justify-center items-center text-center space-y-6">
              <FileCode2 size={128} className="text-[var(--text-secondary)] opacity-30" />
              <h2 className="text-3xl font-bold text-[var(--foreground)]">Select a File to Edit</h2>
              <p className="text-xl text-[var(--text-secondary)] max-w-xl">
                Choose a rule folder from the left sidebar, then click on a file to open it in the editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}