import VulnRuleMetadata from "@/models/VULN_rule_metadata";
import BPRuleMetadata from "@/models/BP_rule_metadata";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  //check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  //check role-based access
  const allowedRoles = ['primary-user'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    const vuln_rule_metadata = await VulnRuleMetadata.find();
    const bp_rule_metadata = await BPRuleMetadata.find();

    if (!vuln_rule_metadata || vuln_rule_metadata.length === 0) {
      return new NextResponse(
        JSON.stringify({
          error: "No vulnerability rule metadata found."
        }),
        { status: 404 }
      );
    }
    if (!bp_rule_metadata || bp_rule_metadata.length === 0) {
      return new NextResponse(
        JSON.stringify({
          error: "No best practice rule metadata found."
        }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        vuln_rule_metadata, 
        bp_rule_metadata 
      }, 
      { status: 200 }
    );


  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error"
      }),
      { status: 500 }
    );
  }
};