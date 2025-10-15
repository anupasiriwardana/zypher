import PricingPlan from "@/models/PricingPlan";
import connectDB from "@/utils/db";

export const getPricingPlans = async() => {
    try{
        await connectDB();
        const plans = await PricingPlan.find({})
            .select('_id plan_id planName monthly_price yearly_price scanLimit allowCustomRuleRequests features status createdAt updatedAt')
            .lean();
        
        return { 
            success: true, 
            data: plans 
        };
    } catch (error) {
        return { 
            error: error.message || "Internal server error" 
        };
    }
};