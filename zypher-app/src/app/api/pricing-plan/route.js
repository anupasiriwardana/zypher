import { NextResponse } from "next/server";
import PricingPlan from "@/models/PricingPlan";
import connectDB from "@/utils/db";

import { getPricingPlans } from "@/app/api/_services/pricingPlanService";
import { checkRoleAccess } from "@/app/api/_services/requestValidationService";

export const POST = async (request) => {
    try {
        await connectDB();

        const { plan_id, planName, price, scanLimit, allowCustomRuleRequests, features } = await request.json();

        // Validate required fields
        if (!plan_id || !planName || price === undefined || scanLimit === undefined || allowCustomRuleRequests === undefined || !features) {
            return NextResponse.json(
                { error: "Missing required fields: plan_id, planName, price, scanLimit, allowCustomRuleRequests, and features are required" },
                { status: 400 }
            );
        }

        // Validate features is an array
        if (!Array.isArray(features)) {
            return NextResponse.json(
                { error: "Features must be an array of strings" },
                { status: 400 }
            );
        }

        // Validate price is a number
        if (typeof price !== 'number' || price < 0) {
            return NextResponse.json(
                { error: "Price must be a non-negative number" },
                { status: 400 }
            );
        }

        // Validate scanLimit is a number
        if (typeof scanLimit !== 'number' || (scanLimit < -1)) {
            return NextResponse.json(
                { error: "Scan limit must be a number (-1 for unlimited, or >= 0)" },
                { status: 400 }
            );
        }

        // Check if plan_id already exists
        const existingPlan = await PricingPlan.findOne({ plan_id });
        if (existingPlan) {
            return NextResponse.json(
                { error: "A pricing plan with this plan_id already exists" },
                { status: 409 }
            );
        }

        // Check if planName already exists
        const existingPlanName = await PricingPlan.findOne({ planName });
        if (existingPlanName) {
            return NextResponse.json(
                { error: "A pricing plan with this name already exists" },
                { status: 409 }
            );
        }

        // Create new pricing plan
        const newPricingPlan = new PricingPlan({
            plan_id,
            planName,
            price,
            scanLimit,
            allowCustomRuleRequests,
            features
        });

        const savedPlan = await newPricingPlan.save();

        return NextResponse.json(
            {
                message: "Pricing plan created successfully",
                pricingPlan: savedPlan
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating pricing plan:", error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: "Validation error", details: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error || "Internal server error" },
            { status: 500 }
        );
    }
};

export const GET = async (request) => {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user', 'manager'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }

    try{
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
};
