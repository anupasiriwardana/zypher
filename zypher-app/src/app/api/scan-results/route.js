import FileScanResult from "@/models/FileScanResult";
import RepoScanResult from "@/models/RepoScanResult";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async (request) => {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    // Check if user is authenticated
    if (!userId || !role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based access
    const allowedRoles = ['primary-user'];
    if (!allowedRoles.includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    try {
        // Fetch file scan results for the user with only needed fields
        const pastFileScanResults = await FileScanResult.find(
            { user_id: userId },
            {
                filename: 1,
                "vulnerabilityScan.stats": 1,
                "bestPracticesScan.stats": 1,
                "customRuleScan.stats": 1,
                createdAt: 1
            }
        ).lean();

        // Fetch repo scan results for the user with only needed fields
        const pastRepoScanResults = await RepoScanResult.find(
            { user_id: userId },
            {
                repo_url: 1,
                "vulnerabilityScan.stats": 1,
                "bestPracticesScan.stats": 1,
                "customRuleScan.stats": 1,
                createdAt: 1
            }
        ).lean();

        return NextResponse.json(
            {
                pastRepoScanResults,
                pastFileScanResults
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching past scans:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
