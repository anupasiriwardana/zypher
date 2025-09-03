import CustomRuleRequest from "@/models/CustomRuleRequest";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

//submit custom rule request
export const POST = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  // Check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check role-based access
  const allowedRoles = ['primary-user'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await connectDB();

  const { rule_name, rule_description, suggested_severity, sample_code } = await request.json();

  try {
    const customRuleRequestDoc = new CustomRuleRequest({
      name: rule_name,
      description: rule_description,
      suggested_severity: suggested_severity,
      sample_code: sample_code,
      status: "Pending Review",
      user_id: userId
    });

    await customRuleRequestDoc.save();

    return NextResponse.json(
      { success: "Custom rule request saved successfully", id: customRuleRequestDoc._id },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error saving custom rule request:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
};


// Fetch custom rule requests
export const GET = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  // Check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check role-based access
  const allowedRoles = ['primary-user', 'rule-maintainer', 'rule-developer'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await connectDB();

  try {
    // Fetching custom rules seperately for primary user and rule maintainer
    if (role === 'primary-user') {
      const customRuleRequests = await CustomRuleRequest.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .select('name description suggested_severity sample_code status createdAt')
        .lean();

      return NextResponse.json(
        { requests: customRuleRequests },
        { status: 200 }
      );
    } else if (role === 'rule-maintainer') {
      const customRuleRequests = await CustomRuleRequest.find()
        .sort({ createdAt: -1 })
        .select('_id name description suggested_severity sample_code status assigned_developer rejected_reason createdAt')
        .lean();

      return NextResponse.json(
        { requests: customRuleRequests },
        { status: 200 }
      );
    } else if (role === 'rule-developer') {
      const customRuleRequests = await CustomRuleRequest.find({ assigned_developer: userId })
        .sort({ createdAt: -1 })
        .select('_id name description suggested_severity sample_code status rejected_reason createdAt')
        .lean();

      return NextResponse.json(
        { requests: customRuleRequests },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Error fetching custom rule requests:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
};

// update custom rule request status
export const PATCH = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  // Check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check role-based access 
  const allowedRoles = ['rule-maintainer'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await connectDB();

  const { requestId, developerId, status, rejected_reason } = await request.json();
  // In your PATCH route, add this at the beginning:
  console.log("Received status:", status);
  console.log("Received developerId:", developerId);
  console.log("Received rejected_reason:", rejected_reason);

  // Also add this to see the enum values from the model:
  console.log("Allowed status values:", CustomRuleRequest.schema.path('status').enumValues);

  try {
    // Validate required fields based on status
    if (status === "Assigned" && !developerId) {
      return NextResponse.json(
        { error: "Developer ID is required when status is 'Assigned'" },
        { status: 400 }
      );
    }

    if (status === "Rejected" && (!rejected_reason || rejected_reason.trim() === "")) {
      return NextResponse.json(
        { error: "Rejection reason is required when status is 'Rejected'" },
        { status: 400 }
      );
    }

    // Find the document first
    const customRuleRequest = await CustomRuleRequest.findById(requestId);
    if (!customRuleRequest) {
      return NextResponse.json(
        { error: "Custom rule request not found" },
        { status: 404 }
      );
    }

    // Update the document properties
    customRuleRequest.status = status;

    if (status === "Assigned") {
      customRuleRequest.assigned_developer = developerId;
      customRuleRequest.rejected_reason = undefined; // Clear rejection reason
    } else if (status === "Rejected") {
      customRuleRequest.rejected_reason = rejected_reason;
      customRuleRequest.assigned_developer = null; // Clear assigned developer
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
    }

    return NextResponse.json(
      {
        success: successMessage,
        request: customRuleRequest
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating custom rule request:", error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
};