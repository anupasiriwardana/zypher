import CustomRuleRequest from "@/models/CustomRuleRequest";
import connectDB from "@/utils/db";

export const updateCustomRuleRequestStatusByRuleMaintainer = async (requestId, status, developerId, rejected_reason) => {
  try {
    await connectDB();

    // Validate required fields based on status
    if (status === "Assigned" && !developerId) {
        throw new Error("Developer ID is required when status is 'Assigned'");
    }

    if (status === "Rejected" && (!rejected_reason || rejected_reason.trim() === "")) {
        throw new Error("Rejection reason is required when status is 'Rejected'");
    }

    if (status === "Under Modification" && (!rejected_reason || rejected_reason.trim() === "")) {
        throw new Error("Rejection reason is required when status is 'Under Modification'");
    }

    // Find the document first
    const customRuleRequest = await CustomRuleRequest.findById(requestId);
    if (!customRuleRequest) {
      throw new Error("Custom rule request not found");
    };

    // Update the document properties
    customRuleRequest.status = status;

    if (status === "Assigned") {
      customRuleRequest.assigned_developer = developerId;
      customRuleRequest.rejected_reason = undefined; // Clear rejection reason
    } else if (status === "Rejected") {
      customRuleRequest.rejected_reason = rejected_reason;
      customRuleRequest.assigned_developer = null; // Clear assigned developer
    } else if (status === "Under Modification") {
      customRuleRequest.rejected_reason = rejected_reason;
    } else {
      // For other status changes, clear rejected_reason if it exists
      customRuleRequest.rejected_reason = undefined;
    }

    // Save the document (this will trigger validation)
    await customRuleRequest.save();

    // Populate the assigned_developer field
    await customRuleRequest.populate('assigned_developer', 'email');

    let successMessage = "Status updated successfully";
    if (status === "Assigned") {
      successMessage = "Developer assigned successfully";
    } else if (status === "Rejected") {
      successMessage = "Request rejected successfully";
    } else if (status === "Under Modification") {
      successMessage = "Request is under modification";
    }

    return {
      success: successMessage,
    };

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return {
        error: error.message
      };
    }

    return {
      error: error.message
    };
  }
};



export const updateRuleRequestStatusByRuleDeveloper = async (requestId, status) => {
  try {
    await connectDB();

    // Find the document first
    const customRuleRequest = await CustomRuleRequest.findById(requestId);
    if (!customRuleRequest) {
      throw new Error("Custom rule request not found");
    };

    // Update the document properties
    customRuleRequest.status = status;

    await customRuleRequest.save();

    return {
      success: "Status updated successfully",
    };

  } catch (error) {
    return {
      error: error.message
    };
  }
};
