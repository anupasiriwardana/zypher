const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  kb_id: { type: String, required: true }, // unique identifier
  name: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'], required: true },
  recommendation: { type: String }, // optional advice or steps
  type: { type: String, enum: ['vulnerability', 'best-practice'], required: true },
  example_code: { type: String }, // optional, code snippet
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String }, // user_id or developer_id
});

module.exports = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
