import { NextResponse } from "next/server";

export async function POST(request) {
  const { repoUrl } = await request.json();

  try {
    const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/vulnerability-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        // 'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });

    const fastApiResponse2 = await fetch(`${process.env.FASTAPI_URL}/best-practices-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        //'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });
    
    const responseData = await fastApiResponse.json();
    const responseData2 = await fastApiResponse2.json();

    if (!fastApiResponse.ok) {
      return NextResponse.json(
        {
          error: responseData.detail || 'FastAPI returned an error',
          status: fastApiResponse.status
        },
        { status: fastApiResponse.status }
      );
    }
    if (!fastApiResponse2.ok) {
      return NextResponse.json(
        {
          error: responseData2.detail || 'FastAPI returned an error',
          status: fastApiResponse2.status
        },
        { status: fastApiResponse2.status
        }
      )
    }

    // Combine results from both scans
    const combinedResults = {
      vulnerabilityScanResults: responseData,
      bestPracticesScanResults: responseData2,
    };

    return NextResponse.json(combinedResults, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan repository' },
      { status: 500 }
    );
  }
}
