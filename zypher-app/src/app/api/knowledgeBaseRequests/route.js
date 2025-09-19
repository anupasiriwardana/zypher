import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import KnowledgeBaseRequest from "../../../models/KnowledgeBaseRequest";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const request = await KnowledgeBaseRequest.create(body);
    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// GET /api/knowledgeBaseRequests?type=custom
export async function GET(req) {
  await connectDB();
  try {
    const type = req.nextUrl.searchParams.get("type"); // "custom", "bestpractice", "vulnerability"

    let filter = { knowledge_base_status: "Pending" };

    if (type === "custom") filter.rule_id = new RegExp("CUST", "i");
    else if (type === "bestpractice") filter.rule_id = new RegExp("BSTP", "i");
    else if (type === "vulnerability") filter.rule_id = new RegExp("VULN", "i");

    const rules = await KnowledgeBaseRequest.find(filter);
    return NextResponse.json(rules, { status: 200 });
  } catch (err) {
    console.error("GET /api/knowledgeBaseRequests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { request_id } = body;
    const request = await KnowledgeBaseRequest.findOneAndUpdate({ _id: request_id }, body, { new: true });
    if (!request) return NextResponse.json({ error: 'Knowledge Base Request not found' }, { status: 404 });
    return NextResponse.json(request, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { request_id } = body;
    const result = await KnowledgeBaseRequest.deleteOne({ _id: request_id });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
