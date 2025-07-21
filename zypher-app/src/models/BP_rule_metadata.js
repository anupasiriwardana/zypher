import mongoose from "mongoose";

const { Schema } = mongoose;

const bpRuleMetadataSchema = new Schema({
    rule_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        required: true,
    },
    match: {
        type: Object,
        required: true,
    },
    action : {
        type: String,
        required: true,
    },
    negative : {
        type: String,
        required: true,
    },
    positive : {
        type: String,
        required: true,
    },
    knowledgeBase: {
        type: String,
        required: true,
    }
}, { 
    timestamps: true,
    collection: 'bestPractices_rule_metadata' // use the existing collection 
}
);

export default mongoose.models.BPRuleMetadata || mongoose.model("BPRuleMetadata", bpRuleMetadataSchema);


