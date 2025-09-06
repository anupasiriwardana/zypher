import CustomRuleFile from "@/models/CustomRuleFile";
import connectDB from "@/utils/db";


export const updateRuleFileStatusByRuleDeveloper = async (requestId, status) => {
  try {
    await connectDB();

    // Find and update the document in one operation
    const customRuleFile = await CustomRuleFile.findOneAndUpdate(
      { request_id: requestId },
      { status: status },
      { new: true, runValidators: true }
    );

    if (!customRuleFile) {
      throw new Error("Custom rule file not found");
    }

    return {
      success: "Status updated successfully",
    };

  } catch (error) {
    console.error("Error updating custom rule file status:", error);
    return {
      error: error.message
    };
  }
};
