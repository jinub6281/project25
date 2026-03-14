import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const uploadDir = path.join(process.cwd(), "public/uploads");

  if (!fs.existsSync(uploadDir)) {
    return NextResponse.json([]);
  }

  const files = fs.readdirSync(uploadDir);

  const fileData = files.map((file) => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);

    return {
      name: file,
      size: stats.size,
      created: stats.birthtime,
    };
  });

  // 🔥 최신순 정렬
  fileData.sort((a, b) => b.created.getTime() - a.created.getTime());

  return NextResponse.json(fileData);
}