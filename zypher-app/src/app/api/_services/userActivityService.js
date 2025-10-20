import UserActivity from "@/models/UserActivity";
import connectDB from "@/utils/db";

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