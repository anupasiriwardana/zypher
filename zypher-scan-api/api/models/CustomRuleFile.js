const mongoose = require('mongoose');

const CustomRuleFileSchema = new mongoose.Schema({
  rule_id: { type: String, required: true },
  rule_name: { type: String, required: true },
  status: { type: String, enum: ['active', 'disable'], default: 'active' },
  file_content: { type: String, required: true }, // Python code as string
});

module.exports = mongoose.model('CustomRuleFile', CustomRuleFileSchema);
