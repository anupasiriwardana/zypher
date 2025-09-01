const mongoose = require('mongoose');

const KnowledgeBaseRequestSchema = new mongoose.Schema({
  custom_rule_request_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CustomRuleRequest', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed'], 
    default: 'Pending' 
  },
  assigned_educator: { type: String, required: true }, // educator reviewing the request
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.models.KnowledgeBaseRequest 
  || mongoose.model('KnowledgeBaseRequest', KnowledgeBaseRequestSchema);
