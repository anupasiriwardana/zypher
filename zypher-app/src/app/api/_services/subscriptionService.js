import Subscription from "@/models/Subscription";
import connectDB from "@/utils/db";
import mongoose from "mongoose";

export const createUserSubscription = async(userId, planId, isYearly, scanLimit, allowCustomRuleRequests, paymentId, status = "paused") => {
    try{
        await connectDB();
        const newSubscription = new Subscription({
            userId,
            planId,
            status: status, // Default is "paused", but can be overridden (e.g., "active" for free plans)
            paymentId,
            startDate: new Date(),
            endDate: isYearly ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : new Date(new Date().setMonth(new Date().getMonth() + 1)),   //yrly : monthly
            scanLimit,
            allowCustomRuleRequests,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newSubscription.save();
        return { 
            success: true,
            message: "Subscription created successfully", 
            data: newSubscription
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
        const subscription = await Subscription.findOne({ 
            userId : userId,
            status : 'active'
         })
            .select('_id planId status startDate endDate scanLimit allowCustomRuleRequests createdAt updatedAt')
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get the latest
            .lean();
        
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        if(subscription.endDate < new Date()){
            throw new Error("No active subscription found");
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

export const updateSubscriptionStatusByPaymentId = async(paymentId, status) => {
    try{
        await connectDB();
        // Normalize paymentId to ObjectId if needed
        let paymentObjectId = paymentId;
        if (!(paymentId instanceof mongoose.Types.ObjectId)) {
            if (mongoose.Types.ObjectId.isValid(paymentId)) {
                paymentObjectId = new mongoose.Types.ObjectId(paymentId);
            } else {
                return { error: 'Invalid paymentId' };
            }
        }

        const update = { status: status, updatedAt: new Date() };

        const updatedSubscription = await Subscription.findOneAndUpdate(
            { paymentId: paymentObjectId },
            update,
            { new: true }
        ).lean();
        if (!updatedSubscription) {
            throw new Error("Subscription not found for the given payment ID");
        }
        return { 
            success: true, 
            data: updatedSubscription 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};