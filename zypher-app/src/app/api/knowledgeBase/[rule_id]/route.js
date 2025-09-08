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
