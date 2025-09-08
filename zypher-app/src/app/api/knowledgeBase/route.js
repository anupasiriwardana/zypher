import { NextResponse } from "next/server";
import KnowledgeBase from "@/models/KnowledgeBase";
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
  await connectDB();
  try {
    const body = await req.json();
    const entry = await KnowledgeBase.create(body);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
