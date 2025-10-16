import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";

// Fetch all users
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Assign/Update role for a user
export async function POST(req) {
  try {
    await connectDB();
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // update role by email
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }
}

// Remove a role (set back to primary-user)
export async function PUT(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role: "primary-user" },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error removing role:", error);
    return NextResponse.json({ error: "Failed to remove role" }, { status: 500 });
  }
}
