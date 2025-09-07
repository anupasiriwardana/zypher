"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lexend } from 'next/font/google';
import { TestTube, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import TestRuleExplorer from '@/components/TestRuleExplorer';
import TestFileEditor from '@/components/TestFileEditor';
import RejectRuleModal from '@/components/RejectRuleModal';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Default test YAML template for new rules
const defaultTestYaml = `# Test pipeline template
stages:
  - build
  - test
  - deploy

build-job:
  stage: build
  script:
    - echo "Building application"

test-job:
  stage: test
  script:
    - echo "Running tests"

deploy-job:
  stage: deploy
  script:
    - echo "Deploying application"`;

export default function TestingWorkspacePage() {
  const router = useRouter();
  
  // State management
  const [rulesForTesting, setRulesForTesting] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [testFileContent, setTestFileContent] = useState('');
  
  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [testOutput, setTestOutput] = useState('');

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Auto-dismiss save feedback after timeout
  useEffect(() => {
    if (saveFeedback) {
      const timeout = saveFeedback.type === 'success' ? 5000 : 8000;
      const timer = setTimeout(() => setSaveFeedback(null), timeout);
      return () => clearTimeout(timer);
    }
  }, [saveFeedback]);

  // Initialize workspace with real API data
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await fetchRulesForTesting();
        
      } catch (error) {
        console.error('Error initializing testing workspace:', error);
        setError('Failed to load rules for testing');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspace();
  }, []);

  // Fetch rules ready for testing from API
  const fetchRulesForTesting = async () => {
    try {
      const response = await fetch('/api/custom-rule-file', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ruleFiles = data.ruleFiles || [];
        
        if (ruleFiles.length > 0) {
          // Transform API data to match component structure (simplified without metadata)
          const transformedRules = ruleFiles.map((ruleFile) => {
            return {
              id: ruleFile.rule_id,
              name: ruleFile.rule_name,
              ruleFileContent: ruleFile.file_content || '# No Python content available',
              testFileContent: ruleFile.yaml_test_file_content || defaultTestYaml,
              originalRequestId: ruleFile.request_id,
              ruleOwnerId: ruleFile.rule_owner_id,
              ruleDeveloperId: ruleFile.rule_developer_id,
              _id: ruleFile._id
            };
          });

          setRulesForTesting(transformedRules);
          
          // Auto-select first rule if available
          if (transformedRules.length > 0) {
            const firstRule = transformedRules[0];
            setSelectedRule(firstRule);
            setTestFileContent(firstRule.testFileContent);
          }
          
          setSaveFeedback({ 
            type: 'success', 
            message: `Loaded ${transformedRules.length} rule${transformedRules.length > 1 ? 's' : ''} ready for testing.` 
          });
        } else {
          setSaveFeedback({ 
            type: 'info', 
            message: 'No rules found ready for testing.' 
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rules for testing');
      }
    } catch (error) {
      console.error('Error fetching rules for testing:', error);
      setError(error.message || 'Failed to load rules for testing');
    }
  };

  // Handle rule selection
  const handleRuleSelect = (rule) => {
    setSelectedRule(rule);
    setTestFileContent(rule.testFileContent);
    setTestOutput(''); // Clear previous test output
    setSaveFeedback(null);
  };

  // Handle save test file
  const handleSaveTest = async () => {
    if (!selectedRule) {
      setSaveFeedback({ type: 'error', message: 'No rule selected to save test file.' });
      return;
    }
    
    setIsSaving(true);
    setSaveFeedback(null);
    
    try {
      // Call API to update the test file content
      const response = await fetch('/api/custom-rule-file', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleId: selectedRule.id,
          testFileContent: testFileContent
        }),
      });

      if (response.ok) {
        // Update the rule's test content in state
        setRulesForTesting(prevRules => 
          prevRules.map(rule => 
            rule.id === selectedRule.id 
              ? { ...rule, testFileContent }
              : rule
          )
        );

        // Update selected rule as well
        setSelectedRule(prevRule => ({
          ...prevRule,
          testFileContent
        }));
        
        setSaveFeedback({ 
          type: 'success', 
          message: 'Test file saved successfully!' 
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save test file');
      }
      
    } catch (error) {
      console.error('Save test error:', error);
      setSaveFeedback({ 
        type: 'error', 
        message: error.message || 'Failed to save test file. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle run test
  const handleRunTest = async () => {
    if (!selectedRule || !testFileContent.trim()) {
      setTestOutput('❌ Error: No test file content to test');
      return;
    }

    setIsTesting(true);
    setTestOutput('🚀 Starting rule test...\n⏳ Sending test file to rule engine...\n');
    
    try {
      // Prepare the request body for custom rule test scan
      const requestBody = {
        file_request: {
          filename: "test.yaml",
          content: testFileContent
        },
        custom_rule: {
          rule_id: selectedRule.id,
          rule_name: selectedRule.name,
          content: selectedRule.ruleFileContent
        }
      };

      // Call the custom rule test scan API
      const response = await fetch('/api/custom-rule-test-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const testResult = await response.json();
        
        // Display the full response in JSON format
        let output = `✅ Test completed successfully!\n\n`;
        output += `� FULL API RESPONSE:\n`;
        output += JSON.stringify(testResult, null, 2);
        
        setTestOutput(output);
        
        setSaveFeedback({ 
          type: 'success', 
          message: 'Rule test completed successfully!' 
        });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to run rule test';
        
        setTestOutput(`❌ Test Error: ${errorMessage}\n\nPlease check the rule implementation and test file content.`);
        
        setSaveFeedback({ 
          type: 'error', 
          message: `Test failed: ${errorMessage}` 
        });
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setTestOutput(`❌ Test Error: ${error.message}\n\nPlease check your network connection and try again.`);
      
      setSaveFeedback({ 
        type: 'error', 
        message: 'Failed to run test. Please try again.' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handle publish rule
  const handlePublish = async () => {
    if (!selectedRule) {
      setSaveFeedback({ type: 'error', message: 'No rule selected to publish.' });
      return;
    }

    try {
      // TODO: Add API call to update rule status to 'Active' or 'Published'
      // const response = await fetch('/api/custom-rule-file', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ruleId: selectedRule.id,
      //     ruleName: selectedRule.name,
      //     ruleStatus: 'Active',
      //     ruleFileContent: selectedRule.ruleFileContent,
      //     ruleOwnerId: selectedRule.ruleOwnerId,
      //     requestId: selectedRule.originalRequestId,
      //     yamlTestFileContent: testFileContent
      //   }),
      // });

      // TODO: Also update the CustomRuleRequest status to 'Published' or 'Completed'
      
      console.log('Publishing rule:', selectedRule.id);
      
      setSaveFeedback({ 
        type: 'success', 
        message: `Rule "${selectedRule.name}" has been approved and published successfully!` 
      });
      
      // Update rule status to published and remove from testing list
      setRulesForTesting(prevRules => 
        prevRules.filter(rule => rule.id !== selectedRule.id)
      );
      
      // Clear selection
      setSelectedRule(null);
      setTestFileContent('');
      setTestOutput('');
      
    } catch (error) {
      console.error('Publish error:', error);
      setSaveFeedback({ 
        type: 'error', 
        message: 'Failed to publish rule. Please try again.' 
      });
    }
  };

  // Handle reject rule
  const handleReject = async (rejectionReason) => {
    if (!selectedRule) {
      setSaveFeedback({ type: 'error', message: 'No rule selected to reject.' });
      return;
    }

    try {
      const response = await fetch('/api/custom-rule-file-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ruleId: selectedRule.id,
            requestId: selectedRule.originalRequestId,
            requestStatus: "Under Modification",
            ruleFileStatus: "Under development",
            rejectedReason: rejectionReason
        }),
      });

      if (response.ok) {
        setSaveFeedback({ 
          type: 'success', 
          message: `Rule "${selectedRule.name}" has been sent back to the developer for modifications.` 
        });
        
        // Clear current selection and states
        setSelectedRule(null);
        setTestFileContent('');
        setTestOutput('');
        
        // Refetch rules to update the list
        await fetchRulesForTesting();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject rule');
      }
      
    } catch (error) {
      console.error('Reject error:', error);
      setSaveFeedback({ 
        type: 'error', 
        message: error.message || 'Failed to reject rule. Please try again.' 
      });
      throw error; // Re-throw to handle in modal
    }
  };

  // Handle open reject modal
  const handleOpenRejectModal = () => {
    setIsRejectModalOpen(true);
  };

  // Handle close reject modal
  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  // Error state
  if (error) {
    return (
      <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen flex items-center justify-center`}>
        <div className="text-center text-red-400">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Testing Workspace</h2>
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/view-requests')}
            className="bg-[var(--brand-yellow)] text-[var(--background)] px-6 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Back to View Requests
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
          <h2 className="text-2xl font-semibold mb-2 text-[var(--foreground)]">Setting up Testing Workspace</h2>
          <p className="text-lg text-[var(--text-secondary)]">Loading rules ready for testing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-4 ${lexend.className} min-h-screen max-w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] animate-fadeInUp">
          <TestTube size={32} className="inline-block mr-4 text-[var(--brand-yellow)]" />
          Testing Workspace
        </h1>
        <button
          onClick={() => router.push('/view-requests')}
          className="inline-flex items-center gap-2 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <ArrowLeft size={16} />
          Back to View Requests
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] max-w-full overflow-hidden">
        <TestRuleExplorer
          rulesForTesting={rulesForTesting}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRuleId={selectedRule?.id}
          onRuleSelect={handleRuleSelect}
        />

        {/* Test Editor Area */}
        <div className="bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] flex flex-col overflow-hidden transition-all duration-300 flex-grow min-w-0">
          <TestFileEditor
            selectedRule={selectedRule}
            testFileContent={testFileContent}
            setTestFileContent={setTestFileContent}
            ruleFileContent={selectedRule?.ruleFileContent}
            testOutput={testOutput}
            isTesting={isTesting}
            isSaving={isSaving}
            saveFeedback={saveFeedback}
            onRunTest={handleRunTest}
            onSaveTest={handleSaveTest}
            onPublish={handlePublish}
            onReject={handleOpenRejectModal}
          />
        </div>
      </div>

      {/* Reject Rule Modal */}
      <RejectRuleModal
        isOpen={isRejectModalOpen}
        onClose={handleCloseRejectModal}
        selectedRule={selectedRule}
        onReject={handleReject}
      />
    </div>
  );
}