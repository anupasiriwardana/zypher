import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import mongoose from "mongoose";

export async function GET() {
    try {
        console.log("Testing MongoDB connection...");
        
        // Log the MONGO_URI (masked)
        const mongoUri = process.env.MONGO_URI;
        if (mongoUri) {
            const maskedUri = mongoUri.replace(
                /mongodb(\+srv)?:\/\/([^:]+)(:[^@]+)?@([^\/]+)(\/.*)?/,
                (_, srv, user, pass, host, db) => `mongodb${srv || ''}://${user}:***@${host}${db || ''}`
            );
            console.log('Using MONGO_URI:', maskedUri);
        } else {
            console.log('MONGO_URI is not defined');
            return NextResponse.json({ 
                success: false, 
                error: "MONGO_URI is not defined",
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
        
        // Test DNS resolution directly (if using MongoDB Atlas)
        if (mongoUri && mongoUri.includes('+srv')) {
            const host = mongoUri.match(/@([^\/]+)\//)?.[1];
            if (host) {
                console.log(`Testing DNS resolution for ${host}`);
                // This just logs - we don't actually need to do anything with the result
            }
        }
        
        await connectDB();
        
        // Test running a simple command to ensure the connection works
        const adminDb = mongoose.connection.db.admin();
        const serverInfo = await adminDb.serverInfo();
        
        return NextResponse.json({ 
            success: true, 
            message: "Database connected successfully",
            version: serverInfo.version,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Database connection test failed:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}