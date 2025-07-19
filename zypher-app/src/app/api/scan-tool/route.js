import { NextResponse } from "next/server";

export async function POST(request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  //check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  //check role-based access
  const allowedRoles = ['primary-user'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  // handle the request
  const { repoUrl } = await request.json();

  try {
    const vulnScanResponse = await fetch(`${process.env.FASTAPI_URL}/vulnerability-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        // 'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });

    const bpScanResponse = await fetch(`${process.env.FASTAPI_URL}/best-practices-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        //'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });
    
    const vulnScanFindings = await vulnScanResponse.json();
    const bpScanFindings = await bpScanResponse.json();

    if (!vulnScanResponse.ok) {
      return NextResponse.json(
        {
          error: vulnScanFindings.detail || 'FastAPI returned an error',
          status: vulnScanResponse.status
        },
        { status: vulnScanResponse.status }
      );
    }
    if (!bpScanResponse.ok) {
      return NextResponse.json(
        {
          error: bpScanFindings.detail || 'FastAPI returned an error',
          status: bpScanResponse.status
        },
        { status: bpScanResponse.status
        }
      )
    }

    // Combine results from both scans
    const combinedResults = {
      vulnerabilityScanResults: vulnScanFindings,
      bestPracticesScanResults: bpScanFindings,
    };

    return NextResponse.json(combinedResults, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan repository' },
      { status: 500 }
    );
  }
}
