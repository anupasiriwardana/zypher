import { NextResponse } from "next/server";

export async function POST(request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ['rule-maintainer', 'rule-developer'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { file_request, custom_rule } = await request.json();

  try {
    const scanRes = await fetch(`${process.env.FASTAPI_URL}/custom-rule-test-scan`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify({ file_request, custom_rule})
    });

    const testScanResults = await scanRes.json();

    if (!scanRes.ok) {
      return NextResponse.json(
        { error: testScanResults.detail || 'Custom rule test scan failed' },
        { status: scanRes.status }
      );
    }

    return NextResponse.json(testScanResults,{ status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to perform the custom rule scan' },
      { status: 500 }
    );
  }
}
