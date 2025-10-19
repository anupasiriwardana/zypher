import mongoose from 'mongoose';

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

const fileResultSchema = new mongoose.Schema({
    path: String,
    download_url: String,
    html_url: String,
    findings: [findingSchema]
}, { _id: false });

const bestPracticeStatsSchema = new mongoose.Schema({
    scanned_files: Number,
    total_findings: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    bp_score: Number,
    bp_per_severity: {
        CRITICAL: Number,
        HIGH: Number,
        MEDIUM: Number,
        LOW: Number,
    },
    risk_factor: String
}, { _id: false });

const vulnerabilityStatsSchema = new mongoose.Schema({
    scanned_files: Number,
    total_findings: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    vuln_score: Number,
    vuln_per_severity: {
        CRITICAL: Number,
        HIGH: Number,
        MEDIUM: Number,
        LOW: Number
    },
    risk_factor: String
}, { _id: false });

// customRuleStatsSchema can be added similarly if needed
const customRuleStatsSchema = new mongoose.Schema({
    scanned_files: Number,
    total_findings: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    cust_score: Number,
    cust_per_severity: {
        CRITICAL: Number,
        HIGH: Number,
        MEDIUM: Number,
        LOW: Number
    },
    risk_factor: String
}, { _id: false });

const RepoScanResultSchema = new mongoose.Schema({
    user_id : {
        type: String,
        required: true
    },
    repo_url: {
        type: String,
        required: true
    },

    bestPracticesScan: {
        status: String,
        results: [fileResultSchema],
        stats: bestPracticeStatsSchema
    },

    vulnerabilityScan: {
        status: String,
        results: [fileResultSchema],
        stats: vulnerabilityStatsSchema
    },

    customRuleScan: {
        status: String,
        results: [fileResultSchema],
        stats: customRuleStatsSchema
    },

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.RepoScanResult || mongoose.model('RepoScanResult', RepoScanResultSchema);
