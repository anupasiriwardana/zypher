"use client"; 

import React, { use, useState } from 'react';
import { ChevronRight, Shield, Search, BookOpen, FileText, Zap, Users, CheckCircle, ArrowRight, Github, Upload, BarChart3, Settings, Eye, Download } from 'lucide-react';
import Link from "next/link";
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const FeaturesPage = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 'ci-cd-scanning',
      title: 'CI/CD Configuration Scanning',
      description: 'Zypher analyzes your CI/CD config files to detect security issues and policy violations — no pipeline integration needed.',
      icon: <Shield className="w-6 h-6" />,
      details: {
        overview: 'Our advanced static analysis engine examines YAML configuration files from popular CI/CD platforms including GitHub Actions, GitLab CI, and more. The scanner identifies misconfigurations, security vulnerabilities, and policy violations before they reach production.',
        capabilities: [
          'YAML syntax validation and structure analysis',
          'Security vulnerability detection in pipeline configurations',
          'Policy compliance checking against industry standards',
          'Misconfiguration identification and risk assessment',
          'Support for multiple CI/CD platforms (GitHub Actions, GitLab CI, Jenkins)',
          'Real-time scanning with instant feedback'
        ],
        benefits: [
          'Prevent security breaches before deployment',
          'Reduce pipeline failures due to misconfigurations',
          'Ensure compliance with DevSecOps best practices',
          'Save development time with early detection'
        ],
        useCases: [
          'Pre-commit hooks for development teams',
          'Automated security audits in enterprise environments',
          'Educational tools for DevOps training',
          'Compliance reporting for regulated industries'
        ]
      }
    },
    {
      id: 'static-analysis',
      title: 'Targeted Static Analysis',
      description: 'Zypher scans key code and config files to flag vulnerabilities and risky patterns — delivering fast, focused feedback without full codebase scans.',
      icon: <Search className="w-6 h-6" />,
      details: {
        overview: 'Unlike traditional scanners that analyze entire codebases, Zypher focuses on critical configuration files and infrastructure-as-code patterns. This targeted approach delivers faster results while maintaining comprehensive security coverage.',
        capabilities: [
          'Intelligent pattern recognition for security anti-patterns',
          'Context-aware analysis of configuration relationships',
          'Custom rule engine for organization-specific requirements',
          'Incremental scanning for large repositories',
          'Integration with version control systems',
          'Customizable severity levels and risk scoring'
        ],
        benefits: [
          'Faster scan times compared to full codebase analysis',
          'Reduced false positives through targeted scanning',
          'Higher accuracy in identifying critical vulnerabilities',
          'Better developer experience with focused feedback'
        ],
        useCases: [
          'Rapid security assessments for new projects',
          'Continuous integration pipeline integration',
          'Code review automation and enhancement',
          'Security training and awareness programs'
        ]
      }
    },
    {
      id: 'best-practices',
      title: 'Best Practice Enforcement',
      description: 'Detect hardcoded secrets, broken access controls, outdated APIs, unsafe configs, and legacy patterns that pose long-term risks.',
      icon: <CheckCircle className="w-6 h-6" />,
      details: {
        overview: 'Zypher enforces industry-standard security practices through a comprehensive rule engine that detects common security anti-patterns and provides actionable remediation guidance.',
        capabilities: [
          'Hardcoded credential detection (API keys, passwords, tokens)',
          'Access control vulnerability identification',
          'Deprecated API and library usage detection',
          'Unsafe configuration pattern recognition',
          'Legacy code pattern identification',
          'Compliance rule enforcement (SOC 2, ISO 27001, NIST)'
        ],
        benefits: [
          'Proactive security posture improvement',
          'Reduced technical debt through legacy pattern detection',
          'Automated compliance monitoring',
          'Consistent security standards across teams'
        ],
        useCases: [
          'Security audits and assessments',
          'Compliance reporting and documentation',
          'Developer training and onboarding',
          'Technical debt management and prioritization'
        ]
      }
    },
    {
      id: 'knowledge-base',
      title: 'Auto-Linked Knowledge Base',
      description: 'Every issue links to a deep-dive article with clear explanations, risk breakdowns, and actionable remediation. Less Googling. More fixing.',
      icon: <BookOpen className="w-6 h-6" />,
      details: {
        overview: 'Our comprehensive knowledge base provides contextual guidance for every security finding, eliminating the need for developers to search for solutions across multiple resources.',
        capabilities: [
          'Contextual article linking for each vulnerability type',
          'Step-by-step remediation guides with code examples',
          'Risk assessment and impact analysis',
          'Best practice recommendations',
          'Integration with popular documentation platforms',
          'Regular content updates with emerging threats'
        ],
        benefits: [
          'Faster issue resolution with guided remediation',
          'Improved developer security knowledge',
          'Reduced support burden on security teams',
          'Consistent remediation approaches across projects'
        ],
        useCases: [
          'Developer self-service security guidance',
          'Security training and skill development',
          'Standardized remediation procedures',
          'Knowledge sharing across development teams'
        ]
      }
    }
  ];

  const additionalFeatures = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: 'Multiple Upload Methods',
      description: 'Support for manual file upload and direct GitHub repository integration'
    },
    {
      icon: <Github className="w-5 h-5" />,
      title: 'GitHub Integration',
      description: 'Seamlessly fetch and analyze YAML files from your repositories'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive scan history tracking and improvement metrics'
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'PDF Reports',
      description: 'Professional scan summaries and compliance documentation'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Role-Based Access',
      description: 'Granular permissions for different user types and responsibilities'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: 'Custom Rules',
      description: 'Create and manage organization-specific scanning rules'
    }
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#F0F0F0]">
      {/* Hero Section */}
      <section className={`min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[var(--foreground)] max-w-5xl">
          Powerful Features for<br/>
          <span className="text-[var(--brand-yellow)]"> Modern DevSecOps</span>
          <br/> from Code to Deployment
        </h1>
        <p className="mt-6 text-[var(--text-secondary)] max-w-2xl text-base sm:text-lg">
          Discover how Zypher's comprehensive security scanning platform transforms your CI/CD pipeline security with advanced static analysis and intelligent remediation guidance.
        </p>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8">
            {features.map((feature, index) => (
              <div key={feature.id} className="group">
                <div 
                  className="bg-[#1A1A1A] border border-[#343434] rounded-2xl p-8 hover:border-[#FCE803]/50 transition-all duration-300 cursor-pointer"
                  onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="bg-[#FCE803]/10 p-3 rounded-xl text-[#FCE803] group-hover:bg-[#FCE803]/20 transition-colors">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-[#CCCCCC] text-lg mb-6">{feature.description}</p>
                        
                        {activeFeature === feature.id && (
                          <div className="mt-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
                            <div>
                              <h4 className="text-xl font-semibold mb-4 ">Overview</h4>
                              <p className="text-[#CCCCCC] leading-relaxed">{feature.details.overview}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-xl font-semibold mb-4 ">Key Capabilities</h4>
                              <ul className="space-y-2">
                                {feature.details.capabilities.map((capability, idx) => (
                                  <li key={idx} className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-[#CCCCCC]">{capability}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-xl font-semibold mb-4 ">Benefits</h4>
                              <ul className="space-y-2">
                                {feature.details.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start space-x-3">
                                    <Zap className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-[#CCCCCC]">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-xl font-semibold mb-4 ">Use Cases</h4>
                              <ul className="space-y-2">
                                {feature.details.useCases.map((useCase, idx) => (
                                  <li key={idx} className="flex items-start space-x-3">
                                    <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-[#CCCCCC]">{useCase}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight 
                      className={`w-6 h-6 text-[#CCCCCC] transition-transform duration-300 ${
                        activeFeature === feature.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Additional <span className="text-[#FCE803]">Capabilities</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-[#121212] border border-[#343434] rounded-xl p-6 hover:border-[#FCE803]/50 transition-all duration-300 group">
                <div className="bg-[#FCE803]/10 p-3 rounded-lg text-[#FCE803] w-fit mb-4 group-hover:bg-[#FCE803]/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#CCCCCC] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Secure Your <span className="text-[#FCE803]">CI/CD Pipeline?</span>
          </h2>
          <p className="text-xl text-[#CCCCCC] mb-8">
            Join thousands of developers who trust Zypher to keep their deployments secure and compliant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/startFreeScan">
              <button className="mt-10 inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition">
                Start free scan
                <ArrowRight size={25} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
