import { useState } from 'react';
import clsx from 'clsx';
import { X, History, FileCode, Info, ClipboardList, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco is needed to display code snippets
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'ts':
      return 'javascript';
    case 'py':
      return 'python';
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

const TestHistoryModal = ({ rule, onClose }) => {
  const [selectedFileType, setSelectedFileType] = useState('code'); // 'code' or 'test'
  const [selectedCodeFile, setSelectedCodeFile] = useState(rule.codeFiles?.[0] || null);
  const [selectedTestFile, setSelectedTestFile] = useState(rule.testFiles?.[0] || null);

  if (!rule) return null;

  // Determine the active file to display in the editor
  const activeFile = selectedFileType === 'code' ? selectedCodeFile : selectedTestFile;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[var(--input-bg)] rounded-xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] flex flex-col border border-[var(--border-input)] relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center">
          <History size={30} className="mr-3 text-gray-400" />
          Test History: {rule.id} - {rule.name}
        </h2>
        
        <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mb-8 border-b border-[var(--border-input)] pb-6">
          <p className="flex items-center gap-2"><Info size={16} /> Status: <span className={clsx("font-semibold", {
            'text-green-400': rule.status === 'Test Passed',
            'text-red-400': rule.status === 'Test Failed',
            'text-gray-400': rule.status === 'Test Discarded',
          })}>{rule.status}</span></p>
          <p className="flex items-center gap-2"><Clock size={16} /> Added: <span className="font-semibold text-[var(--foreground)]">{rule.dateAdded}</span></p>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-8 pr-2">
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Info size={20} className="text-[var(--brand-yellow)]" />
                Developer Notes
              </h3>
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner text-[var(--text-secondary)] min-h-[150px]">
                <p>{rule.developerNotes}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <ClipboardList size={20} className="text-green-400" />
                Test Notes
              </h3>
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner text-[var(--text-secondary)] min-h-[150px]">
                <p>{rule.testNotes || 'No test notes available.'}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex mb-4 gap-4">
              <h3 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <FileCode size={20} className="text-[var(--brand-yellow)]" />
                Files
              </h3>
              
              <div className="flex gap-2 bg-[var(--background)] rounded-lg p-1 border border-[var(--border-input)]">
                <button
                  onClick={() => setSelectedFileType('code')}
                  className={clsx(
                    "px-4 py-2 rounded-md font-semibold text-sm transition-colors duration-200",
                    selectedFileType === 'code' ? "bg-[var(--brand-yellow)] text-[var(--background)]" : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]"
                  )}
                >
                  Code Files
                </button>
                <button
                  onClick={() => setSelectedFileType('test')}
                  className={clsx(
                    "px-4 py-2 rounded-md font-semibold text-sm transition-colors duration-200",
                    selectedFileType === 'test' ? "bg-[var(--brand-yellow)] text-[var(--background)]" : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]"
                  )}
                >
                  Test Files
                </button>
              </div>
            </div>

            <div className="flex h-[500px] bg-[var(--background)] rounded-lg border border-[var(--border-input)] overflow-hidden">
              <div className="w-1/4 p-4 border-r border-[var(--border-input)] overflow-y-auto custom-scrollbar">
                <h4 className="text-sm font-semibold mb-4 uppercase text-[var(--text-secondary)]">
                  {selectedFileType === 'code' ? 'Code Files' : 'Test Files'}
                </h4>
                
                {(selectedFileType === 'code' ? rule.codeFiles : rule.testFiles)?.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (selectedFileType === 'code') setSelectedCodeFile(file);
                      else setSelectedTestFile(file);
                    }}
                    className={clsx(
                      "w-full text-left p-3 mb-2 rounded-lg transition-colors duration-200",
                      "hover:bg-[var(--hover-bg)]",
                      activeFile?.name === file.name 
                        ? "bg-[var(--hover-bg)] text-[var(--brand-yellow)] font-semibold" 
                        : "text-[var(--foreground)]"
                    )}
                  >
                    {file.name}
                  </button>
                )) || (
                  <p className="text-sm text-[var(--text-secondary)]">No {selectedFileType} files found.</p>
                )}
              </div>

              {/* Code Editor*/}
              <div className="w-3/4 flex-grow p-4">
                {activeFile ? (
                  <MonacoEditor
                    height="100%"
                    language={getFileIcon(activeFile.name)}
                    theme="vs-dark"
                    value={activeFile.content}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      fontSize: 14,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
                    Select a file to view its content.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryModal;