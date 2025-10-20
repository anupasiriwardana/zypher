import connectDB from "@/utils/db";
import Role from "@/models/Role";

export async function GET(req, { params }) {
  await connectDB();

  // params is already available here
  const role_id = params?.role_id; // must match folder name [role_id]

  if (!role_id) {
    return new Response(JSON.stringify({ error: "Role ID is required" }), { status: 400 });
  }

  try {
    const role = await Role.findById(role_id).lean(); // for ObjectId _id
    if (!role) return new Response(JSON.stringify({ error: "Role not found" }), { status: 404 });

    return new Response(JSON.stringify(role), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
