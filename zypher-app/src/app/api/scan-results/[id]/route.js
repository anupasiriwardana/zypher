import FileScanResult from "@/models/FileScanResult";
import RepoScanResult from "@/models/RepoScanResult";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async (request, context) => {
    const params = await context.params;

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

    // Get scan ID from route param
    const scanID = params.id;

    // Get type from query string
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["file", "repo"].includes(type)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await connectDB();

    try {
        let scanResult = null;

        if (type === "file") {
            scanResult = await FileScanResult.findOne({
                _id: scanID,
                user_id: userId,
            });
        } else if (type === "repo") {
            scanResult = await RepoScanResult.findOne({
                _id: scanID,
                user_id: userId,
            });
        }

        if (!scanResult) {
            return NextResponse.json({ error: "Scan not found" }, { status: 404 });
        }

        return NextResponse.json(scanResult, { status: 200 });

    } catch (error) {
        console.error("Error fetching scan result:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
