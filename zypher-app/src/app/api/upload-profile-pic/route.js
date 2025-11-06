import fs from "fs";
import path from "path";
import connectDB from "@/utils/db";
import User from "@/models/User";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  await connectDB();

  // Read the request as FormData
  const formData = await req.formData();
  const file = formData.get("profilePic");
  const userId = formData.get("userId");

  if (!file || !userId) {
    return new Response(JSON.stringify({ error: "No file or userId provided" }), { status: 400 });
  }

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save file to public/images
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path.join(process.cwd(), "public/images", fileName);
  fs.writeFileSync(filePath, buffer);

  const url = `/images/${fileName}`;

  // Save URL to MongoDB
  try {
    await User.updateOne({ _id: userId }, { profilePicture: url });
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Database update failed" }), { status: 500 });
  }
}
