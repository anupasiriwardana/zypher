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

  const { filename, content } = await request.json();

  try {
    const vulnerabilitiesResponse = await fetch(`${process.env.FASTAPI_URL}/vulnerability-scan-single-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        // 'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify(
        {
          filename: filename,
          content: content
        }
      ),
    });

    const bpSuggestionsResponse = await fetch(`${process.env.FASTAPI_URL}/bp-scan-single-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        // 'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify(
        {
          filename: filename,
          content: content
        }
      ),
    });

    const vulnerabilitiesData = await vulnerabilitiesResponse.json();
    const bpSuggestionsData = await bpSuggestionsResponse.json();

    if (!vulnerabilitiesResponse.ok) {
      return NextResponse.json(
        {
          error: vulnerabilitiesData.detail || 'FastAPI returned an error',
          status: vulnerabilitiesResponse.status
        },
        { status: vulnerabilitiesResponse.status }
      );
    }
    if (!bpSuggestionsResponse.ok) {
      return NextResponse.json(
        {
          error: bpSuggestionsData.detail || 'FastAPI returned an error',
          status: bpSuggestionsResponse.status
        },
        { status: bpSuggestionsResponse.status }
      )
    }

    //combined scan results
    const combinedScanResults = {
      vulnerabilities: vulnerabilitiesData,
      bestPractices: bpSuggestionsData,
    }

    return NextResponse.json(combinedScanResults, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan repository' },
      { status: 500 }
    );
  }
}
