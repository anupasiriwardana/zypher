import mongoose from "mongoose";

const findingSchema = new mongoose.Schema({
    rule_id: String,
    severity: String,
    description: String,
    line_number: Number,
    filepath: String,
    snippet: String,
    recommendation: String,
    confidence: String,
}, { _id: false });

const statsSchema = new mongoose.Schema({
    total_findings: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
}, { _id: false });

const scanSectionSchema = new mongoose.Schema({
    status: { 
        type: String, 
        required: true 
    },
    findings: [findingSchema],
    stats: statsSchema
}, { _id: false });

const FileScanResultSchema = new mongoose.Schema({
    user_id: { 
        type: String, 
        required: true 
    },
    filename: { 
        type: String, 
        required: true 
    },
    vulnerabilityScan: scanSectionSchema,
    bestPracticesScan: scanSectionSchema,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FileScanResult || mongoose.model("FileScanResult", FileScanResultSchema);
