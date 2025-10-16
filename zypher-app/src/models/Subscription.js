import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    planId: { 
        type: String, 
        ref: "PricingPlan", 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["active", "canceled", "paused"], 
        default: "active" 
    },
    startDate: { 
        type: Date, 
        default: Date.now 
    },
    endDate: { 
        type: Date 
    },
    scanLimit: { 
        type: Number, 
        default: 0
    },
    allowCustomRuleRequests: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);