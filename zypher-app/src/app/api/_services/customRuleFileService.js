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

export const getRuleFilesByMaintainerForTesting = async(status) => {
  try {
    await connectDB();

    const ruleFiles = await CustomRuleFile.find({ status: status })
      .sort({ createdAt: -1 })
      .select('_id rule_id rule_name status file_content request_id rule_developer_id yaml_test_file_content createdAt')
      .lean();

    return {
      success: true,
      data: ruleFiles
    };
  } catch (error) {
    console.error("Error fetching rule files for testing:", error);
    return {
      error: error.message
    };
  }
};

export const updateRuleFileTestContentByRuleMaintainer = async (ruleId, testFileContent) => {
    try {
        await connectDB();

        // Find and update the document in one operation
        const customRuleFile = await CustomRuleFile.findOneAndUpdate(
            { rule_id: ruleId },
            { yaml_test_file_content: testFileContent },
            { new: true, runValidators: true }
        );

        if (!customRuleFile) {
            throw new Error("Custom rule file not found");
        }

        return {
            success: "Test file content updated successfully",
        };

    } catch (error) {
        console.error("Error updating custom rule file test content:", error);
        return {
            error: error.message
        };
    }
}

export const updateRuleFileStatusByRuleMaintainer = async (ruleId, status) => {
    try {
        await connectDB();

        // Find and update the document in one operation
        const customRuleFile = await CustomRuleFile.findOneAndUpdate(
            { rule_id: ruleId },
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
