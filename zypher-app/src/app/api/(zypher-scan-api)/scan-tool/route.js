import { NextResponse } from "next/server";
import RepoScanResult from "@/models/RepoScanResult";
import connectDB from "@/utils/db";

export async function POST(request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role"); 
  await connectDB();

  if (!userId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["primary-user"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { repoUrl } = await request.json();

  try {
    //fetching vulnScan results and bpScan results in parallel
    const [vulnScanRes, bpScanRes, customRuleScanRes] = await Promise.all([
      fetch(`${process.env.FASTAPI_URL}/vulnerability-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      }),
      fetch(`${process.env.FASTAPI_URL}/best-practices-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      }),
      fetch(`${process.env.FASTAPI_URL}/customeRule-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl,
          user_id: userId,
         }),
      }),
    ]);

    const vulnScanData = await vulnScanRes.json();
    const bpScanData = await bpScanRes.json();
    const customRuleScanData = await customRuleScanRes.json();

    if (!vulnScanRes.ok) {
      return NextResponse.json(
        { error: vulnScanData.detail || "Vulnerability scan failed" },
        { status: vulnScanRes.status }
      );
    }

    if (!bpScanRes.ok) {
      return NextResponse.json(
        { error: bpScanData.detail || "Best practices scan failed" },
        { status: bpScanRes.status }
      );
    }

    if (!customRuleScanRes.ok) {
      return NextResponse.json(
        { error: customRuleScanData.detail || "Custom Rule scan failed" },
        { status: customRuleScanRes.status }
      );
    }

    try {
      // saving scan result in MongoDB
      const scanDoc = new RepoScanResult({
        user_id : userId ,
        repo_url: repoUrl,
        bestPracticesScan: {
          status: bpScanData.status,
          results: bpScanData.results,
          stats: {
            scanned_files: bpScanData.stats.scanned_files,
            total_findings: bpScanData.stats.total_findings,
            critical: bpScanData.stats.critical,
            high: bpScanData.stats.high,
            medium: bpScanData.stats.medium,
            low: bpScanData.stats.low,
            bp_score: bpScanData.stats["BSTP score"],
            bp_per_severity: bpScanData.stats["BSTP per_severity"],
            risk_factor : bpScanData.stats.risk_factor,
          },
        },
        vulnerabilityScan: {
          status: vulnScanData.status,
          results: vulnScanData.results,
          stats: {
            scanned_files: vulnScanData.stats.scanned_files,
            total_findings: vulnScanData.stats.total_findings,
            critical: vulnScanData.stats.critical,
            high: vulnScanData.stats.high,
            medium: vulnScanData.stats.medium,
            low: vulnScanData.stats.low,
            vuln_score: vulnScanData.stats["vuln score"],
            vuln_per_severity: vulnScanData.stats["vuln per_severity"],
            risk_factor: vulnScanData.stats["risk_factor"],
          },
        },
        customRuleScan: {
          status: customRuleScanData.status,
          results: customRuleScanData.results,
          stats: {
            scanned_files: customRuleScanData.stats.scanned_files,
            total_findings: customRuleScanData.stats.total_findings,
            critical: customRuleScanData.stats.critical,
            high: customRuleScanData.stats.high,
            medium: customRuleScanData.stats.medium,
            low: customRuleScanData.stats.low,
            custom_rule_score: customRuleScanData.stats["custom_rule_score"],
            custom_rule_per_severity: customRuleScanData.stats["custom_rule_per_severity"],
            risk_factor: customRuleScanData.stats["risk_factor"],
          },
        },
      });

      await scanDoc.save();
    } catch (saveError) {
      console.error(saveError)
      // if (saveError.name === "ValidationError") {
      //   console.error("Mongoose Validation Error:", saveError.errors);
      // } else {
      //   console.error("Save Error:", saveError);
      // }
    }


    const combinedResults = {
      vulnerabilityScanResults: vulnScanData,
      bestPracticesScanResults: bpScanData,
      customRuleScanResults: customRuleScanData,
    };

    return NextResponse.json(combinedResults, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save scan results" },
      { status: 500 }
    );
  }
}
