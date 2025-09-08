"use client";

import React from 'react';
import { Search, ChevronRight, FileText, TestTube } from 'lucide-react';

const TestRuleExplorer = ({ 
  rulesForTesting, 
  searchTerm, 
  setSearchTerm, 
  selectedRuleId, 
  onRuleSelect 
}) => {
  const filteredRules = rulesForTesting.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 min-w-80 max-w-80 bg-[var(--input-bg)] border border-[var(--border-input)] rounded-xl p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Rules for Testing</h3>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--background)] border border-[var(--border-input)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand-yellow)] transition-colors"
          />
        </div>
      </div>

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => onRuleSelect(rule)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-[var(--brand-yellow)] ${
                selectedRuleId === rule.id
                  ? 'border-[var(--brand-yellow)] bg-[var(--brand-yellow)]/10'
                  : 'border-[var(--border-input)] bg-[var(--card-bg)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-[var(--brand-yellow)]" />
                    <h4 className="font-medium text-[var(--foreground)] text-sm truncate">
                      {rule.name}
                    </h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    ID: {rule.id}
                  </p>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`ml-2 text-[var(--text-secondary)] transition-transform ${
                    selectedRuleId === rule.id ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-[var(--text-secondary)] py-8">
            <TestTube size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No rules match your search' : 'No rules available for testing'}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-[var(--border-input)]">
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <div className="flex justify-between">
            <span>Total Rules:</span>
            <span className="font-medium">{rulesForTesting.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRuleExplorer;
