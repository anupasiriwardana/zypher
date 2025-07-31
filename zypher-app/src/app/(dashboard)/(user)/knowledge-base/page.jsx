'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, BookOpen, ScrollText, FileCode, Lightbulb, Link, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { Lexend } from 'next/font/google';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const SectionHeader = ({ icon: Icon, title, className }) => (
  <h2 className={clsx("text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3", className)}>
    {Icon && <Icon size={28} className="text-[var(--brand-yellow)]" />}
    {title}
  </h2>
);


const CollapsibleCard = ({ title, content, isExpanded, onToggle, icon: Icon, badge, className }) => (
  <div className={clsx("bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md", className)}>
    <button
      className="w-full text-left flex items-center justify-between gap-x-4 flex-wrap min-w-0 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-x-3 min-w-0 flex-grow">
        {Icon && <Icon size={24} className="text-[var(--brand-yellow)] shrink-0" />}
        <h3 className="text-xl font-semibold text-[var(--foreground)] break-words flex-grow">{title}</h3>
        {badge && (
          <span className={clsx(
            "px-3 py-1 rounded-full text-xs font-semibold shrink-0",
            badge === 'CRITICAL' && 'bg-red-600/20 text-red-400',
            badge === 'HIGH' && 'bg-orange-600/20 text-orange-400',
            badge === 'MEDIUM' && 'bg-yellow-600/20 text-yellow-400',
            badge === 'LOW' && 'bg-green-600/20 text-green-400',
            badge === 'POSITIVE' && 'bg-green-500/20 text-green-300',
            badge === 'INFORMATIONAL' && 'bg-blue-600/20 text-blue-400',
            !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'POSITIVE', 'INFORMATIONAL'].includes(badge) && 'bg-gray-600/20 text-gray-400'
          )}>
            {badge}
          </span>
        )}
      </div>
      <span className="ml-auto shrink-0 text-[var(--text-secondary)]">
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </span>
    </button>

    {isExpanded && (
      <div className="mt-4 pt-4 border-t border-[var(--border-input)] animate-fadeIn">
        {content}
      </div>
    )}
  </div>
);


