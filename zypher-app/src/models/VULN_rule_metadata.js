import mongoose from "mongoose";

const { Schema } = mongoose;

const vulnRuleMetadataSchema = new Schema({
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
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL","INFO"],
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    remediation: {
        type: String,
        required: true,
    }
}, { 
    timestamps: true,
    collection: 'vulnerability_rule_metadata' // use the existing collection 
}
);

export default mongoose.models.VulnRuleMetadata || mongoose.model("VulnRuleMetadata", vulnRuleMetadataSchema);


