import { NextResponse } from "next/server";
import FileScanResult from "@/models/FileScanResult";
import connectDB from "@/utils/db";

export async function POST(request) {
  await connectDB();

  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ['primary-user'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename, content } = await request.json();

  try {
    const [vulnRes, bpRes] = await Promise.all([
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
    ]);

    const vulnerabilities = await vulnRes.json();
    const bestPractices = await bpRes.json();

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

    const scanResultDoc = new FileScanResult({
      user_id: userId,
      filename,
      vulnerabilityScan: vulnerabilities,
      bestPracticesScan: bestPractices
    });

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
        bestPractices
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
