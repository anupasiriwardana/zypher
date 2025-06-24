import { NextResponse } from "next/server";

export async function POST(request) {
  const { repoUrl } = await request.json();
  
  try {
    const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        // 'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });

    if (!fastApiResponse.ok) {
      const error = await fastApiResponse.json();
      throw new Error(error.detail || 'FastAPI request failed');
    }

    const data = await fastApiResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan repository' },
      { status: 500 }
    );
  }
}