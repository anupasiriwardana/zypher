import mongoose from "mongoose";

const UserActivitySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    planId: { 
        type: String, 
        required: true 
    },
    lastActiveDate: { 
        type: Date, 
        default: Date.now
    },
    scans_remaining: {
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

export default mongoose.models.UserActivity || mongoose.model("UserActivity", UserActivitySchema);