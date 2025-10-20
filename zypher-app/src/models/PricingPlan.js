import mongoose from 'mongoose';

const PricingPlanSchema = new mongoose.Schema({
    plan_id: {
        type: String,
        required: true,
        unique: true
    },
    planName: {
        type: String,
        required: true,
        unique: true
    },
    monthly_price: {
        type: Number,
        required: true,
        default: 0
    },
    yearly_price: {
        type: Number,
        required: true,
        default: 0
    },
    scanLimit: {
        type: Number,
        required: true,
        default: 2
    },
    allowCustomRuleRequests: {
        type: Boolean,
        required: true,
        default: false
    },
    features: {
        type: [String],
        required: true
    },
    notes: {
        type: String,      
        default: ''        
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'default'],
        default: 'active'
    }
}, {
    timestamps: true
});

export default mongoose.models.PricingPlan || mongoose.model('PricingPlan', PricingPlanSchema);
