import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

// Import models
import PublishedCustomRule from "@/models/PublishedCustomRule";
import BestPracticeRule from "@/models/BestPracticeFile";
import VulnerabilityRule from "@/models/VulnerabilityFile";
import BP_rule_metadata from "@/models/BP_rule_metadata";
import VULN_rule_metadata from "@/models/VULN_rule_metadata";
import CustomRuleMetadata from "@/models/CustomRuleMetadata";

export const GET = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["rule-maintainer"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    // Fetch active rules
    const [customRules, bestPractices, vulnerabilities] = await Promise.all([
      PublishedCustomRule.find({ status: "active" })
        .sort({ created_at: -1 })
        .select("_id rule_id rule_name status file_content user_id created_at")
        .lean(),
      BestPracticeRule.find({ status: "active" })
        .sort({ created_at: -1 })
        .select("_id rule_id rule_name status file_content created_at")
        .lean(),
      VulnerabilityRule.find({ status: "active" })
        .sort({ created_at: -1 })
        .select("_id rule_id rule_name status file_content created_at")
        .lean()
    ]);

    // Fetch metadata only for the active rules
    const [customMeta, bpMeta, vulnMeta] = await Promise.all([
      CustomRuleMetadata.find({ rule_id: { $in: customRules.map(r => r.rule_id) } }).lean(),
      BP_rule_metadata.find({ rule_id: { $in: bestPractices.map(r => r.rule_id) } }).lean(),
      VULN_rule_metadata.find({ rule_id: { $in: vulnerabilities.map(r => r.rule_id) } }).lean()
    ]);

    // Helper to attach severity
    const attachSeverity = (rules, metadata) => {
      const metaMap = metadata.reduce((acc, m) => {
        acc[m.rule_id] = m.severity || "informational";
        return acc;
      }, {});
      return rules.map(r => ({
        ...r,
        severity: metaMap[r.rule_id] || "informational"
      }));
    };

    const groupedRules = {
      customRules: attachSeverity(customRules, customMeta),
      bestPractices: attachSeverity(bestPractices, bpMeta),
      vulnerabilities: attachSeverity(vulnerabilities, vulnMeta)
    };

    console.log("Fetched active rules with severity:", groupedRules);

    return NextResponse.json({ success: true, groupedRules }, { status: 200 });

  } catch (error) {
    console.error("Error fetching active rules:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
};
