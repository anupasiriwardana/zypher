import { NextResponse } from "next/server";
import CustomRuleFile from '../../../models/CustomRuleFile';
import connectDB from "@/utils/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const file = await CustomRuleFile.create(body);
    return NextResponse.json(file, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const files = await CustomRuleFile.find();
    return NextResponse.json(files, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
