import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import PricingPlan from "@/models/PricingPlan";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const updates = await req.json();
    const updatedPlan = await PricingPlan.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error("PUT /api/plans/[id] error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await PricingPlan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Plan deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/plans/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
