import UserActivity from "@/models/UserActivity";
import connectDB from "@/utils/db";

import {
    getUserSubscription
} from "@/app/api/_services/subscriptionService";

import {
    getDefaultPlan
} from "@/app/api/_services/pricingPlanService";


export const createUserActivity = async (userId, planId, scans_remaining, allowCustomRuleRequests) => {
    try {
        await connectDB();
        const newUserActivity = new UserActivity({
            userId,
            planId,
            lastActiveDate: new Date(),
            scans_remaining,
            allowCustomRuleRequests,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newUserActivity.save();
        return { 
            success: true,
            message: "User activity created successfully", 
            data: newUserActivity
        };
    } catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const getUserActivityByUserId = async (userId) => {
    try {
        await connectDB();
        const userActivity = await UserActivity.findOne({ userId })
            .select('_id planId lastActiveDate scans_remaining allowCustomRuleRequests createdAt updatedAt')
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get the latest
            .lean();
        if (!userActivity) {
            throw new Error("User activity not found");
        }
        return { 
            success: true, 
            data: userActivity 
        };
    } catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const updateUserActivity = async (
    userActivityId, 
    newPlanId,
    newScansRemaining,
    allowCustomRuleRequests
) => {
    try {
        await connectDB();
        const updatedUserActivity = await UserActivity.findByIdAndUpdate(
            userActivityId,
            { 
                planId: newPlanId,
                lastActiveDate: new Date(),
                scans_remaining: newScansRemaining,
                allowCustomRuleRequests: allowCustomRuleRequests,
                updatedAt: new Date()
            },
            { new: true }
        ).lean();

        if (!updatedUserActivity) {
            throw new Error("User activity not found");
        }
        return { 
            success: true, 
            data: updatedUserActivity 
        };
    } catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const decrementUserScans = async (userActivityId) => {
    try {
        await connectDB();
        const updatedUserActivity = await UserActivity.findByIdAndUpdate(
            userActivityId,
            { 
                $inc: { scans_remaining: -1 },
                updatedAt: new Date()
            },
            { new: true }
        ).lean();
        if (!updatedUserActivity) {
            throw new Error("User activity not found");
        }
        return { 
            success: true, 
            data: updatedUserActivity 
        };
    } catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const createOrUpdateUserActivityLog = async (userId) => {
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
};


export const getUserActivityLog = async(userId) => {
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


export const checkAndUpdateRemainingScans = async(userId) =>{
    let remainingScansStatus = {};
    try{
        //getUserActivity
        const userActivityLog = await getUserActivityLog(userId);
        if(userActivityLog.error){
            throw new Error(userActivityLog.error);
        }
        const userActivityData = userActivityLog.data;
        //check scans remaining
        if(userActivityData.scans_remaining == -1){
            remainingScansStatus.success = true;
            remainingScansStatus.message = "Unlimited scans available.";
            remainingScansStatus.data = userActivityData;
            remainingScansStatus.status = 200;
            return remainingScansStatus;
        }
        if(userActivityData.scans_remaining == 0){
            throw new Error("You have reached your scan limit. Please upgrade your plan to continue scanning.");
        }
        //decrement scans
        const decrementResult = await decrementUserScans(userActivityData._id);
        if(decrementResult.error){
            throw new Error(decrementResult.error);
        }
        remainingScansStatus.success = true;
        remainingScansStatus.message = "Scan decremented successfully.";
        remainingScansStatus.data = decrementResult.data;
        remainingScansStatus.status = 200;
        return remainingScansStatus;       

    }catch(error){
        remainingScansStatus.error = error.message || "Internal server error";
        return remainingScansStatus;
    }
};