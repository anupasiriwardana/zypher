import CustomRuleFile from '@/models/CustomRuleFile';
import CustomRuleMetadata from '@/models/CustomRuleMetadata';
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

import {
    getRuleFilesByMaintainerForTesting,
    updateRuleFileTestContentByRuleMaintainer
} from "@/app/api/_services/customRuleFileService";

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
    const allowedRoles = ['rule-developer', 'rule-maintainer'];
    if (!allowedRoles.includes(role)) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    await connectDB();

    const { ruleId, ruleName, ruleStatus, ruleFileContent, ruleOwnerId, requestId, yamlTestFileContent } = await request.json();

    try {
        //check whether rule metadata is present
        const existingMetadata = await CustomRuleMetadata.findOne({ rule_id: ruleId });
        if (!existingMetadata) {
            throw new Error("Rule metadata not found. Please Save rule metadata first");
        }

        // Check if a record with the same rule_id already exists
        const existingRule = await CustomRuleFile.findOne({ rule_id: ruleId });

        if (existingRule) {
            // Update existing record
            existingRule.rule_name = ruleName;
            existingRule.status = ruleStatus;
            existingRule.file_content = ruleFileContent;
            existingRule.rule_owner_id = ruleOwnerId;
            existingRule.request_id = requestId;
            existingRule.rule_developer_id = userId;
            existingRule.yaml_test_file_content = yamlTestFileContent || null;

            await existingRule.save();

            return NextResponse.json(
                { success: "Custom rule file updated successfully", id: existingRule._id },
                { status: 200 }
            );
        } else {
            // Create new record
            const customRuleFileDoc = new CustomRuleFile({
                rule_id: ruleId,
                rule_name: ruleName,
                status: ruleStatus,
                file_content: ruleFileContent,
                rule_owner_id: ruleOwnerId,
                request_id: requestId,
                rule_developer_id: userId,
                yaml_test_file_content: yamlTestFileContent || null
            });

            await customRuleFileDoc.save();

            return NextResponse.json(
                { success: "Custom rule file saved successfully", id: customRuleFileDoc._id },
                { status: 200 }
            );
        }

    } catch (error) {
        console.error("Error saving custom rule file:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};


// Fetch custom rules of a developer
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
    const allowedRoles = ['rule-developer', 'rule-maintainer'];
    if (!allowedRoles.includes(role)) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    await connectDB();

    if (role === 'rule-developer') {
        try {
            const customRuleFiles = await CustomRuleFile.find({ rule_developer_id: userId, status: "Under development" })
                .sort({ createdAt: -1 })
                .select('_id rule_id rule_name status file_content rule_owner_id request_id yaml_test_file_content createdAt')
                .lean();

            return NextResponse.json(
                { ruleFiles: customRuleFiles },
                { status: 200 }
            );

        } catch (error) {
            console.error("Error fetching custom rule files:", error);
            return NextResponse.json(
                { error: error.message || "Internal server error" },
                { status: 500 }
            );
        }
    } else if (role === 'rule-maintainer') {
        const result = await getRuleFilesByMaintainerForTesting("Under testing");
        if (result.error) {
            return NextResponse.json(
                { error: result.error || "Internal server error" },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { ruleFiles: result.data },
            { status: 200 }
        );
    }
};

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
    const allowedRoles = ['rule-developer', 'rule-maintainer'];
    if (!allowedRoles.includes(role)) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    await connectDB();

    if (role === 'rule-maintainer') {
        const { ruleId, testFileContent } = await request.json();
        const result = await updateRuleFileTestContentByRuleMaintainer(ruleId, testFileContent);
        if (result.error) {
            return NextResponse.json(
                { error: result.error || "Internal server error" },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: result.success },
            { status: 200 }
        );
    }
    return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
    );
};
