import CustomRuleRequest from "@/models/CustomRuleRequest";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

// Fetch custom rule requests
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

    const ruleRequestId = params.id;

    await connectDB();

    try {
        const customRuleRequest = await CustomRuleRequest.findOne({ _id: ruleRequestId })
            .select('_id name description suggested_severity sample_code status user_id createdAt')
            .lean();

        return NextResponse.json(
            { ruleRequest: customRuleRequest },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching the custom rule request:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
};