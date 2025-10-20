import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import KnowledgeBase from "@/models/KnowledgeBase";

export async function GET(req) {
  await connectDB();

  try {
    // Extract rule_id from the URL path
    const url = new URL(req.url);
    const rule_id = url.pathname.split("/").pop(); // get the last part of path

    if (!rule_id) {
      return NextResponse.json({ error: "Missing rule_id" }, { status: 400 });
    }

    // Find the rule by rule_id
    const entry = await KnowledgeBase.findOne({ rule_id });

    if (!entry) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    // Normalize the entry
    const normalized = {
      ...entry.toObject(),
      type:
        entry.type ||
        (entry.rule_id?.includes("VULN") ? "vulnerability" : "best-practice"),
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const {
      rule_id,
      rule_name,
      category,
      severity,
      explanation,
      real_world_examples,
      potential_impacts,
      mitigation_steps,
      best_practices_summary,
      detection_methods,
      references,
      status,
      user_id,
    } = body;

    // ✅ Validate required fields
    if (!rule_id || !rule_name || !category || !severity || !explanation) {
      return NextResponse.json(
        { error: "rule_id, rule_name, category, severity, and explanation are required" },
        { status: 400 }
      );
    }

    // ✅ Prevent duplicate rule_id
    const existing = await KnowledgeBase.findOne({ rule_id });
    if (existing) {
      return NextResponse.json(
        { error: `Rule with ID ${rule_id} already exists` },
        { status: 409 }
      );
    }

    // ✅ Create new knowledge base entry
    const newEntry = await KnowledgeBase.create({
      rule_id,
      rule_name,
      category,
      severity,
      explanation,
      real_world_examples,
      potential_impacts,
      mitigation_steps,
      best_practices_summary,
      detection_methods,
      references,
      status: status || "active",
      user_id: user_id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (err) {
    console.error("POST /api/knowledgebases error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
