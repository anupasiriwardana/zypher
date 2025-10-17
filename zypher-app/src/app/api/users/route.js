import { Resend } from "resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a random password for new users
function generatePassword() {
  return crypto.randomBytes(6).toString("base64").replace(/[+/]/g, "A1");
}

export async function POST(req) {
  try {
    await connectDB();
    const { email, role } = await req.json();

    console.log("➡️ Incoming request to assign role:", email, role);

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    let user = await User.findOne({ email });

    // 🟢 CASE 1: New User → Create and send credentials
    if (!user) {
      console.log("🆕 Creating new user:", email);

      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      user = await User.create({ email, password: hashedPassword, role });

      // Send credentials email
      await resend.emails.send({
        from: "Zypher Admin <onboarding@resend.dev>", // temporary sender
        to: email,
        subject: "Your Guardian Account Credentials",
        html: `
          <table style="width:100%; font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
            <tr>
              <td>
                <table style="max-width:600px; margin:0 auto; background-color:#fff; padding:30px; border-radius:10px;">
                  <tr>
                    <td style="text-align:center;">
                      <img src="https://yourdomain.com/logo.png" alt="Zypher Logo" width="120"/>
                      <h2 style="color:#1E90FF;">Welcome to Zypher!</h2>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>Hi <b>${email}</b>,</p>
                      <p>You have been assigned the role <b>${role}</b> on the Zypher platform.</p>
                      <p><b>Email:</b> ${email}<br/>
                        <b>Password:</b> ${plainPassword}</p>
                      <p style="text-align:center;">
                        <a href="https://zypher.com/login" 
                          style="display:inline-block; padding:12px 25px; background-color:#1E90FF; color:#fff; border-radius:5px; text-decoration:none;">
                          Log in to Zypher
                        </a>
                      </p>
                      <p>Please change your password after logging in.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:center; font-size:12px; color:#888;">
                      &copy; 2025 Zypher. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          `

      });

      console.log("📧 Credentials email sent to:", email);

      return NextResponse.json({
        success: true,
        message: "New user created and credentials sent via email.",
        user,
      });
    }

    // 🟡 CASE 2: Existing User → Update role + notify
    console.log("🔄 Updating existing user role:", email);

    user.role = role;
    await user.save();

    await resend.emails.send({
      from: "Zypher Admin <onboarding@resend.dev>",
      to: email,
      subject: "Your Role Has Been Updated",
      html: `
        <p>Hello,</p>
        <p>Your role has been updated to <b>${role}</b> on Zypher.</p>
        <p>If you did not request this change, please contact an administrator immediately.</p>
      `,
    });

    console.log("📧 Role update email sent to:", email);

    return NextResponse.json({
      success: true,
      message: "Existing user role updated and notification sent.",
      user,
    });
  } catch (error) {
    console.error("❌ Error in user role management:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Fetch all users
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Reset a user's role to 'primary-user'
export async function PUT(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role: "primary-user" },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Role reset to primary-user",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing role:", error);
    return NextResponse.json(
      { error: "Failed to remove role" },
      { status: 500 }
    );
  }
}
