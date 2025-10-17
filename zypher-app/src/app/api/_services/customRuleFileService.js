import CustomRuleFile from "@/models/CustomRuleFile";
import BestPracticeRule from "@/models/BestPracticeFile";
import VulnerabilityRule from "@/models/VulnerabilityFile";
import CustomRule from "@/models/PublishedCustomRule";
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

export const updateRuleFileStatusByRuleMaintainer = async (ruleId, status, category) => {
  try {
    await connectDB();

    // 1️⃣ Update the rule file status in CustomRuleFile
    const customRuleFile = await CustomRuleFile.findOneAndUpdate(
      { rule_id: ruleId },
      { status },
      { new: true, runValidators: true }
    );

    if (!customRuleFile) {
      throw new Error("Custom rule file not found");
    }

    // 2️⃣ If status is "Active", publish to the corresponding collection
    if (status === "Active") {
      let targetModel;

      switch (category?.toLowerCase()) {
        case "bestpractice":
          targetModel = BestPracticeRule;
          break;
        case "vulnerability":
          targetModel = VulnerabilityRule;
          break;
        case "custom":
          targetModel = CustomRule;
          break;
        default:
          throw new Error(`Invalid category: ${category}`);
      }

      // Check if the rule already exists to avoid duplication
      const existingRule = await targetModel.findOne({ rule_id: ruleId });

      if (!existingRule) {
        await targetModel.create({
          rule_id: customRuleFile.rule_id,
          rule_name: customRuleFile.rule_name,
          description: customRuleFile.description || "No description available",
          file_content: customRuleFile.file_content,
          yaml_test_file_content: customRuleFile.yaml_test_file_content,
          rule_owner_id: customRuleFile.rule_owner_id,
          created_at: customRuleFile.createdAt, // or created_at if using that in DB
        });
      }
    }

    return { success: "Status updated and rule published successfully" };

  } catch (error) {
    console.error("Error updating rule file status:", error);
    return { error: error.message };
  }
};
