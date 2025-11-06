import connectDB from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

// 🟢 Helper - Format role
function formatRole(role) {
  if (!role) return "";
  return role
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 🟢 GET - Fetch current user's profile
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email"); // optional fallback

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    // Find user by ID (preferred) or email (fallback)
    const user = userId
      ? await User.findById(userId).select("-password")
      : await User.findOne({ email }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedUser = {
      ...user.toObject(),
      role: formatRole(user.role),
    };

    return NextResponse.json(formattedUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// 🟡 PUT - Update profile details
export async function PUT(req) {
  try {
    await connectDB();

    const {
      userId,
      currentEmail,
      newEmail,
      image,
      currentPassword,
      newPassword,
    } = await req.json();

    if (!userId && !currentEmail) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ email: currentEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // --- Email Update ---
    if (newEmail && newEmail !== user.email) {
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
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
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 401 }
        );
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
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
