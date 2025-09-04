import CustomRuleMetadata from '@/models/CustomRuleMetadata';
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

//submit custom rule request
export const POST = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  // Check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check role-based access
  const allowedRoles = ['rule-developer'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await connectDB();

  const { ruleId, ruleName, ruleDescription, suggestedSeverity, remediation, ruleOwnerId, requestId} = await request.json();

  try {
    const customRuleMetadataDoc = new CustomRuleMetadata({
      rule_id: ruleId,
      rule_name: ruleName,
      description: ruleDescription,
      severity: suggestedSeverity,
      remediation: remediation || null,
      rule_owner_id: ruleOwnerId,
      request_id: requestId,
      rule_developer_id: userId
    });

    await customRuleMetadataDoc.save();

    return NextResponse.json(
      { success: "Custom rule metadata saved successfully", id: customRuleMetadataDoc._id },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error saving custom rule metadata:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
};
