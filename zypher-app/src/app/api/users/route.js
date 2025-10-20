import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // your Gmail
    pass: process.env.GMAIL_PASS, // app password
  },
});

// Generate a random password for new users
function generatePassword() {
  return crypto.randomBytes(6).toString("base64").replace(/[+/]/g, "A1");
}

// 🟢 POST → Create new user or update role
export async function POST(req) {
  try {
    await connectDB();
    const { email, role } = await req.json();

    console.log("➡️ Incoming request to assign role:", email, role);

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    let user = await User.findOne({ email });

    // 🆕 CASE 1: New user
    if (!user) {
      console.log("🆕 Creating new user:", email);

      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      user = await User.create({ email, password: hashedPassword, role });

      // Send credentials email
      try {
        await transporter.sendMail({
          from: `"Zypher Admin" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: "Your Guardian Account Credentials",
          html: `
            <table style="width:100%; font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
              <tr><td>
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
                      <p>You have been assigned the role <b>${role}</b> on Zypher.</p>
                      <p><b>Email:</b> ${email}<br/><b>Password:</b> ${plainPassword}</p>
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
              </td></tr>
            </table>
          `,
        });
        console.log("📧 Credentials email sent to:", email);
      } catch (err) {
        console.error("❌ Failed to send credentials email:", err);
        return NextResponse.json({
          success: true,
          emailSent: false,
          emailError: err.message || "Unknown send error",
          message: "New user created, but failed to send credentials email.",
          user,
        });
      }

      return NextResponse.json({
        success: true,
        emailSent: true,
        message: "New user created and credentials sent via email.",
        user,
      });
    }

    // 🟡 CASE 2: Existing User → Update role + notify
    console.log("🔄 Updating existing user role:", email);
    user.role = role;
    await user.save();

    // Send role update email
    try {
      await transporter.sendMail({
        from: `"Zypher Admin" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your Role Has Been Updated",
        html: `
          <p>Hello,</p>
          <p>Your role has been updated to <b>${role}</b> on Zypher.</p>
          <p>If you did not request this change, please contact an administrator immediately.</p>
        `,
      });
      console.log("📧 Role update email sent to:", email);
    } catch (err) {
      console.error("❌ Failed to send role update email:", err);
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: err.message || "Unknown send error",
        message: "User role updated, but failed to send notification email.",
        user,
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: "Existing user role updated and notification sent.",
      user,
    });

  } catch (error) {
    console.error("❌ Error in user role management:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
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
