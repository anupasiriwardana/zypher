"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/card";
import { Badge } from "@/components/badge";
import { AlertCircle, BookOpen } from "lucide-react";

// Example data – later replace with API/db call
const RULES = [
  {
    rule_id: "CICD-VULN-001",
    name: "No Hardcoded API Keys in YAML",
    description:
      "Detects hardcoded API keys inside YAML files, which may expose sensitive credentials.",
    severity: "High",
    recommendation: "Use environment variables or a secret manager instead.",
    owasp: "A02:2021 – Cryptographic Failures",
    type: "Vulnerability",
  },
  {
    rule_id: "R002",
    name: "Use HTTPS for All API Calls",
    description:
      "Ensures all API requests are made over secure HTTPS connections.",
    severity: "Critical",
    recommendation:
      "Update your configuration to enforce HTTPS and reject HTTP requests.",
    owasp: "A05:2021 – Security Misconfiguration",
    type: "Best Practice",
  },
];

export default function RuleDetailPage() {
  const { rule_id } = useParams(); // ✅ get param
  const rule = RULES.find((r) => r.rule_id === rule_id); // ✅ match against RULES

  if (!rule) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        Rule not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-md border border-gray-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {rule.rule_id}: {rule.name}
            </h1>
            <Badge
              className={`${
                rule.severity === "Critical"
                  ? "bg-red-600"
                  : rule.severity === "High"
                  ? "bg-orange-500"
                  : "bg-yellow-500"
              } text-white px-3 py-1`}
            >
              {rule.severity}
            </Badge>
          </div>

          <p className="text-gray-700 text-base">{rule.description}</p>

          {rule.recommendation && (
            <div>
              <h2 className="font-semibold text-lg mb-1">Recommendation</h2>
              <p className="text-gray-700">{rule.recommendation}</p>
            </div>
          )}

          {rule.owasp && (
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm">OWASP: {rule.owasp}</span>
            </div>
          )}

          <div className="pt-4">
            <span className="text-sm text-gray-500">
              Rule type: {rule.type}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
