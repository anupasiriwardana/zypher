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

const toCamelCase = str => str.replace(/(?:^|\s|_|-)([a-zA-Z])/g, (m, c) => c ? c.toUpperCase() : '').replace(/\s|_|-/g, '').replace(/^([A-Z])/, (m, c) => c.toLowerCase());

const initialTestYml = `# Example CI/CD pipeline config\nstages:\n  - build\n  - test\n  - deploy\njobs:\n  build-job:\n    stage: build\n    script:\n      - echo \\"Building...\\"\n  test-job:\n    stage: test\n    script:\n      - echo \\"Running tests...\\"\n  deploy-job:\n    stage: deploy\n    script:\n      - echo \\"Deploying...\\"\n`;

const initialDevelopmentRules = [
//   {
//     id: 'R005',
//     name: 'Unencrypted DB Connections',
//     type: 'Vulnerability',
//     status: 'Under development',
//     files: [
//       {
//         name: toCamelCase('Unencrypted DB Connections') + '.py',
//         language: 'python',
//         content:
// `import re
// from typing import Dict, List, Any, Optional, Tuple

// class UnencryptedDBConnections(BaseRule):
//     METADATA = {
//         "rule_id": "R005",
//         "rule_name": "Unencrypted DB Connections",
//         "severity": "Critical"
//     }
//     def __init__(self):
//         self.credential_patterns = [
//             r"password[\"\':\s]*=[\"'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
//             r"pwd[\"\':\s]*=[\"'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}"
//         ]
//         self.aws_key_pattern = r"(?:ACCESS|SECRET)_?KEY(?:_ID)?[\"\':\s]*=[\"'\s]*(?:AKIA)[a-zA-Z0-9]{16,}"
//         self.secret_patterns = [
//             r"-----BEGIN (RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY-----",
//             r"eyJhbGciOiJ[^"]{50,}",
//             r"ghp_[a-zA-Z0-9]{36}",
//             r"xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}"
//         ]
//     def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
//         print(f"Starting scan on {file_path}")
//         findings = []
//         findings.extend(self._check_env_vars(pipeline_data, file_lines, file_path))
//         findings.extend(self._scan_lines(file_lines, file_path))
//         findings.extend(self._check_secret_exposure(pipeline_data, file_lines, file_path))
//         print(f"Found {len(findings)} credential hygiene issues")
//         return findings
//     # Enter your logics complying with the above format
// `
//       },
//       {
//         name: 'test.yml',
//         language: 'yaml',
//         content: initialTestYml
//       },
//       {
//         name: 'metadata.json',
//         language: 'json',
//         content: JSON.stringify({
//           rule_id: 'R005',
//           name: 'Unencrypted DB Connections',
//           description: 'Checks for DB connections without SSL/TLS encryption.',
//           severity: 'Critical',
//           status: 'Under development',
//           developer_note: '',
//           type: 'Vulnerability'
//         }, null, 2)
//       }
//     ]
//   },
//   {
//     id: 'R012',
//     name: 'Log Injection Prevention',
//     type: 'Best Practice',
//     status: 'Under development',
//     files: [
//       {
//         name: toCamelCase('Log Injection Prevention') + '.py',
//         language: 'python',
//         content:
// `import re
// from typing import Dict, List, Any, Optional, Tuple

// class LogInjectionPrevention(BaseRule):
//     METADATA = {
//         "rule_id": "R012",
//         "rule_name": "Log Injection Prevention",
//         "severity": "High"
//     }
//     def __init__(self):
//         # Example logic for log injection prevention
//         pass
//     def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
//         print(f"Starting scan on {file_path}")
//         findings = []
//         // Add your scan logic here
//         return findings
// `
//       },
//       {
//         name: 'test.yml',
//         language: 'yaml',
//         content: initialTestYml
//       },
//       {
//         name: 'metadata.json',
//         language: 'json',
//         content: JSON.stringify({
//           rule_id: 'R012',
//           name: 'Log Injection Prevention',
//           description: 'Checks for log injection vulnerabilities.',
//           severity: 'High',
//           status: 'Under development',
//           developer_note: '',
//           type: 'Best Practice'
//         }, null, 2)
//       }
//     ]
//   },
//   {
//     id: 'R015',
//     name: 'CORS Configuration Check',
//     type: 'Best Practice',
//     status: 'To be developed',
//     files: [
//       {
//         name: toCamelCase('CORS Configuration Check') + '.py',
//         language: 'python',
//         content:
// `import re
// from typing import Dict, List, Any, Optional, Tuple

// class CORSConfigurationCheck(BaseRule):
//     METADATA = {
//         "rule_id": "R015",
//         "rule_name": "CORS Configuration Check",
//         "severity": "Medium"
//     }
//     def __init__(self):
//         # Example logic for CORS configuration
//         pass
//     def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
//         print(f"Starting scan on {file_path}")
//         findings = []
//         // Add your scan logic here
//         return findings
// `
//       },
//       {
//         name: 'test.yml',
//         language: 'yaml',
//         content: initialTestYml
//       },
//       {
//         name: 'metadata.json',
//         language: 'json',
//         content: JSON.stringify({
//           rule_id: 'R015',
//           name: 'CORS Configuration Check',
//           description: 'Checks for insecure CORS configurations.',
//           severity: 'Medium',
//           status: 'To be developed',
//           developer_note: '',
//           type: 'Best Practice'
//         }, null, 2)
//       }
//     ]
//   }
];

