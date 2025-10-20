import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  _id: {            
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  responsibilities: {
    type: [String],
    required: true
  },
  compensationInfo: {
    type: String
  },
  benefits: {
    type: String
  }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
