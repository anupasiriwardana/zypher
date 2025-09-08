import { NextResponse } from "next/server";

import {
    updateCustomRuleRequestStatusByRuleMaintainer
} from "@/app/api/_services/customRuleRequestService";


export const PATCH = async (request) => {
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

    const { requestId, requestStatus } = await request.json();

    try{
        const result = await updateCustomRuleRequestStatusByRuleMaintainer(requestId, requestStatus, null, null);
        if(result.error){
            throw new Error(result.error);
        }
        return NextResponse.json(
            { message: "Custom rule request status set to Being Tested" },
            { status: 200 }
        );
    }catch(error){
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
