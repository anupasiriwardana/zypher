const mongoose = require('mongoose');

const CustomRuleRequestSchema = new mongoose.Schema({
  rule_id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  suggested_severity: { 
    type: String, 
    enum: ['Critical', 'High', 'Medium', 'Low', 'Info'], 
    required: true 
  },
  sample_code: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

  user_id: { type: String, required: true },  // creator of the request
  assigned_developer: { type: String },        // ID of assigned dev
  implemented_by: { type: String },            // implementer ID
  tested_by: { type: String },                 // tester ID

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.CustomRuleRequest 
  || mongoose.model('CustomRuleRequest', CustomRuleRequestSchema);
