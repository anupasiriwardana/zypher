import connectDB from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";


// 🟢 GET - Fetch current user's profile
function formatRole(role) {
  if (!role) return "";
  return role
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format role here
    const formattedUser = {
      ...user.toObject(), // make sure we get a plain JS object
      role: formatRole(user.role),
    };

    return NextResponse.json(formattedUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}


// 🟡 PUT - Update profile details (image, password)
export async function PUT(req) {
  try {
    await connectDB();

    const { currentEmail, newEmail, image, currentPassword, newPassword } = await req.json();

    if (!currentEmail) {
      return NextResponse.json({ error: "Current email is required" }, { status: 400 });
    }

    // Lookup using currentEmail, not newEmail
    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // --- Email Update ---
    if (newEmail && newEmail !== currentEmail) {
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      user.email = newEmail;
    }

    // --- Profile Image Update ---
    if (image !== undefined) user.image = image;

    // --- Password Update ---
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password required to change password" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const { password, ...userWithoutPassword } = user._doc;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}


