import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const UpdateRuleRequestSchema = new Schema({
    ruleId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    suggested_severity: {
        type: String,
        enum: ["low", "medium", "high", "critical", "info"],
        default: "medium"
    },
    sample_code: {
        type: String,
        default: ""
    },
    assigned_developer: {
        type: Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: [
            "Pending Review",
            "Assigned", 
            "Under Development",
            "Ready for Testing",
            "Being Tested",
            "Under Modification",
            "Approved",
            "Successfully Published",
            "Rejected"
        ],
        default: "Pending Review",
        required: true
    },
    rejected_reason: {
        type: String,
        default: ""
    },
    user_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.models.CustomRuleRequest || mongoose.model("CustomRuleRequest", UpdateRuleRequestSchema);