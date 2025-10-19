"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lexend } from "next/font/google";
import { TestTube, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import TestRuleExplorer from "@/components/TestRuleExplorer";
import TestFileEditor from "@/components/TestFileEditor";
import RejectRuleModal from "@/components/RejectRuleModal";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
  const searchParams = useSearchParams();

  const [rulesForTesting, setRulesForTesting] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [testFileContent, setTestFileContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [testOutput, setTestOutput] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("custom"); 

  useEffect(() => {
    if (saveFeedback) {
      const timeout = saveFeedback.type === "success" ? 5000 : 8000;
      const timer = setTimeout(() => setSaveFeedback(null), timeout);
      return () => clearTimeout(timer);
    }
  }, [saveFeedback]);

  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchRulesForTesting();
      } catch (error) {
        console.error("Error initializing testing workspace:", error);
        setError("Failed to load rules for testing");
      } finally {
        setIsLoading(false);
      }
    };
    initializeWorkspace();
  }, []);

  useEffect(() => {
    const ruleRequestId = searchParams.get("requestId");
    if (ruleRequestId && rulesForTesting.length > 0) {
      const matchingRule = rulesForTesting.find(
        (rule) => rule.originalRequestId === ruleRequestId
      );
      if (matchingRule) {
        setSelectedRule(matchingRule);
        setTestFileContent(matchingRule.testFileContent);
      }
    }
  }, [rulesForTesting, searchParams]);

  const fetchRulesForTesting = async () => {
    try {
      const response = await fetch("/api/custom-rule-file", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      // Safely parse JSON responses (server might return empty HTML on redirects/errors)
      // Move helper to outer scope so other handlers can reuse

      if (response.ok) {
        const data = await parseJsonSafely(response) || {};
        const ruleFiles = data.ruleFiles || [];

        

        if (ruleFiles.length > 0) {
          const transformedRules = ruleFiles.map((ruleFile) => ({
            id: ruleFile.rule_id,
            name: ruleFile.rule_name,
            ruleFileContent:
              ruleFile.file_content || "# No Python content available",
            testFileContent: ruleFile.yaml_test_file_content || defaultTestYaml,
            originalRequestId: ruleFile.request_id,
            ruleOwnerId: ruleFile.rule_owner_id,
            ruleDeveloperId: ruleFile.rule_developer_id,
            _id: ruleFile._id,
          }));

          setRulesForTesting(transformedRules);

          const firstRule = transformedRules[0];
          setSelectedRule(firstRule);
          setTestFileContent(firstRule.testFileContent);

          setSaveFeedback({
            type: "success",
            message: `Loaded ${transformedRules.length} rule${
              transformedRules.length > 1 ? "s" : ""
            } ready for testing.`,
          });
        } else {
          setSaveFeedback({
            type: "info",
            message: "No rules found ready for testing.",
          });
        }
      } else {
        const data = await parseJsonSafely(response);
        const errorMessage = (data && data.error) || response.statusText || `Request failed with status ${response.status}`;
        throw new Error(errorMessage || "Failed to fetch rules for testing");
      }
    } catch (error) {
      console.error("Error fetching rules for testing:", error);
      setError(error.message || "Failed to load rules for testing");
    }
  };

  // Helper: parse response body as JSON but tolerate empty/non-JSON bodies
  const parseJsonSafely = async (res) => {
    try {
      const text = await res.text();
      if (!text) return null;
      return JSON.parse(text);
    } catch (err) {
      console.warn('Failed to parse JSON response', err);
      return null;
    }
  };

  const handleRuleSelect = (rule) => {
    setSelectedRule(rule);
    setTestFileContent(rule.testFileContent);
    setTestOutput("");
    setSaveFeedback(null);
  };

  const handleSaveTest = async () => {
    if (!selectedRule) {
      setSaveFeedback({
        type: "error",
        message: "No rule selected to save test file.",
      });
      return;
    }

    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const response = await fetch("/api/custom-rule-file", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: selectedRule.id,
          testFileContent: testFileContent,
        }),
      });

      if (response.ok) {
        setRulesForTesting((prevRules) =>
          prevRules.map((rule) =>
            rule.id === selectedRule.id ? { ...rule, testFileContent } : rule
          )
        );

        setSelectedRule((prevRule) => ({
          ...prevRule,
          testFileContent,
        }));

        setSaveFeedback({
          type: "success",
          message: "Test file saved successfully!",
        });
      } else {
        const data = await parseJsonSafely(response);
        const errorMessage = (data && data.error) || response.statusText || `Request failed with status ${response.status}`;
        throw new Error(errorMessage || "Failed to save test file");
      }
    } catch (error) {
      console.error("Save test error:", error);
      setSaveFeedback({
        type: "error",
        message: error.message || "Failed to save test file. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (!selectedRule || !testFileContent.trim()) {
      setTestOutput("❌ Error: No test file content to test");
      return;
    }

    setIsTesting(true);
    setTestOutput(
      "🚀 Starting rule test...\n⏳ Sending test file to rule engine...\n"
    );

    try {
      const requestBody = {
        file_request: {
          filename: "test.yaml",
          content: testFileContent,
        },
        custom_rule: {
          rule_id: selectedRule.id,
          rule_name: selectedRule.name,
          content: selectedRule.ruleFileContent,
        },
      };

      const response = await fetch("/api/custom-rule-test-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const testResult = await response.json();
        let output = `✅ Test completed successfully!\n\n`;
        output += `📄 FULL API RESPONSE:\n`;
        output += JSON.stringify(testResult, null, 2);
        setTestOutput(output);

        setSaveFeedback({
          type: "success",
          message: "Rule test completed successfully!",
        });
      } else {
        const data = await parseJsonSafely(response);
        const errorMessage = (data && data.error) || response.statusText || "Failed to run rule test";
        setTestOutput(
          `❌ Test Error: ${errorMessage}\n\nPlease check the rule implementation and test file content.`
        );
        setSaveFeedback({
          type: "error",
          message: `Test failed: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestOutput(
        `❌ Test Error: ${error.message}\n\nPlease check your network connection and try again.`
      );
      setSaveFeedback({
        type: "error",
        message: "Failed to run test. Please try again.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // ✅ Modified handlePublish with dropdown category
  const handlePublish = async () => {
    if (!selectedRule) {
      setSaveFeedback({
        type: "error",
        message: "No rule selected to publish.",
      });
      return;
    }

    try {
      // 1️⃣ Call backend FastAPI to publish the rule
      const publishResponse = await fetch("/api/publish-custom-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule_id: selectedRule.id,
          collection: selectedCategory,
        }),
      });

      const publishData = await publishResponse.json();

      if (!publishResponse.ok) {
        throw new Error(
          publishData.detail || "Failed to publish rule in FastAPI backend"
        );
        setTimeout(async () => {
          setSelectedRule(null);
          setTestFileContent("");
          setTestOutput("");
          await fetchRulesForTesting();
        }, 4000);
      } else {
        const data = await parseJsonSafely(response);
        const errorMessage = (data && data.error) || response.statusText || `Publish failed with status ${response.status}`;
        throw new Error(errorMessage || "Failed to publish rule");
      }

      // 2️⃣ Update MongoDB rule file status
      const updateResponse = await fetch("/api/custom-rule-file-publish", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRule.originalRequestId,
          requestStatus: "Successfully Published",
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateData.error || "Failed to update rule status in database"
        );
      }

      // ✅ Both steps successful
      setSaveFeedback({
        type: "success",
        message: `Rule "${selectedRule.name}" has been approved and published successfully!`,
      });

      // Reset after 4 seconds
      setTimeout(async () => {
        setSelectedRule(null);
        setTestFileContent("");
        setTestOutput("");
        await fetchRulesForTesting();
      }, 4000);
    } catch (error) {
      console.error("Publish error:", error);
      setSaveFeedback({
        type: "error",
        message: error.message || "Failed to publish rule. Please try again.",
      });
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!selectedRule) {
      setSaveFeedback({
        type: "error",
        message: "No rule selected to reject.",
      });
      return;
    }

    try {
      const response = await fetch("/api/custom-rule-file-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: selectedRule.id,
          requestId: selectedRule.originalRequestId,
          requestStatus: "Under Modification",
          ruleFileStatus: "Under development",
          rejectedReason: rejectionReason,
        }),
      });

      if (response.ok) {
        setSaveFeedback({
          type: "success",
          message: `Rule "${selectedRule.name}" has been sent back to the developer for modifications.`,
        });

        setTimeout(async () => {
          setSelectedRule(null);
          setTestFileContent("");
          setTestOutput("");
          await fetchRulesForTesting();
        }, 4000);
      } else {
        const data = await parseJsonSafely(response);
        const errorMessage = (data && data.error) || response.statusText || `Reject failed with status ${response.status}`;
        throw new Error(errorMessage || "Failed to reject rule");
      }
    } catch (error) {
      console.error("Reject error:", error);
      setSaveFeedback({
        type: "error",
        message: error.message || "Failed to reject rule. Please try again.",
      });
      throw error;
    }
  };

  if (error) {
    return (
      <div
        className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center text-red-400">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Error Loading Testing Workspace
          </h2>
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/view-requests")}
            className="bg-[var(--brand-yellow)] text-[var(--background)] px-6 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Back to View Requests
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`p-6 md:p-8 lg:p-10 ${lexend.className} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-[var(--brand-yellow)] mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2 text-[var(--foreground)]">
            Setting up Testing Workspace
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Loading rules ready for testing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 lg:p-4 ${lexend.className} min-h-screen max-w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] animate-fadeInUp">
          <TestTube
            size={32}
            className="inline-block mr-4 text-[var(--brand-yellow)]"
          />
          Testing Workspace
        </h1>
        <button
          onClick={() => router.push("/view-requests")}
          className="inline-flex items-center gap-2 bg-[var(--button-bg)] text-[var(--foreground)] border border-[var(--border-input)] hover:border-[var(--brand-yellow)] hover:text-[var(--brand-yellow)] font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <ArrowLeft size={16} />
          Back to View Requests
        </button>
      </div>

      {/* Workspace */}
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] max-w-full overflow-hidden">
        <TestRuleExplorer
          rulesForTesting={rulesForTesting}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRuleId={selectedRule?.id}
          onRuleSelect={handleRuleSelect}
        />

        <div className="bg-[var(--input-bg)] p-6 rounded-xl shadow-2xl border border-[var(--border-input)] flex flex-col overflow-hidden transition-all duration-300 flex-grow min-w-0">
          <div className="flex justify-end items-center mb-4 gap-3">
            {/* ✅ Label + Dropdown */}
            <div className="flex flex-row items-center gap-3 text-right">
              <label
                htmlFor="collection"
                className="text-sm text-[var(--text-secondary)] mb-1"
              >
                Choose Rule Type
              </label>
              <select
                id="collection"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[var(--background)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
              >
                <option value="custom">Custom Rules</option>
                <option value="bestpractice">Best Practices</option>
                <option value="vulnerability">Vulnerabilities</option>
              </select>
            </div>
          </div>

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
            onReject={() => setIsRejectModalOpen(true)}
          />
        </div>
      </div>

      <RejectRuleModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        selectedRule={selectedRule}
        onReject={handleReject}
      />
    </div>
  );
}
