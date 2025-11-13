import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not defined");
    }

    try {
        const options = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 60000,
            family: 4, // Use IPv4, skip trying IPv6
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        isConnected = false;
        
        // More specific error messages
        if (error.message.includes("ENOTFOUND")) {
            throw new Error("Database server not found. Please check your MongoDB connection string and network connectivity.");
        } else if (error.message.includes("authentication failed")) {
            throw new Error("Database authentication failed. Please check your username and password.");
        } else {
            throw new Error(`Failed to connect to database: ${error.message}`);
        }
    }
};

export default connectDB;