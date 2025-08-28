const mongoose = require('mongoose');

const CustomRuleMetadataSchema = new mongoose.Schema({
  rule_id: { type: String, required: true },
  rule_name: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'], required: true },
  status: { type: String, required: true },
  developer_note: { type: String },
  example_code: { type: String }, // test.yml content
  user_id: { type: String, default: 'default_user_id' }, // Replace with actual user id
  rule_developer_id: { type: String, default: 'default_rule_developer_id' }, // Replace with actual rule developer id
});

module.exports = mongoose.models.CustomRuleMetadata || mongoose.model('CustomRuleMetadata', CustomRuleMetadataSchema);
