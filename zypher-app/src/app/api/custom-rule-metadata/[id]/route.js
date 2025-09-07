import CustomRuleMetadata from "@/models/CustomRuleMetadata"
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

// Fetch custom rule metadata
export const GET = async (request, context) => {
    const params = await context.params;
    
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

    const ruleId = params.id;

    await connectDB();

    try {
        const customRuleMetadata = await CustomRuleMetadata.findOne({ rule_id: ruleId })
            .select('_id rule_id rule_name description severity remediation rule_owner_id request_id rule_developer_id createdAt')
            .lean();
        
        return NextResponse.json(
            { ruleMetadata: customRuleMetadata },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching the custom rule metadata:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};