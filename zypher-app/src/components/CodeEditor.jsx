import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import {
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  FileCode2,
  FileCode,
  FileJson,
  FileType,
  FileText
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

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

const CodeEditor = ({
  selectedFile,
  selectedRuleId,
  rulesInDev,
  isSaving,
  saveFeedback,
  metadataForm,
  testOutput,
  isTesting,
  onEditorChange,
  onSaveFile,
  onMetadataFormChange,
  onMetadataFormSave,
  onRunTest
}) => {
  const currentFileContent = selectedFile ? selectedFile.content : '';
  const currentFileLanguage = selectedFile ? selectedFile.language : 'plaintext';

  if (!selectedFile) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center space-y-6">
        <FileCode2 size={128} className="text-[var(--text-secondary)] opacity-30" />
        <h2 className="text-3xl font-bold text-[var(--foreground)]">Select a File to Edit</h2>
        <p className="text-xl text-[var(--text-secondary)] max-w-xl">
          Choose a rule folder from the left sidebar, then click on a file to open it in the editor.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Editor Header */}
      <div className="flex justify-between items-center border-b border-[var(--border-input)] pb-4 mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
          {getFileIcon(selectedFile.name)} {selectedFile.name}
          <span className="text-sm text-[var(--text-secondary)] ml-2">({selectedRuleId})</span>
        </h2>
        {selectedFile.name !== 'metadata.json' && (
          <button
            onClick={() => onSaveFile()}
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
        <form onSubmit={onMetadataFormSave} className="mb-4 p-4 rounded-lg border border-[var(--border-input)] bg-[var(--background)] shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Rule ID</label>
              <input 
                type="text" 
                name="rule_id" 
                value={metadataForm.rule_id || ''} 
                onChange={onMetadataFormChange} 
                className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--hover-bg)] text-[var(--text-secondary)] cursor-not-allowed opacity-60" 
                disabled 
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[var(--foreground)]">Rule Name</label>
              <input 
                type="text" 
                name="name" 
                value={metadataForm.name || ''} 
                onChange={onMetadataFormChange} 
                className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)]" 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-[var(--foreground)]">Description</label>
              <textarea 
                name="description" 
                value={metadataForm.description || ''} 
                onChange={onMetadataFormChange} 
                className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)]" 
                rows={2} 
                required 
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[var(--foreground)]">Severity</label>
              <select 
                name="severity" 
                value={metadataForm.severity || ''} 
                onChange={onMetadataFormChange} 
                className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200" 
                required
              >
                <option value="">Select Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Info">Info</option>
              </select>
            </div>
            {/* <div>
              <label className="block font-semibold mb-1 text-[var(--foreground)]">Status</label>
              <select 
                name="status" 
                value={metadataForm.status || ''} 
                onChange={onMetadataFormChange} 
                className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200" 
                required
              >
                <option value="">Select Status</option>
                <option value="Under Development">Under Development</option>
                <option value="Ready for Testing">Ready for Testing</option>
                <option value="Being Tested">Being Tested</option>
                <option value="Approved">Approved</option>
                <option value="Successfully Published">Successfully Published</option>
              </select>
            </div> */}
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-[var(--foreground)]">Remediation</label>
              <textarea 
                name="remediation" 
                value={metadataForm.remediation || ''} 
                onChange={onMetadataFormChange} 
                className="w-full p-2 rounded border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)]" 
                rows={2} 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-2 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
          >
            Save Metadata
          </button>
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
              onChange={onEditorChange}
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
          <TestConsole
            testOutput={testOutput}
            isTesting={isTesting}
            onRunTest={onRunTest}
          />
        </>
      ) : (
        <div className="flex-grow rounded-lg overflow-hidden border border-[var(--border-input)] shadow-inner w-[90%]">
          <MonacoEditor
            height="100%"
            width="100%"
            language={currentFileLanguage}
            theme="vs-dark"
            value={currentFileContent}
            onChange={onEditorChange}
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
    </>
  );
};

// Test Console Component
const TestConsole = ({ testOutput, isTesting, onRunTest }) => {
  return (
    <div className="bg-[var(--background)] border border-[var(--border-input)] rounded-lg p-4 shadow-inner w-[90%] mb-4">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={onRunTest}
          className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-2 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
          disabled={isTesting}
        >
          {isTesting ? <Loader2 size={18} className="animate-spin" /> : <FileCode2 size={18} />}
          {isTesting ? 'Running...' : 'Run Test'}
        </button>
        <span className="text-[var(--text-secondary)] text-sm">Test your pipeline config against the rule logic.</span>
      </div>
      <div className="bg-black/60 text-green-300 font-mono rounded p-3 min-h-[80px] max-h-60 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {testOutput || 'No test run yet.'}
      </div>
    </div>
  );
};

export default CodeEditor;
