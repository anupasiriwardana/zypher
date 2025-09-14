import mongoose from "mongoose";

const knowledgeBaseRequestSchema = new mongoose.Schema(
  {
    rule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
      required: true,
    },
    rule_name: { type: String, required: true },
    rule_description: { type: String, required: true },
    suggested_severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    sample_code: { type: String },
    knowledge_base_status: {
      type: String,
      enum: ["Pending", "In Review", "Completed", "Rejected"],
      default: "Pending",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional
    },
    assigned_developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review_notes: [
      {
        reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeBaseRequest", knowledgeBaseRequestSchema);
