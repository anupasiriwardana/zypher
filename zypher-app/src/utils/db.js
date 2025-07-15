import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    }catch (error) {
        throw new Error(`Failed to connect to database: ${error.message}`);
    }
};

export default connectDB;