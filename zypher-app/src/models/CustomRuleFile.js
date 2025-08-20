import mongoose from 'mongoose';

const CustomRuleFileSchema = new mongoose.Schema({
  rule_id: { type: String, required: true },
  rule_name: { type: String, required: true },
  status: { type: String, required: true },
  file_content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.CustomRuleFile || mongoose.model('CustomRuleFile', CustomRuleFileSchema);
