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

export const getPlanLimitsByPlanId = async(planId) => {
    try{
        await connectDB();
        console.log("planId:", planId);
        const plan = await PricingPlan.findOne({ plan_id: planId })
            .select('plan_id scanLimit allowCustomRuleRequests')
            .lean();    
        
            if (!plan) {
            return { 
                error: "Plan not found" 
            };
        }
        return { 
            success: true, 
            data: plan 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const getDefaultPlan = async() => {
    try{
        await connectDB();
        const plan = await PricingPlan.findOne({ status: "default" })
            .select('plan_id planName monthly_price yearly_price scanLimit allowCustomRuleRequests features status')
            .lean();    
        
        if (!plan) {
            return { 
                error: "Default plan not found" 
            };
        }  
        
        return { 
            success: true, 
            data: plan 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};

export const getPlanByPlanId = async(planId) => {
    try{
        await connectDB();
        const plan = await PricingPlan.findOne({ plan_id: planId })
            .select('_id plan_id planName monthly_price yearly_price scanLimit allowCustomRuleRequests features status createdAt updatedAt')
            .lean();
        
        if (!plan) {
            throw new Error("Plan not found");
        }
        return { 
            success: true, 
            data: plan 
        };
    }catch (error) {
        return { 
            error: error.message || "Internal server error"
        };
    }
};