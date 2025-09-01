import { NextResponse } from "next/server";
import CustomRuleRequest from '../../../models/KnowledgeBaseRequest';
import connectDB from "@/utils/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const request = await CustomRuleRequest.create(body);
    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const requests = await CustomRuleRequest.find();
    return NextResponse.json(requests, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { request_id } = body;
    const request = await CustomRuleRequest.findOneAndUpdate({ _id: request_id }, body, { new: true });
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
    const result = await CustomRuleRequest.deleteOne({ _id: request_id });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
