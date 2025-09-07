import { NextResponse } from "next/server";

import {
    updateRuleFileStatusByRuleMaintainer
} from "@/app/api/_services/customRuleFileService";

import {
    updateCustomRuleRequestStatusByRuleMaintainer
} from "@/app/api/_services/customRuleRequestService";


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
    const allowedRoles = ['rule-maintainer'];
    if (!allowedRoles.includes(role)) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    const { ruleId, requestId, requestStatus, ruleFileStatus, rejectedReason } = await request.json();

    try{
        const result1 = await updateRuleFileStatusByRuleMaintainer(ruleId, ruleFileStatus);
        if(result1.error){
            throw new Error(result1.error);
        }
        const result2 = await updateCustomRuleRequestStatusByRuleMaintainer(requestId, requestStatus, null, rejectedReason);
        if(result2.error){
            throw new Error(result2.error);
        }
        return NextResponse.json(
            { message: "Custom rule file modification requested successfully" },
            { status: 200 }
        );
    }catch(error){
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
