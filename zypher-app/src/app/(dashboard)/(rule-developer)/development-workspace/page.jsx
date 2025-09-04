"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import RuleExplorer from '@/components/RuleExplorer';
import CodeEditor from '@/components/CodeEditor';
import {
  Code, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Helper function to convert string to camelCase for class names
const toCamelCase = str => str.replace(/(?:^|\s|_|-)([a-zA-Z])/g, (m, c) => c ? c.toUpperCase() : '').replace(/\s|_|-/g, '').replace(/^([A-Z])/, (m, c) => c.toLowerCase());

// Helper function to convert string to PascalCase for class names
const toPascalCase = str => str.replace(/(?:^|\s|_|-)([a-zA-Z])/g, (m, c) => c ? c.toUpperCase() : '').replace(/\s|_|-/g, '');

// Default test.yml template
const initialTestYml = `# Example CI/CD pipeline config
stages:
  - build
  - test
  - deploy
jobs:
  build-job:
    stage: build
    script:
      - echo "Building..."
  test-job:
    stage: test
    script:
      - echo "Running tests..."
  deploy-job:
    stage: deploy
    script:
      - echo "Deploying..."
`;

// Generate rule ID based on type
const generateRuleId = (type, ruleRequestInfo) => {
  const timestamp = Date.now().toString().slice(-4);
  if (type === 'Vulnerability') return `VULN-${timestamp}`;
  if (type === 'Best Practice') return `BP-${timestamp}`;
  if (type === 'custom') return `CICD-CUST-${ruleRequestInfo._id || timestamp}`;
};

export default function DevelopmentWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [rulesInDev, setRulesInDev] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [ruleRequestData, setRuleRequestData] = useState(null);
  
  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  
  // Form states
  const [metadataForm, setMetadataForm] = useState(null);
  
  // Test console states
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);


  // Auto-dismiss save feedback after 5 seconds for success messages
  useEffect(() => {
    if (saveFeedback && saveFeedback.type === 'success') {
      const timer = setTimeout(() => setSaveFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveFeedback]);

  // Fetch rule request details when ruleRequestId is provided
  useEffect(() => {
    const ruleRequestId = searchParams.get('ruleRequestId');
    const ruleType = searchParams.get('ruleType');

    if (ruleRequestId) {
      fetchRuleRequestAndInitialize(ruleRequestId, ruleType);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Update metadata form when selectedFile changes
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

  // Fetch rule request details and auto-create rule development files
  const fetchRuleRequestAndInitialize = async (ruleRequestId, ruleType) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/custom-rule-request/${ruleRequestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ruleRequest = data.ruleRequest;
        
        if (ruleRequest) {
          setRuleRequestData(ruleRequest); // Store rule request data
          await initializeRuleFromRequest(ruleRequest, ruleType);
        } else {
          setError('Rule request not found');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch rule request');
      }
    } catch (error) {
      console.error('Error fetching rule request:', error);
      setError('An unexpected error occurred while fetching rule request');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize rule development files from rule request
  const initializeRuleFromRequest = async (ruleRequest, ruleType) => {
    const ruleId = generateRuleId(ruleType, ruleRequest);
    const className = toPascalCase(ruleRequest.name);
    const pythonFileName = `${toCamelCase(ruleRequest.name)}.py`;
    
    const pythonContent = `import re
from typing import Dict, List, Any, Optional, Tuple

class ${className}(BaseRule):
    METADATA = {
        "rule_id": "${ruleId}",
        "rule_name": "${ruleRequest.name}",
        "severity": "${ruleRequest.suggested_severity || 'Medium'}"
    }
    
    def __init__(self):
        """
        Initialize the rule with any required patterns or configurations.
        Based on: ${ruleRequest.description}
        """
        pass
    
    def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
        """
        Scan the pipeline data for issues related to: ${ruleRequest.name}
        
        Args:
            pipeline_data: Parsed pipeline configuration
            file_lines: List of file lines
            file_path: Path to the file being scanned
            
        Returns:
            List of Finding objects
        """
        print(f"Starting scan on {file_path}")
        findings = []
        
        # TODO: Implement your scan logic here
        # Reference description: ${ruleRequest.description}
        ${ruleRequest.sample_code ? `# Sample code provided: ${ruleRequest.sample_code}` : '# No sample code provided'}
        
        return findings
`;

    const metadataContent = {
      rule_id: ruleId,
      name: ruleRequest.name,
      description: ruleRequest.description,
      severity: ruleRequest.suggested_severity || 'Medium',
      // status: 'Under Development',
      // developer_note: `Developed from rule request: ${ruleRequest._id}`,
      type: ruleType,
      original_request_id: ruleRequest._id,
      remediation: ''
    };

    const testContent = ruleRequest.sample_code || initialTestYml;

    const newRule = {
      id: ruleId,
      name: ruleRequest.name,
      type: 'Custom Rule',
      status: 'Under Development',
      originalRequestId: ruleRequest._id,
      files: [
        {
          name: pythonFileName,
          language: 'python',
          content: pythonContent
        },
        {
          name: 'test.yml',
          language: 'yaml',
          content: testContent
        },
        {
          name: 'metadata.json',
          language: 'json',
          content: JSON.stringify(metadataContent, null, 2)
        }
      ]
    };

    setRulesInDev([newRule]);
    setSelectedRuleId(newRule.id);
    setSelectedFile(newRule.files[2]); // Open metadata.json first
    setSaveFeedback({ 
      type: 'info', 
      message: `Rule development initialized from request: "${ruleRequest.name}". Configure metadata and start coding!` 
    });
  };

  // Handle folder click
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

  // Handle file click
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

  // Handle save file
  const handleSaveFile = async (metadataFormData) => {
    if (!selectedFile || !selectedRuleId) {
      setSaveFeedback({ type: 'error', message: 'No file selected to save.' });
      return;
    }
    
    setIsSaving(true);
    setSaveFeedback(null);
    
    try {
      let updatedContent = selectedFile.content;
      
      // If saving metadata.json, update with form data and call API
      if (selectedFile.name === 'metadata.json' && metadataFormData) {
        updatedContent = JSON.stringify(metadataFormData, null, 2);
        
        // Call API to save metadata
        const response = await fetch('/api/custom-rule-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ruleId: metadataFormData.rule_id,
            ruleName: metadataFormData.name,
            ruleDescription: metadataFormData.description,
            suggestedSeverity: metadataFormData.severity,
            remediation: metadataFormData.remediation || null,
            ruleOwnerId: ruleRequestData?.user_id || null,
            requestId: ruleRequestData?._id || null
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save metadata to database');
        }
      }

      // Update the rule in state
      setRulesInDev(prevRules => prevRules.map(rule => {
        if (rule.id === selectedRuleId) {
          return {
            ...rule,
            name: metadataFormData?.name || rule.name,
            files: rule.files.map(file => 
              file.name === selectedFile.name ? { ...file, content: updatedContent } : file
            )
          };
        }
        return rule;
      }));
      
      setSaveFeedback({ 
        type: 'success', 
        message: selectedFile.name === 'metadata.json' 
          ? 'Metadata saved successfully to database!' 
          : `File '${selectedFile.name}' saved successfully!` 
      });
    } catch (error) {
      console.error('Save error:', error);
      setSaveFeedback({ 
        type: 'error', 
        message: error.message || 'Failed to save file. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle metadata form change
  const handleMetadataFormChange = (e) => {
    const { name, value } = e.target;
    setMetadataForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle metadata form save
  const handleMetadataFormSave = (e) => {
    e.preventDefault();
    handleSaveFile(metadataForm);
  };

  // Handle test run
  const handleRunTest = async () => {
    if (!selectedRuleId || !rulesInDev.length) {
      setTestOutput('❌ Error: No rule selected for testing');
      return;
    }

    const rule = rulesInDev.find(r => r.id === selectedRuleId);
    if (!rule) {
      setTestOutput('❌ Error: Selected rule not found');
      return;
    }

    const testFile = rule.files.find(f => f.name === 'test.yml');
    const pythonFile = rule.files.find(f => f.language === 'python');
    const metadataFile = rule.files.find(f => f.name === 'metadata.json');

    if (!testFile || !pythonFile || !metadataFile) {
      setTestOutput('❌ Error: Missing required files (test.yml, python rule, or metadata.json)');
      return;
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataFile.content);
    } catch (error) {
      setTestOutput('❌ Error: Invalid metadata.json format');
      return;
    }

    setIsTesting(true);
    setTestOutput('🚀 Starting custom rule test...\n⏳ Sending files to test engine...\n');
    
    try {
      // Prepare the request payload according to the sample JSON structure
      const requestPayload = {
        file_request: {
          filename: "test.yml",
          content: testFile.content
        },
        custom_rule: {
          rule_id: metadata.rule_id || selectedRuleId,
          rule_name: metadata.name || rule.name,
          content: pythonFile.content
        }
      };

      const response = await fetch('/api/custom-rule-test-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const result = await response.json();

      if (response.ok) {
        // Display the entire JSON response
        let output = `✅ Test completed successfully!\n`;
        output += `📁 File: ${result.filename}\n`;
        output += `📊 Status: ${result.status}\n\n`;
        output += `📋 FULL API RESPONSE:\n`;
        output += JSON.stringify(result, null, 2);

        setTestOutput(output);
      } else {
        // Handle API error response
        setTestOutput(`❌ Test failed: ${result.error || 'Unknown error occurred'}\n\nPlease check your rule implementation and try again.`);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestOutput(`❌ Network Error: ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setIsTesting(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen flex items-center justify-center`}>
        <div className="text-center text-red-400">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Development Workspace</h2>
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/assigned-rules')}
            className="bg-[var(--brand-yellow)] text-[var(--background)] px-6 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Back to Assigned Rules
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[var(--brand-yellow)] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-[var(--foreground)]">Setting up Development Workspace</h2>
          <p className="text-lg text-[var(--text-secondary)]">Initializing rule development environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-4 ${lexend.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] animate-fadeInUp">
          <Code size={32} className="inline-block mr-4 text-[var(--brand-yellow)]" />
          Development Workspace
        </h1>
        <button
          onClick={() => router.push('/assigned-rules')}
          className="inline-flex items-center gap-2 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold px-4 py-2 rounded-lg transition-all"
        >
          Back to Assigned Rules
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
        <RuleExplorer
          rulesInDev={rulesInDev}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRuleId={selectedRuleId}
          selectedFile={selectedFile}
          onFolderClick={handleFolderClick}
          onFileClick={handleFileClick}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        {/* Code Editor Area */}
        <div className={clsx(
          "bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] w-full flex flex-col overflow-hidden transition-all duration-300",
          "flex-grow"
        )}>
          <CodeEditor
            selectedFile={selectedFile}
            selectedRuleId={selectedRuleId}
            rulesInDev={rulesInDev}
            isSaving={isSaving}
            saveFeedback={saveFeedback}
            metadataForm={metadataForm}
            testOutput={testOutput}
            isTesting={isTesting}
            onEditorChange={handleEditorChange}
            onSaveFile={handleSaveFile}
            onMetadataFormChange={handleMetadataFormChange}
            onMetadataFormSave={handleMetadataFormSave}
            onRunTest={handleRunTest}
          />
        </div>
      </div>
    </div>
  );
}