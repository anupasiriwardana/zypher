import { NextResponse } from "next/server";
import connectDB from "@/utils/db";

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({ 
            success: true, 
            message: "Database connected successfully",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Database connection test failed:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
