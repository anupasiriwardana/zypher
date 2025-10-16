import mongoose from 'mongoose';

const CustomRuleFileSchema = new mongoose.Schema({
  rule_id: { type: String, required: true },
  rule_name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Under development', 'Under testing'],
    required: true 
  },
  file_content: { type: String, required: true },
  rule_owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomRuleRequest', default: null },
  rule_developer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  yaml_test_file_content: { type: String, default: null }
}, {
  timestamps: true,
  collection: 'publishedCustomRules'  // explicit collection name
});

// Avoid OverwriteModelError
const CustomRule = mongoose.models.CustomRule || mongoose.model('CustomRule', CustomRuleFileSchema);

export default CustomRule;
