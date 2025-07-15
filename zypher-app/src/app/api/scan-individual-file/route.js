import { NextResponse } from "next/server";

export async function POST(request) {
  const { filename, content } = await request.json();

  try {
    const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/vulnerability-scan-single-file`, {
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
    
    const responseData = await fastApiResponse.json();

    if (!fastApiResponse.ok) {
      return NextResponse.json(
        {
          error: responseData.detail || 'FastAPI returned an error',
          status: fastApiResponse.status
        },
        { status: fastApiResponse.status }
      );
    }


    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan repository' },
      { status: 500 }
    );
  }
}
