import { NextResponse } from "next/server";
import CustomRuleMetadata from '../../../models/CustomRuleMetadata';
import connectDB from "@/utils/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const rule = await CustomRuleMetadata.create(body);
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const rules = await CustomRuleMetadata.find();
    return NextResponse.json(rules, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { rule_id } = body;
    const rule = await CustomRuleMetadata.findOneAndUpdate({ rule_id }, body, { new: true });
    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    return NextResponse.json(rule, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { rule_id } = body;
    const result = await CustomRuleMetadata.deleteOne({ rule_id });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
