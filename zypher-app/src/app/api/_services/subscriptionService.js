import Subscription from "@/models/Subscription";
import connectDB from "@/utils/db";

export const createUserSubscription = async(userId, planId, isYearly, scanLimit, allowCustomRuleRequests) => {
    try{
        await connectDB();
        const newSubscription = new Subscription({
            userId,
            planId,
            status: "active",
            startDate: new Date(),
            endDate: isYearly ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : new Date(new Date().setMonth(new Date().getMonth() + 1)),   //yrly : monthly
            scanLimit,
            allowCustomRuleRequests,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newSubscription.save();
        return { 
            success: "Subscription created successfully", 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const getUserSubscription = async(userId) => {
    try{
        await connectDB();
        const subscription = await Subscription.findOne({ userId })
            .select('_id planId status startDate endDate scanLimit allowCustomRuleRequests createdAt updatedAt')
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get the latest
            .lean();
        
        if (!subscription) {
            return { 
                error: "Subscription not found" 
            };
        }
        return { 
            success: true, 
            data: subscription 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }   
};

export const cancelUserSubscription = async(subscriptionId) => {
    try{
        await connectDB();
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            subscriptionId,
            { 
                status: "canceled",
                updatedAt: new Date()
            },
            { new: true }
        ).lean();
        
        if (!updatedSubscription) {
            return { 
                error: "Subscription not found" 
            };
        }
        return { 
            success: "Subscription canceled successfully", 
            data: updatedSubscription 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};