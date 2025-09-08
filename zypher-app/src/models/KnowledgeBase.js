const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  rule_id: { type: String, required: true }, // maps to vulnerability/custom rule ID
  rule_name: { type: String, required: true }, // human-readable name
  category: { type: String, required: true }, // e.g., Access Control, Secrets Management
  severity: { 
    type: String, 
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'], 
    required: true 
  },
  explanation: { type: String, required: true }, // combined description + background
  real_world_examples: { type: [String], default: [] }, // array of examples
  potential_impacts: { type: [String], default: [] }, // array of impacts
  mitigation_steps: { type: [String], default: [] }, // how to fix/prevent
  best_practices_summary: { type: [String], default: [] }, // security guidelines
  detection_methods: { type: [String], default: [] }, // how this is usually detected
  references: { type: [String], default: [] }, // URLs/resources
  status: { type: String, enum: ['active', 'deprecated'], default: 'active' },
  user_id: { type: String }, // optional, only for custom rules
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
