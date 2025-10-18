// app/api/publish-custom-rule/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { rule_id, collection } = await request.json();

    if (!rule_id || !collection) {
      return NextResponse.json(
        { detail: "Missing required fields: rule_id or collection" },
        { status: 400 }
      );
    }

    const FASTAPI_URL = process.env.FASTAPI_URL;
    const backendUrl = `${FASTAPI_URL}/publish-custom-rule/`;

    // Forward the request to FastAPI backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_id, collection }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to publish rule" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in /api/publish-custom-rule:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
