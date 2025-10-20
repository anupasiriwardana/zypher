import { NextResponse } from "next/server";

import { getPricingPlans } from "@/app/api/_services/pricingPlanService";

export const GET = async () => {
    try {
        const result = await getPricingPlans();
        if(result.error){
            throw new Error(result.error);
        }
        return NextResponse.json(
            { data: result.data },
            { status: 200 }
        );
    }catch(error){
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}