// Helper to get default rule ID by type
const getDefaultRuleId = (type) => {
  if (type === 'Vulnerability') return 'CICD-VULN-001';
  if (type === 'Best Practice') return 'CICD-BSTP-001';
  if (type === 'Custom Rule') return 'CICD-CUST-001';
  return 'CICD-CUST-001';
};

export default function DevelopmentWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [rulesInDev, setRulesInDev] = useState(initialDevelopmentRules);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  // Auto-dismiss save feedback after 5 seconds, but only for success messages
  useEffect(() => {
    if (saveFeedback && saveFeedback.type === 'success') {
      const timer = setTimeout(() => setSaveFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveFeedback]);
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

  // Replace with actual logged-in developer ID
  // Example: get current developer ID from auth context
  // Replace with your actual auth logic
  // import { useAuth } from '../../path/to/authProvider';
  // const { user } = useAuth();
  // const RULE_DEVELOPER_ID = user?.id;

  // For demo, fallback to default if not logged in
  const [developerId, setDeveloperId] = useState('default_rule_developer_id');

  // Example: get developer ID from localStorage/session/cookie
  useEffect(() => {
    // Replace with your actual logic to get logged-in user
    const storedId = window.localStorage.getItem('rule_developer_id');
    if (storedId) setDeveloperId(storedId);
    // If using context, setDeveloperId(user.id);
  }, []);

  // Save metadata to Next.js API
  const saveMetadataToDB = async (metadata) => {
    // Validate required fields before sending
    const requiredFields = ['rule_id', 'name', 'description', 'severity', 'status', 'type'];
    for (const field of requiredFields) {
      if (!metadata[field]) {
        return { error: `Missing required field: ${field}` };
      }
    }
    try {
      // Ensure 'rule_name' is present for backend validation
      const payload = { 
        ...metadata, 
        rule_developer_id: developerId,
        rule_name: metadata.rule_name || metadata.name // Map 'name' to 'rule_name' if needed
      };
      const res = await fetch('/api/customRuleMetadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) {
        // Log error for debugging
        console.error('API Error:', result);
      }
      return result;
    } catch (err) {
      console.error('Fetch Error:', err);
      return { error: err.message };
    }
  };

  // Save file (rule_name.py or test.yml) to FastAPI backend
  const saveFileToDB = async (file, rule) => {
    try {
      if (file.name === 'test.yml') {
        // Update example_code in customRuleMetadata
        const res = await fetch('/api/customRuleMetadata', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rule_id: rule.id,
            example_code: file.content
          })
        });
        return await res.json();
      } else {
        // Save other files to customRuleFile
        const res = await fetch('/api/customRuleFile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rule_id: rule.id,
            rule_name: rule.name,
            status: rule.status || 'active',
            file_content: file.content
          })
        });
        return await res.json();
      }
    } catch (err) {
      return { error: err.message };
    }
  };

  // Fetch rules for current developer
  const fetchRulesForDeveloper = async () => {
    try {
      const res = await fetch('/api/customRuleMetadata');
      const allRules = await res.json();
      return allRules.filter(r => r.rule_developer_id === developerId);
    } catch (err) {
      return [];
    }
  };

  // --- Update handleSaveFile to save to DB ---
  const handleSaveFile = async (metadataFormData) => {
    if (!selectedFile || !selectedRuleId) {
      setSaveFeedback({ type: 'error', message: 'No file selected to save.' });
      return;
    }
    setIsSaving(true);
    setSaveFeedback(null);
    let updatedContent = selectedFile.content;
    // If saving metadata.json, update with form data
    if (selectedFile.name === 'metadata.json' && metadataFormData) {
      let newRuleId = metadataFormData.rule_id;
      if (metadataFormData.type) {
        newRuleId = getDefaultRuleId(metadataFormData.type);
      }
      updatedContent = JSON.stringify({ ...metadataFormData, rule_id: newRuleId }, null, 2);
      // Save metadata to DB
      await saveMetadataToDB({ ...metadataFormData, rule_id: newRuleId });
    }
    // Save rule_name.py or test.yml to DB
    if (selectedFile.language === 'python' || selectedFile.language === 'yaml') {
      const rule = rulesInDev.find(r => r.id === selectedRuleId);
      await saveFileToDB(selectedFile, rule);
    }
    setRulesInDev(prevRules => prevRules.map(rule => {
      if (rule.id === selectedRuleId) {
        let newRuleId = metadataFormData?.rule_id || rule.id;
        if (metadataFormData?.type) {
          newRuleId = getDefaultRuleId(metadataFormData.type);
        }
        let updatedFiles = rule.files.map(file => {
          if (file.name === selectedFile.name) {
            return { ...file, content: updatedContent };
          }
          if (
            file.language === 'python' &&
            metadataFormData &&
            metadataFormData.name &&
            toCamelCase(metadataFormData.name) + '.py' !== file.name
          ) {
            return { ...file, name: toCamelCase(metadataFormData.name) + '.py' };
          }
          return file;
        });
        return {
          ...rule,
          id: newRuleId,
          name: metadataFormData?.name || rule.name,
          files: updatedFiles
        };
      }
      return rule;
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveFeedback({ type: 'success', message: `File '${selectedFile.name}' saved successfully!` });
    setIsSaving(false);
  };

  //"Develop a New Rule" button click

  // --- Test interface state and logic ---
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Find the current test.yml file for the selected rule
  const currentTestYmlFile = useMemo(() => {
    if (!selectedRuleId) return null;
    const rule = rulesInDev.find(r => r.id === selectedRuleId);
    return rule?.files.find(f => f.name === 'test.yml') || null;
  }, [selectedRuleId, rulesInDev]);

  // Find the current rule python file for the selected rule
  const currentRulePyFile = useMemo(() => {
    if (!selectedRuleId) return null;
    const rule = rulesInDev.find(r => r.id === selectedRuleId);
    return rule?.files.find(f => f.language === 'python') || null;
  }, [selectedRuleId, rulesInDev]);

  // Handler for running the test
  const handleRunTest = () => {
    setIsTesting(true);
    setTestOutput('');
    setTimeout(() => {
      setTestOutput(
        `Test run complete!\n\nRule: ${currentRulePyFile?.name || ''}\nTest file: test.yml\nResult: \u2705 Passed (simulated)\n\n[INFO] This is a mock result. Integrate with backend for real testing.`
      );
      setIsTesting(false);
    }, 1200);
  };

  const handleDevelopNewRule = () => {
    const newRuleType = '';
    const newRuleId = getDefaultRuleId(newRuleType);
    const newRuleName = `New Custom Rule ${newRuleId}`;
    const pyFileName = toCamelCase(newRuleName) + '.py';
    const newRule = {
      id: newRuleId,
      name: newRuleName,
      type: newRuleType, // To be selected by user
      status: 'To be developed',
      files: [
        {
          name: pyFileName,
          language: 'python',
          content:
`import re
from typing import Dict, List, Any, Optional, Tuple

class NewCustomRule(BaseRule):
    METADATA = {
        "rule_id": "${newRuleId}",
        "rule_name": "${newRuleName}",
        "severity": "Medium"
    }
    def __init__(self):
        # Example logic for new rule
        pass
    def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
        print(f"Starting scan on {file_path}")
        findings = []
        # Add your scan logic here
        return findings
`
        },
        {
          name: 'test.yml',
          language: 'yaml',
          content: initialTestYml
        },
        {
          name: 'metadata.json',
          language: 'json',
          content: JSON.stringify({
            rule_id: newRuleId,
            name: newRuleName,
            description: '',
            severity: 'Medium',
            status: 'To be developed',
            developer_note: '',
            type: newRuleType // To be selected by user
          }, null, 2)
        }
      ]
    };
    setRulesInDev(prev => [...prev, newRule]);
    setSelectedRuleId(newRule.id);
    setSelectedFile(newRule.files[2]); // Open metadata.json for new rule
    setSaveFeedback({ type: 'info', message: `New rule '${newRuleName}' created. Fill metadata to start coding!` });
  };

  const currentFileContent = selectedFile ? selectedFile.content : '';
  const currentFileLanguage = selectedFile ? selectedFile.language : 'plaintext';

  // Metadata form state
  const [metadataForm, setMetadataForm] = useState(null);

  useEffect(() => {
    if (selectedFile && selectedFile.name === 'metadata.json') {
      try {
        setMetadataForm(JSON.parse(selectedFile.content));
      } catch {
        setMetadataForm({});
      }
    } else {
      setMetadataForm(null);
    }
  }, [selectedFile]);

  const handleMetadataFormChange = (e) => {
    const { name, value } = e.target;
    setMetadataForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMetadataFormSave = (e) => {
    e.preventDefault();
    handleSaveFile(metadataForm);
  };

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
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
        
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
              <div className="flex justify-between items-center border-b border-[var(--border-input)] pb-4 mb-4 ">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  {getFileIcon(selectedFile.name)} {selectedFile.name}
                  <span className="text-sm text-[var(--text-secondary)] ml-2">({selectedRuleId})</span>
                </h2>
                {selectedFile.name === 'metadata.json' ? (
                  <button
                    onClick={() => handleSaveFile(metadataForm)}
                    className="inline-flex items-center gap-2  text-[var(--background)] font-bold px-5 py-2 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-sm"
                    disabled={true}
                  >
                    
                  </button>
                ) : (
                  <button
                    onClick={() => handleSaveFile()}
                    className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-5 py-2 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-sm"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save
                  </button>
                )}
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

              {/* Metadata Form */}
              {selectedFile.name === 'metadata.json' && metadataForm ? (
                <form onSubmit={handleMetadataFormSave} className="mb-4 p-4 rounded-lg border border-[var(--border-input)] bg-[var(--background)] shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">Rule ID</label>
                      <input type="text" name="rule_id" value={metadataForm.rule_id || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)]" required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Rule Name</label>
                      <input type="text" name="name" value={metadataForm.name || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)]" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-semibold mb-1">Description</label>
                      <textarea name="description" value={metadataForm.description || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)]" rows={2} required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Severity</label>
                      <select name="severity" value={metadataForm.severity || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200" required>
                        <option value="">Select Severity</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                        <option value="Info">Info</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <select name="status" value={metadataForm.status || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200" required>
                        <option value="">Select Status</option>
                        <option value="To be developed">To be developed</option>
                        <option value="Under development">Under development</option>
                        <option value="To be tested">To be tested</option>
                        <option value="Under testing">Under testing</option>
                        <option value="Published">Published</option>
                        <option value="Discarded">Discarded</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-semibold mb-1">Developer Note</label>
                      <textarea name="developer_note" value={metadataForm.developer_note || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)]" rows={2} />
                    </div>
                    {/* Rule Type selector for all rules */}
                    <div className="md:col-span-2">
                      <label className="block font-semibold mb-1">Rule Type</label>
                      <select name="type" value={metadataForm.type || ''} onChange={handleMetadataFormChange} className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200" required>
                        <option value="">Select Type</option>
                        <option value="Vulnerability">Vulnerability</option>
                        <option value="Best Practice">Best Practice</option>
                        <option value="Custom Rule">Custom Rule</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="mt-4 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-2 rounded-full shadow-md hover:brightness-110 transition-all duration-300">Save Metadata</button>
                </form>
              ) : selectedFile.name === 'test.yml' ? (
                <>
                  <div className="flex-grow rounded-lg overflow-hidden border border-[var(--border-input)] shadow-inner w-[90%] mb-4">
                    <MonacoEditor
                      height="100%"
                      width="100%"
                      language="yaml"
                      theme="vs-dark"
                      value={selectedFile.content}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        renderLineHighlight: 'all',
                        contextmenu: true,
                        folding: false,
                        quickSuggestions: true,
                      }}
                    />
                  </div>
                  <div className="bg-[var(--background)] border border-[var(--border-input)] rounded-lg p-4 shadow-inner w-[90%] mb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <button
                        onClick={handleRunTest}
                        className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-2 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
                        disabled={isTesting}
                      >
                        {isTesting ? <Loader2 size={18} className="animate-spin" /> : <FileCode2 size={18} />}
                        {isTesting ? 'Running...' : 'Run Test'}
                      </button>
                      <span className="text-[var(--text-secondary)] text-sm">Test your pipeline config against the rule logic.</span>
                    </div>
                    <div className="bg-black/60 text-green-300 font-mono rounded p-3 min-h-[60px] max-h-40 overflow-y-auto text-xs">
                      {testOutput || 'No test run yet.'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-grow rounded-lg overflow-hidden border border-[var(--border-input)] shadow-inner w-[90%]">
                  <MonacoEditor
                    height="100%"
                    width="100%"
                    language={currentFileLanguage}
                    theme="vs-dark"
                    value={currentFileContent}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      wordWrap: 'off',
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      renderLineHighlight: 'all',
                      contextmenu: true,
                      folding: false,
                      quickSuggestions: true,
                    }}
                  />
                </div>
              )}

              {/* Bottom Panel removed as per user request */}
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