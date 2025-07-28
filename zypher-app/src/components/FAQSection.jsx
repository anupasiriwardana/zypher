"use client";

import React, { useState } from 'react';
import { CircleQuestionMark, Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const faqs = [
    {
      q: "What does Zypher scan?",
      a: "CI/CD configs, pipelines, secrets, hardcoded credentials, misconfigurations.",
    },
    {
      q: "Do I need to install anything?",
      a: "Nope. Just connect your repo. We handle the rest.",
    },
    {
      q: "What kind of issues does Zypher detect?",
      a: "Security misconfigs, privilege escalations, token leaks, more.",
    },
    {
      q: "Which CI/CD platforms are supported?",
      a: "Zypher supports scanning YAML-based pipeline definitions from any CI/CD platform, including GitHub Actions, GitLab CI, and CircleCI. Automated fetching is currently available for GitHub repositories, while other platforms require manual upload. Platform-specific patterns are detected automatically.",
    },
    {
      q: "How fast is a scan?",
      a: "Less than 30s for most pipelines.",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}">
      <div className="w-full max-w-[574px] mx-auto flex flex-col items-center gap-16">
        {/* FAQ Badge */}
        <div className="inline-flex px-6 py-2 bg-transparent rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-700 items-center gap-5">
          <CircleQuestionMark className="w-5 h-5 text-zinc-100" />
          <div className="text-base font-bold leading-6 text-zinc-100">FAQ</div>
        </div>

        {/* FAQ Heading */}
        <div className="text-zinc-100 text-3xl font-bold text-center leading-9">
          Got Questions? We’ve Got Answers.
        </div>

        {/* FAQ Items */}
        <div className="w-[516px] flex flex-col items-start gap-7 text-left">
          {faqs.map((faq, i) => (
            <div key={i} className="w-full bg-transparent rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-100/10 text-left">
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full h-20 px-5 py-7 flex items-center justify-between"
              >
                <div className="w-96 text-zinc-100 text-base font-medium leading-normal text-[18px] text-left">
                  {faq.q}
                </div>
                <div className="w-6 h-6 relative overflow-hidden ">
                  {expandedIndex === i ? (
                    <Minus className="text-zinc-100 w-5 h-5 hover:text-[var(--brand-yellow)]" />
                  ) : (
                    <Plus className="text-zinc-100 w-5 h-5 hover:text-[var(--brand-yellow)]" />
                  )}
                </div>
              </button>
              {expandedIndex === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-[var(--brand-yellow)]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
