import { NextResponse } from "next/server";
import KnowledgeBase from '../../../models/KnowledgeBase';
import connectDB from "@/utils/db";

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

export async function GET() {
  await connectDB();
  try {
    const entries = await KnowledgeBase.find();
    return NextResponse.json(entries, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
