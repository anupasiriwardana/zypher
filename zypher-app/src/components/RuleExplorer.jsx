import React from 'react';
import clsx from 'clsx';
import {
  Search, 
  Folder, 
  FolderOpen, 
  ChevronLeft,
  FileCode,
  FileCode2,
  FileJson,
  FileType,
  FileText
} from 'lucide-react';

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

const RuleExplorer = ({
  rulesInDev,
  searchTerm,
  setSearchTerm,
  selectedRuleId,
  selectedFile,
  onFolderClick,
  onFileClick,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}) => {
  const filteredRules = rulesInDev.filter(rule => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return rule.id.toLowerCase().includes(lowerSearchTerm) || 
           rule.name.toLowerCase().includes(lowerSearchTerm);
  });

  return (
    <div 
      className={clsx(
        "bg-[var(--input-bg)] rounded-xl shadow-2xl border border-[var(--border-input)] flex flex-col transition-all duration-300 relative",
        isSidebarCollapsed ? "w-[60px] md:w-[70px] p-2" : "w-full md:w-[35%] lg:w-[25%] p-6"
      )}
    >
      {/* Collapse/Expand Button */}
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={clsx(
          "absolute top-4 transition-all duration-300 z-10 p-2 rounded-full",
          "bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]",
          isSidebarCollapsed ? "-right-4 rotate-0" : "-right-4 rotate-180"
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
                onClick={() => onFolderClick(rule.id)}
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
                      onClick={(e) => { e.stopPropagation(); onFileClick(file); }}
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
  );
};

export default RuleExplorer;
