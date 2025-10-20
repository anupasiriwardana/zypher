"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/card";
import { Badge } from "@/components/badge";
import { AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";


export default function RuleDetailPage() {
  const { rule_id } = useParams();
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRule() {
      try {
        const res = await fetch(`/api/knowledgeBase/${rule_id}`);
        if (!res.ok) throw new Error("Failed to fetch rule");
        const data = await res.json();
        setRule(data);
      } catch (err) {
        console.error(err);
        setRule(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRule();
  }, [rule_id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 font-medium">Loading...</div>
    );
  }

  if (!rule) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
        <p className="text-lg font-semibold">Rule not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="rounded-2xl shadow-lg border-2 border-gray-700">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            {rule.rule_id.includes("VULN") ? (
              <AlertCircle size={28} className="text-[var(--brand-yellow)]" />
            ) : (
              <CheckCircle size={28} className="text-[var(--brand-yellow)]" />
            )}

            <h1 className="text-2xl md:text-3xl font-extrabold flex-1">
              {rule.rule_id}: {rule.rule_name}
            </h1>

            <Badge
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center",
              rule.severity === "CRITICAL"
                ? "bg-red-600/20 text-red-600"
                : rule.severity === "HIGH"
                ? "bg-orange-600/20 text-orange-600"
                : "bg-yellow-600/20 text-yellow-600"
            )}
          >
            {rule.severity}
          </Badge>
          </div>

          {rule.explanation && (
            <p className="text-gray-400 leading-relaxed">{rule.explanation}</p>
          )}

          {rule.real_world_examples && (
            <div>
              <h2 className="font-semibold text-lg mb-2">Real World Examples</h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-400">
                {rule.real_world_examples.map((example, idx) => (
                  <li key={idx}>{example}</li>
                ))}
              </ul>
            </div>
          )}

          {rule.potential_impacts && (
            <div>
              <h2 className="font-semibold text-lg mb-2">Potential Impacts</h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-400">
                {rule.potential_impacts.map((impact, idx) => (
                  <li key={idx}>{impact}</li>
                ))}
              </ul>
            </div>
          )}

          {rule.mitigation_steps && (
            <div>
              <h2 className="font-semibold text-lg mb-2">Mitigation Steps</h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-400">
                {rule.mitigation_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {rule.best_practices_summary && (
            <div>
              <h2 className="font-semibold text-lg mb-2">Best Practices Summary</h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-400">
                {rule.best_practices_summary.map((bp, idx) => (
                  <li key={idx}>{bp}</li>
                ))}
              </ul>
            </div>
          )}

          {rule.detection_methods && (
            <div>
              <h2 className="font-semibold text-lg mb-2">Detection Methods</h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-400">
                {rule.detection_methods.map((method, idx) => (
                  <li key={idx}>{method}</li>
                ))}
              </ul>
            </div>
          )}

          {rule.references && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-600">References:</span>
              {rule.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm hover:text-blue-800"
                >
                  {ref}
                </a>
              ))}
            </div>
          )}

          <div className="pt-4">
            <span className="text-sm text-gray-500">Rule type: {rule.category}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
