import { NextResponse } from "next/server";

import {
    createUserActivity,
    getUserActivityByUserId,
    updateUserActivity,
    decrementUserScans
} from "@/app/api/_services/userActivityService";

import {
    getUserSubscription
} from "@/app/api/_services/subscriptionService";

import {
    getDefaultPlan
} from "@/app/api/_services/pricingPlanService";

import { checkRoleAccess } from "@/app/api/_services/requestValidationService";

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
    const userActiviyLog =  await createOrUpdateUserActivityLog(userId);
    if(userActiviyLog.error){
        return NextResponse.json(
            { error: userActiviyLog.error },
            { status: 500 }
        );
    }
    return NextResponse.json(
        {
            success: true,
            message: userActiviyLog.message,
            data: userActiviyLog.data
        },
        { status: userActiviyLog.status }
    );
};

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
    const userActivity = await getUserActivityLog(userId);
    if(userActivity.error){
        return NextResponse.json(
            { error: userActivity.error },
            { status: 500 }
        );
    }
    return NextResponse.json(
        {
            success: true,
            message: userActivity.message,
            data: userActivity.data
        },
        { status: userActivity.status }
    );
};

export const PATCH = async (request) => {
    //decrement scans remaining
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
        //getUserActivity
        const userActivityLog = await getUserActivityLog(userId);
        if(userActivityLog.error){
            throw new Error(userActivityLog.error);
        }
        const userActivityData = userActivityLog.data;
        //check scans remaining
        if(userActivityData.scans_remaining == -1){
            return NextResponse.json(
                {
                    success: true,
                    message: "Unlimited scans available.",
                    data: userActivityData
                },
                { status: 200 }
            );
        }
        if(userActivityData.scans_remaining == 0){
            throw new Error("No scans remaining.");
        }
        //decrement scans
        const decrementResult = await decrementUserScans(userActivityData._id);
        if(decrementResult.error){
            throw new Error(decrementResult.error);
        }
        return NextResponse.json(
            {
                success: true,
                message: "Scan decremented successfully.",  
                data: decrementResult.data
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

async function createOrUpdateUserActivityLog(userId) {
    let createdUserActivityLog = {};
    try {
        let planId = null;
        let scans_remaining = 0;
        let allowCustomRuleRequests = false;

        //check if user has subscription
        const existingUserSubscription = await getUserSubscription(userId);

        if (existingUserSubscription.error) {
            //means no subcription found
            //get default plan
            const defaultPlan = await getDefaultPlan();
            if (defaultPlan.error) {
                throw new Error(defaultPlan.error);
            }
            planId = defaultPlan.data.plan_id;
            scans_remaining = defaultPlan.data.scanLimit;
            allowCustomRuleRequests = defaultPlan.data.allowCustomRuleRequests;
        } else {
            //create user actity from subscription
            planId = existingUserSubscription.data.planId;
            scans_remaining = existingUserSubscription.data.scanLimit;
            allowCustomRuleRequests = existingUserSubscription.data.allowCustomRuleRequests;
        }

        //check if user activity exists
        const existingUserActivity = await getUserActivityByUserId(userId);
        if (existingUserActivity.error) {
            //create new user activity
            const createResult = await createUserActivity(
                userId,
                planId,
                scans_remaining,
                allowCustomRuleRequests
            );
            if (createResult.error) {
                throw new Error(createResult.error);
            }
            createdUserActivityLog.success = true;
            createdUserActivityLog.data = createResult.data;
            createdUserActivityLog.message = "User activity created successfully";
            createdUserActivityLog.status = 201;
            return createdUserActivityLog;
        }
        //update existing user activity
        const updateResult = await updateUserActivity(
            existingUserActivity.data._id,
            planId,
            scans_remaining,
            allowCustomRuleRequests
        );
        if (updateResult.error) {
            throw new Error(updateResult.error);
        }
        createdUserActivityLog.success = true;
        createdUserActivityLog.data = updateResult.data;
        createdUserActivityLog.message = "User activity updated successfully";
        createdUserActivityLog.status = 200;
    
        return createdUserActivityLog;

    }catch (error) {
        createdUserActivityLog.error = error.message || "Internal server error";
        return createdUserActivityLog;
    }
}


async function getUserActivityLog(userId) {
    let userActivityLog = {};
    try {
        const userActivity = await getUserActivityByUserId(userId);
        
        // Compare only the date part (ignoring time)
        const today = new Date();
        const currentDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Get the lastActiveDate and convert to date-only for comparison
        let shouldUpdate = true;
        
        if (!userActivity.error && userActivity.data && userActivity.data.lastActiveDate) {
            const lastActive = new Date(userActivity.data.lastActiveDate);
            const lastActiveDateOnly = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            
            // Only update if the dates are different
            shouldUpdate = lastActiveDateOnly.getTime() !== currentDateOnly.getTime();
        }
        
        if (userActivity.error || shouldUpdate) {
            //update last active log if the date is different or create new if missing
            const userActivityLog = await createOrUpdateUserActivityLog(userId);
            if (userActivityLog.error) {
                throw new Error(userActivityLog.error);
            }
            userActivity.data = userActivityLog.data;
        }

        userActivityLog.data = userActivity.data;
        userActivityLog.success = true;
        userActivityLog.message = "User activity fetched successfully";
        userActivityLog.status = 200;

        return userActivityLog;

    } catch (error) {
        userActivityLog.error = error.message || "Internal server error";
        return userActivityLog;
    }
};