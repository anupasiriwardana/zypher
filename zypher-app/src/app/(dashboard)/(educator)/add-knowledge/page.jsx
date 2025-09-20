"use client";

import { useState } from "react";
import { Lexend } from "next/font/google";
import KnowledgeForm from "@/components/KnowledgeForm"; // ✅ one shared form

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AddKnowledgePage() {
  const [activeTab, setActiveTab] = useState("best");

  return (
    <div className={`p-6 md:p-10 max-w-3xl mx-auto ${lexend.className}`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">
        Add New Knowledge
      </h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-[var(--border-input)]">
        <button
          onClick={() => setActiveTab("best")}
          className={`px-4 py-2 font-medium border-b-2 transition-all ${
            activeTab === "best"
              ? "text-[var(--foreground)] border-[var(--brand-yellow)]"
              : "text-[var(--text-secondary)] border-transparent hover:text-[var(--foreground)]"
          }`}
        >
          Document Best Practice
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`ml-4 px-4 py-2 font-medium border-b-2 transition-all ${
            activeTab === "security"
              ? "text-[var(--foreground)] border-[var(--brand-yellow)]"
              : "text-[var(--text-secondary)] border-transparent hover:text-[var(--foreground)]"
          }`}
        >
          Document Security Rule
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`ml-4 px-4 py-2 font-medium border-b-2 transition-all ${
            activeTab === "custom"
              ? "text-[var(--foreground)] border-[var(--brand-yellow)]"
              : "text-[var(--text-secondary)] border-transparent hover:text-[var(--foreground)]"
          }`}
        >
          Document Custom Rule
        </button>
      </div>

      {/* Tab Content — use the generic form */}
      {activeTab === "best" && <KnowledgeForm type="bestpractice" title="Best Practice" />}
      {activeTab === "security" && <KnowledgeForm type="vulnerability" title="Security Rule" />}
      {activeTab === "custom" && <KnowledgeForm type="custom" title="Custom Rule" />}
    </div>
  );
}
