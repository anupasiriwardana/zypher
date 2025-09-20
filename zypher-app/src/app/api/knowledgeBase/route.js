import { NextResponse } from "next/server";
import KnowledgeBase from "@/models/KnowledgeBase";
import KnowledgeBaseRequest from "@/models/KnowledgeBaseRequest";
import connectDB from "@/utils/db";

export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id"); // optional query param

    // Base filter: entries without user_id
    let filter = { $or: [{ user_id: { $exists: false } }, { user_id: null }] };

    // If user_id is provided, include entries with that user_id
    if (user_id) {
      filter = {
        $or: [...filter.$or, { user_id }],
      };
    }

    const entries = await KnowledgeBase.find(filter);

    // Normalize each entry
    const normalized = entries.map((entry) => ({
      ...entry.toObject(),
      type:
        entry.type ||
        (entry.rule_id?.includes("VULN") ? "vulnerability" : "best-practice"),
    }));

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // normalize severity (uppercase)
    const severity = body.suggested_severity
      ? body.suggested_severity.toUpperCase()
      : body.severity?.toUpperCase();

    // 1. Add to knowledgeBases
    const newEntry = new KnowledgeBase({
      rule_id: body.rule_id,
      rule_name: body.rule_name,
      category: body.category,
      severity: severity,
      explanation: body.explanation,
      description: body.description,
      real_world_examples: body.real_world_examples || [],
      potential_impacts: body.potential_impacts || [],
      mitigation_steps: body.mitigation_steps || [],
      best_practices_summary: body.best_practices_summary || [],
      detection_methods: body.detection_methods || [],
      references: body.references || [],
      example_code: body.example_code,
      status: "active",
    });

    await newEntry.save();

    // 2. Update request status → Completed
    if (body.request_id) {
      await KnowledgeBaseRequest.findOneAndUpdate(
        { _id: body.request_id },
        { $set: { knowledge_base_status: "Completed" } },
        { new: true }
      );
    } else {
      console.warn("request_id missing, could not update KnowledgeBaseRequest");
    }

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
  } catch (error) {
    console.error("Error saving knowledge base:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

