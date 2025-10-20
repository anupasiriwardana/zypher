import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import PricingPlan from "@/models/PricingPlan";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params; // plan_id from URL

    const updates = await req.json(); // frontend must send JSON body

    // Optional: whitelist fields to update
    const allowedFields = [
      "planName",
      "monthly_price",
      "yearly_discount",
      "scanLimit",
      "allowCustomRuleRequests",
      "features",
      "notes",
    ];
    const updateData = {};
    allowedFields.forEach((f) => {
      if (f in updates) updateData[f] = updates[f];
    });

    const updatedPlan = await PricingPlan.findOneAndUpdate(
      { plan_id: id }, // search by plan_id
      updateData,
      { new: true }
    );

    if (!updatedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error("PUT /api/pricing-plans/[id] error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;

    await connectDB();

    const deleted = await PricingPlan.findOneAndDelete({ plan_id: id });

    if (!deleted) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Plan deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/pricing-plans/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
