import { NextResponse } from "next/server";

export async function POST(request) {
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
