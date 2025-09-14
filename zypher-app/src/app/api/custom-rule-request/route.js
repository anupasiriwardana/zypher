import CustomRuleRequest from "@/models/CustomRuleRequest";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

import { 
  updateCustomRuleRequestStatusByRuleMaintainer,
  updateRuleRequestStatusByRuleDeveloper 
} from "../_services/customRuleRequestService";

import {
  updateRuleFileStatusByRuleDeveloper
} from "../_services/customRuleFileService";

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
  const allowedRoles = ['rule-maintainer', 'rule-developer'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  let result = {};
  if(role === 'rule-maintainer'){
    const { requestId, developerId, status, rejected_reason } = await request.json();
    result = await updateCustomRuleRequestStatusByRuleMaintainer(requestId, status, developerId, rejected_reason);
  
  }else if(role === 'rule-developer'){
    const { requestId, status } = await request.json();
    result = await updateRuleRequestStatusByRuleDeveloper(requestId, status);

    //also update the rule file status if ready for testing
    if(status === "Ready for Testing") {
      await updateRuleFileStatusByRuleDeveloper(requestId, "Under testing");
    }
  }

  if(result.success) {
    return NextResponse.json(
      { success: result.success},
      { status: 200 }
    );
  }else{
    return NextResponse.json(
      { error: result.error || "Internal server error" },
      { status: 500 }
    );
  }
};