import { NextResponse } from "next/server";
import connectDB from "@/utils/db";

import { 
    createUserSubscription,
    getUserSubscription,
    cancelUserSubscription
 } from "@/app/api/_services/subscriptionService";

 import { 
    getPlanLimitsByPlanId,
    getDefaultPlan
 } from "@/app/api/_services/pricingPlanService";
import { checkRoleAccess } from "@/app/api/_services/requestValidationService";

//user subcribes to a plan
export const POST = async (request) => {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }

    try{
        await connectDB();
        const { plan_id, isYearly, payment_id } = await request.json();

        //check is selected plan is default plan
        const defaultPlan = await getDefaultPlan();
        if(defaultPlan.error){
            throw new Error(defaultPlan.error);
        }
        if(plan_id === defaultPlan.data.plan_id){
            //cancel subscription to existing plan
            const userSubscription = await getUserSubscription(userId);
            if(userSubscription && !userSubscription.error){
                if(userSubscription.data.status === 'active'){
                    const cancelResult = await cancelUserSubscription(userSubscription.data._id);
                    if(cancelResult.error){
                        throw new Error(cancelResult.error);
                    }
                    return NextResponse.json(
                        {
                            success : true,
                            message: "Subscription canceled. Switched to default plan" 
                        },
                        { status: 200}
                    );
                }else{
                    return NextResponse.json(
                        {
                            success : true,
                            message: "No active subscription found. Already on default plan" 
                        },
                        { status: 200}
                    );
                }
            }else{
                return NextResponse.json(
                    {
                        success : true,
                        message: "No active subscription found. Already on default plan" 
                    },
                    { status: 200}
                );  
            }
        }
        
        const selectedPlanLimits = await getPlanLimitsByPlanId(plan_id);
        if(selectedPlanLimits.error){
            throw new Error(selectedPlanLimits.error);
        }
        const { scanLimit, allowCustomRuleRequests } = selectedPlanLimits.data;

        // For paid plans with no payment ID, create as paused
        const status = plan_id === defaultPlan.data.plan_id ? 'active' : 'paused';
        
        const userSubscription = await createUserSubscription(
            userId, 
            plan_id,
            isYearly,
            scanLimit,
            allowCustomRuleRequests,
            payment_id,
            status // Pass explicit status
        );
        
        if(userSubscription.error){
            throw new Error(userSubscription.error);
        }
        
        return NextResponse.json(
            { 
                success: true,
                message: payment_id 
                    ? "User subscription created and will be activated upon payment completion" 
                    : "User subscription created successfully"
            },
            { status: 201 }
        );        
    }catch(error){
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};

//get user subscription
export const GET = async (request) => {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }

    try{
        await connectDB();
        
        const userSubscription = await getUserSubscription(userId);
        
        if(!userSubscription || userSubscription.error || userSubscription.data.status !== 'active'){
            //swich to default plan
            const defaultPlan = await getDefaultPlan();
            if(defaultPlan.error){
                throw new Error(defaultPlan.error);
            }
            return NextResponse.json(
                { 
                    success : true,
                    message: "No active subscription found. Switched to default plan.",
                    planType: "default",
                    planId : defaultPlan.data.plan_id,
                    data: defaultPlan.data 
                },
                { status: 200 }
            );
        }
        return NextResponse.json(
            { 
                success : true,
                message: "Active subscription found.",
                planType: "subscribed",
                planId : userSubscription.data.planId,
                data: userSubscription.data 
            },
            { status: 200 }
        );        
    }catch(error){
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
