import User from "@/models/User";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  //check if user is authenticated
  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  //check role-based access
  const allowedRoles = ['rule-maintainer'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    // fetch rule developers
    const rule_developers = await User.find({ role: 'rule-developer' })
      .select('email') // Only select email field
      .lean(); // Use lean to get plain JavaScript objects
    if (!rule_developers || rule_developers.length === 0) {
      return NextResponse.json(
        { error: "No rule developers found." },
        { status: 404 }
      );
    }
    

    return NextResponse.json(
      { 
        rule_developers
      }, 
      { status: 200 }
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