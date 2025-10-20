import { NextResponse } from "next/server";
import FileScanResult from "@/models/FileScanResult";
import connectDB from "@/utils/db";

export async function POST(request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");
  await connectDB();

  if (!userId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ['primary-user'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename, content } = await request.json();

  try {
    
    const [vulnRes, bpRes, customRuleRes] = await Promise.all([
      fetch(`${process.env.FASTAPI_URL}/vulnerability-scan-single-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content }),
      }),
      fetch(`${process.env.FASTAPI_URL}/bp-scan-single-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content }),
      }),
      fetch(`${process.env.FASTAPI_URL}/custom-rule-scan-single-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content, user_id: userId, }),
      }),
    ]);
    

    const vulnerabilities = await vulnRes.json();
    const bestPractices = await bpRes.json();
    const customRules = await customRuleRes.json();

    if (!vulnRes.ok) {
      return NextResponse.json(
        { error: vulnerabilities.detail || 'Vulnerability scan failed' },
        { status: vulnRes.status }
      );
    }

    if (!bpRes.ok) {
      return NextResponse.json(
        { error: bestPractices.detail || 'Best practices scan failed' },
        { status: bpRes.status }
      );
    }
    
    if (!customRuleRes.ok) {
      return NextResponse.json(
        { error: customRules.detail || 'Custom rule scan failed' },
        { status: customRuleRes.status }
      );
    }

    const scanResultDoc = new FileScanResult({
      user_id: userId,
      filename,
      // vulnerabilityScan: vulnerabilities,
      vulnerabilityScan: {
        status: vulnerabilities.status,
        findings: vulnerabilities.findings,
        stats: {
          total_findings: vulnerabilities.stats.total_findings,
          critical: vulnerabilities.stats.critical,
          high: vulnerabilities.stats.high,
          medium: vulnerabilities.stats.medium,
          low: vulnerabilities.stats.low,
          score: vulnerabilities.stats.score,
          per_severity: vulnerabilities.stats["per_severity"],
          risk_factor: vulnerabilities.stats.risk_factor
        }
      },
      bestPracticesScan: {
        status: bestPractices.status,
        findings: bestPractices.findings,
        stats: {
          total_findings: bestPractices.stats.total_findings,
          critical: bestPractices.stats.critical,
          high: bestPractices.stats.high,
          medium: bestPractices.stats.medium,
          low: bestPractices.stats.low,
          score: bestPractices.stats["BSTP score"],
          per_severity: bestPractices.stats["BSTP per_severity"],
          risk_factor: bestPractices.stats.risk_factor
        }
      },
      customRuleScan: {
        status: customRules.status,
        findings: customRules.findings,
        stats: {
          total_findings: customRules.stats.total_findings,
          critical: customRules.stats.critical,
          high: customRules.stats.high,
          medium: customRules.stats.medium,
          low: customRules.stats.low,
          score: customRules.stats["CUST score"],
          per_severity: customRules.stats["CUST per_severity"],
          risk_factor: customRules.stats.risk_factor
        }
      }
    });
    // console.log("Scan result document to be saved:", scanResultDoc);
    try {
      await scanResultDoc.save();
    } catch (saveErr) {
      console.error("Error saving scan result:", saveErr);
      return NextResponse.json(
        { error: "Failed to save scan result", details: saveErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        vulnerabilities,
        bestPractices,
        customRules
      },
      { status: 200 }
    );

  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to scan the file' },
      { status: 500 }
    );
  }
}
