import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import PricingPlan from "@/models/PricingPlan";

export async function GET() {
  let connected = true;
  try {
    await connectDB();
  } catch (connErr) {
    connected = false;
    console.error("GET /api/pricing-plans - DB connect error:", connErr.message);
  }

  try {
    if (!connected) {
      // DB unavailable — return empty list so frontend doesn't crash
      return NextResponse.json([], { status: 200 });
    }

    const plans = await PricingPlan.find();
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error("GET /api/pricing-plans error:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
  } catch (connErr) {
    console.error("POST /api/pricing-plans - DB connect error:", connErr.message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const newPlan = new PricingPlan(body);
    await newPlan.save();
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("POST /api/pricing-plans error:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}