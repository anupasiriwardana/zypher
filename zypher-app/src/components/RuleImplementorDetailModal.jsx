// this modal appears when we click a row of "rules to test" table
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { X, FileCode, Clock, Info, Play, Code } from 'lucide-react';
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

const RuleDetailsModal = ({ rule, onClose, onStartTesting }) => {
  const [selectedFile, setSelectedFile] = useState(rule.codeFiles[0] || null);

  if (!rule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[var(--input-bg)] rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--border-input)] relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center">
          <FileCode size={30} className="mr-3 text-[var(--brand-yellow)]" />
          Rule Details: {rule.id} - {rule.name}
        </h2>
        
        <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mb-8 border-b border-[var(--border-input)] pb-6">
          <p className="flex items-center gap-2"><Info size={16} /> Status: <span className="font-semibold text-blue-400">{rule.status}</span></p>
          <p className="flex items-center gap-2"><Clock size={16} /> Added: <span className="font-semibold text-[var(--foreground)]">{rule.dateAdded}</span></p>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-8 pr-2">
          
          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Info size={20} className="text-[var(--brand-yellow)]" />
              Developer Notes
            </h3>
            <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner text-[var(--text-secondary)]">
              <p>{rule.developerNotes}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Code size={20} className="text-[var(--brand-yellow)]" />
              Code Files
            </h3>
            
            <div className="flex h-[400px] bg-[var(--background)] rounded-lg border border-[var(--border-input)] overflow-hidden">
              <div className="w-1/4 p-4 border-r border-[var(--border-input)] overflow-y-auto custom-scrollbar">
                <h4 className="text-sm font-semibold mb-4 uppercase text-[var(--text-secondary)]">Files</h4>
                {rule.codeFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedFile(file)}
                    className={clsx(
                      "w-full text-left p-3 mb-2 rounded-lg transition-colors duration-200",
                      selectedFile?.name === file.name 
                        ? "bg-[var(--hover-bg)] text-[var(--brand-yellow)] font-semibold" 
                        : "text-[var(--foreground)]"
                    )}
                  >
                    {file.name}
                  </button>
                ))}
              </div>

              {/* Code Editor*/}
              <div className="w-3/4 flex-grow p-4">
                {selectedFile ? (
                  <MonacoEditor
                    height="100%"
                    language={getFileIcon(selectedFile.name)}
                    theme="vs-dark"
                    value={selectedFile.content}
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

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onStartTesting(rule.id)}
            className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
          >
            <Play size={20} />
            Start Testing
          </button>
        </div>

      </div>
    </div>
  );
};

export default RuleDetailsModal;