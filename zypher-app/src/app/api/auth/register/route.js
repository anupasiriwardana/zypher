import User from "@/models/User";
import connectDB from "@/utils/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  const { email, password, role } = await request.json();
  
  await connectDB();
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {      
      return new NextResponse(
        JSON.stringify({ 
          error: "An account with this email already exists." 
        }), 
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'primary-user',
      provider: 'local',
      image: null // Default image can be set later
    });
    
    await newUser.save();
    
    return new NextResponse(
      JSON.stringify({ message: "User registered successfully" }), 
      { status: 201 }
    );
    
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error"
      }), 
      { status: 500 }
    );
  }
};