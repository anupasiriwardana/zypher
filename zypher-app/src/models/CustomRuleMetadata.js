import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const CustomRuleMetadataSchema = new Schema({
  rule_id: {
    type: String,
    required: true,
    unique: true
  },
  rule_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    required: true
  },
  remediation: {
    type: String,
    default: null
  },
  rule_owner_id: {
    type: Types.ObjectId,
    ref: 'User',
    default: null
  },
  request_id: {
    type: Types.ObjectId,
    ref: 'CustomRuleRequest',
    default: null
  },
  rule_developer_id: {
    type: Types.ObjectId,
    ref: 'User',
    default: null
  },
});

export default mongoose.models.CustomRuleMetadata || mongoose.model('CustomRuleMetadata', CustomRuleMetadataSchema);