export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('vulnerabilities'); 
  const [expandedItems, setExpandedItems] = useState(new Set()); 

  // Rule metadata fetched from API
  const [vulnRuleMetadata, setVulnRuleMetadata] = useState([]);
  const [bpRuleMetadata, setBpRuleMetadata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mockCustomRules = useMemo(() => ([
    { id: 'CUST-VULN-001', name: 'Custom API Key Exposure Check', description: 'Detects hardcoded API keys in specific configuration files.', severity: 'CRITICAL', recommendation: 'Use environment variables or a secret management service.', type: 'vulnerability' },
    { id: 'CUST-BP-001', name: 'Standardized Logging Format', description: 'Ensures all application logs adhere to a predefined JSON format for easier parsing.', severity: 'MEDIUM', recommendation: 'Implement a logging library with structured logging capabilities.', type: 'best-practice' },
    { id: 'CUST-VULN-002', name: 'Unencrypted Database Connection Strings', description: 'Flags database connection strings that do not enforce SSL/TLS encryption.', severity: 'HIGH', recommendation: 'Always use encrypted connections to databases.', type: 'vulnerability' },
  ]), []);

  const mockImportantArticles = useMemo(() => ([
    { id: 'ART-VULN-001', title: 'Top 10 OWASP Web Application Security Risks', description: 'A comprehensive guide to the most critical web application security risks.', url: 'https://owasp.org/www-project-top-ten/', type: 'vulnerability' },
    { id: 'ART-BP-001', title: 'Principles of Secure Software Development', description: 'Fundamental principles for building secure software from the ground up.', url: 'https://www.example.com/secure-sdlc-principles', type: 'best-practice' },
    { id: 'ART-VULN-002', title: 'Understanding SQL Injection Attacks', description: 'Detailed explanation of SQL injection vulnerabilities and prevention techniques.', url: 'https://www.example.com/sql-injection-guide', type: 'vulnerability' },
    { id: 'ART-BP-002', title: 'Best Practices for API Security', description: 'Guidelines for designing and implementing secure APIs.', url: 'https://www.example.com/api-security-best-practices', type: 'best-practice' },
  ]), []);


  useEffect(() => {
    const fetchRuleMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/rule-metadata', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch rule metadata');
        }

        setVulnRuleMetadata(data.vuln_rule_metadata || []);
        setBpRuleMetadata(data.bp_rule_metadata || []);

      } catch (err) {
        console.error('Error fetching rule metadata:', err);
        setError(err.message || 'An unexpected error occurred while fetching rules.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRuleMetadata();
  }, [])


  const filteredContent = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filterItems = (items, itemType) => {
      return items.filter(item => {
        const matchesSearch = (item.name || item.title || item.rule_id || item.description || '').toLowerCase().includes(lowerCaseSearchTerm);
        const matchesTab = (item.type === itemType); 
        return matchesSearch && matchesTab;
      });
    };

    const currentTabType = activeTab === 'vulnerabilities' ? 'vulnerability' : 'best-practice';

    return {
      rules: activeTab === 'vulnerabilities'
        ? vulnRuleMetadata.filter(rule => (rule.name || rule.rule_id || '').toLowerCase().includes(lowerCaseSearchTerm))
        : bpRuleMetadata.filter(rule => (rule.name || rule.rule_id || '').toLowerCase().includes(lowerCaseSearchTerm)),
      customRules: filterItems(mockCustomRules, currentTabType),
      articles: filterItems(mockImportantArticles, currentTabType),
    };
  }, [searchTerm, activeTab, vulnRuleMetadata, bpRuleMetadata, mockCustomRules, mockImportantArticles]);

  const toggleExpansion = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className={clsx("min-h-screen bg-[var(--background-dark)] text-white p-8 flex items-center justify-center", lexend.className)}>
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-yellow)]" />
        <p className="ml-3 text-lg text-[var(--text-secondary)]">Loading knowledge base...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx("min-h-screen bg-[var(--background-dark)] text-white p-8 flex flex-col items-center justify-center text-center", lexend.className)}>
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Knowledge Base</h2>
        <p className="text-lg text-[var(--text-secondary)]">{error}</p>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen bg-[var(--background-dark)] text-white p-1", lexend.className)}>
      <div className="max-w-7xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[var(--foreground)] mb-6 leading-tight">
          <BookOpen className="inline-block mr-4 text-[var(--brand-yellow)]" size={48} />
          Security Knowledge Base
        </h1>
        <p className="text-lg text-[var(--text-secondary)] text-center max-w-3xl mx-auto mb-12">
          Your comprehensive library for understanding and mitigating security vulnerabilities and implementing best practices.
        </p>

        {/* Central Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-24">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={24} />
          <input
            type="text"
            placeholder="Search rules, articles, and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-3 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-300 text-lg shadow-lg"
          />
        </div>

        {/* Tabs for Vulnerabilities and Best Practices */}
        <div className="flex justify-center border-b border-[var(--border-input)] mb-10">
          <button
            className={clsx(
              "py-4 px-8 text-xl font-medium transition-colors duration-200",
              activeTab === 'vulnerabilities'
                ? "border-b-4 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab('vulnerabilities')}
          >
            Vulnerabilities
          </button>
          <button
            className={clsx(
              "py-4 px-8 text-xl font-medium transition-colors duration-200",
              activeTab === 'best-practices'
                ? "border-b-4 border-[var(--brand-yellow)] text-[var(--brand-yellow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            )}
            onClick={() => setActiveTab('best-practices')}
          >
            Best Practices
          </button>
        </div>

        <div className="space-y-12">
          {activeTab === 'vulnerabilities' && (
            <div className="animate-fadeIn space-y-12">
              <section>
                <SectionHeader icon={FileCode} title="Vulnerability Rules" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.rules.length > 0 ? (
                    filteredContent.rules.map((rule) => (
                      <CollapsibleCard
                        key={rule.rule_id}
                        title={`${rule.rule_id}: ${rule.name}`}
                        badge={rule.severity?.toUpperCase()}
                        isExpanded={expandedItems.has(rule.rule_id)}
                        onToggle={() => toggleExpansion(rule.rule_id)}
                        icon={AlertCircle}
                        content={
                          <div className="text-[var(--text-secondary)] space-y-2">
                            <p className="text-base">{rule.description}</p>
                            {rule.recommendation && (
                              <p className="text-sm">
                                <strong className="text-[var(--brand-yellow)]">Recommendation: </strong>
                                {rule.recommendation}
                              </p>
                            )}
                            {rule.example_code && (
                              <div className="bg-[var(--background)] p-3 rounded text-xs overflow-x-auto custom-scrollbar whitespace-pre-wrap font-mono mt-2">
                                <code>{rule.example_code}</code>
                              </div>
                            )}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center md:col-span-2">No matching vulnerability rules found.</p>
                  )}
                </div>
              </section>

              <section>
                <SectionHeader icon={FileCode} title="Custom Vulnerability Rules" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.customRules.length > 0 ? (
                    filteredContent.customRules.map((rule) => (
                      <CollapsibleCard
                        key={rule.id}
                        title={`${rule.id}: ${rule.name}`}
                        badge={rule.severity?.toUpperCase()}
                        isExpanded={expandedItems.has(rule.id)}
                        onToggle={() => toggleExpansion(rule.id)}
                        icon={AlertCircle}
                        content={
                          <div className="text-[var(--text-secondary)] space-y-2">
                            <p className="text-base">{rule.description}</p>
                            {rule.recommendation && (
                              <p className="text-sm">
                                <strong className="text-[var(--brand-yellow)]">Recommendation: </strong>
                                {rule.recommendation}
                              </p>
                            )}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center md:col-span-2">No matching custom vulnerability rules found.</p>
                  )}
                </div>
              </section>

              {/* Important Vulnerability Articles Section */}
              <section>
                <SectionHeader icon={ScrollText} title="Important Vulnerability Articles" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.articles.length > 0 ? (
                    filteredContent.articles.map((article) => (
                      <CollapsibleCard
                        key={article.id}
                        title={article.title}
                        isExpanded={expandedItems.has(article.id)}
                        onToggle={() => toggleExpansion(article.id)}
                        icon={Link}
                        content={
                          <div className="text-[var(--text-secondary)] space-y-2">
                            <p className="text-base">{article.description}</p>
                            {article.url && (
                              <p className="text-sm">
                                <strong className="text-[var(--brand-yellow)]">Read More: </strong>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:underline">
                                  {article.url}
                                </a>
                              </p>
                            )}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center md:col-span-2">No matching vulnerability articles found.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'best-practices' && (
            <div className="animate-fadeIn space-y-12">
              {/* Best Practice Rules Section */}
              <section>
                <SectionHeader icon={FileCode} title="Best Practice Rules" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.rules.length > 0 ? (
                    filteredContent.rules.map((rule) => (
                      <CollapsibleCard
                        key={rule.rule_id}
                        title={`${rule.rule_id}: ${rule.name}`}
                        badge={rule.severity?.toUpperCase()}
                        isExpanded={expandedItems.has(rule.rule_id)}
                        onToggle={() => toggleExpansion(rule.rule_id)}
                        icon={CheckCircle}
                        content={
                          <div className="text-[var(--text-secondary)] space-y-2">
                            <p className="text-base">{rule.description}</p>
                            {rule.recommendation && (
                              <p className="text-sm">
                                <strong className="text-[var(--brand-yellow)]">Recommendation: </strong>
                                {rule.recommendation}
                              </p>
                            )}
                            {rule.example_code && (
                              <div className="bg-[var(--background)] p-3 rounded text-xs overflow-x-auto custom-scrollbar whitespace-pre-wrap font-mono mt-2">
                                <code>{rule.example_code}</code>
                              </div>
                            )}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center md:col-span-2">No matching best practice rules found.</p>
                  )}
                </div>
              </section>

              {/* Custom Best Practice Rules Section */}
              <section>
                <SectionHeader icon={FileCode} title="Custom Best Practice Rules" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.customRules.length > 0 ? (
                    filteredContent.customRules.map((rule) => (
                      <CollapsibleCard
                        key={rule.id}
                        title={`${rule.id}: ${rule.name}`}
                        badge={rule.severity?.toUpperCase()}
                        isExpanded={expandedItems.has(rule.id)}
                        onToggle={() => toggleExpansion(rule.id)}
                        icon={CheckCircle}
                        content={
                          <div className="text-[var(--text-secondary)] space-y-2">
                            <p className="text-base">{rule.description}</p>
                            {rule.recommendation && (
                              <p className="text-sm">
                                <strong className="text-[var(--brand-yellow)]">Recommendation: </strong>
                                {rule.recommendation}
                              </p>
                            )}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center md:col-span-2">No matching custom best practice rules found.</p>
                  )}
                </div>
              </section>

              {/* Important Best Practice Articles Section */}
              <section>
                <SectionHeader icon={ScrollText} title="Important Best Practice Articles" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.articles.length > 0 ? (
                    filteredContent.articles.map((article) => (
                      <CollapsibleCard
                        key={article.id}
                        title={article.title}
                        isExpanded={expandedItems.has(article.id)}
                        onToggle={() => toggleExpansion(article.id)}
                        icon={Link}
                        content={
                          <div className="text-[var(--text-secondary)] space-y-2">
                            <p className="text-base">{article.description}</p>
                            {article.url && (
                              <p className="text-sm">
                                <strong className="text-[var(--brand-yellow)]">Read More: </strong>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:underline">
                                  {article.url}
                                </a>
                              </p>
                            )}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center md:col-span-2">No matching best practice articles found.</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}