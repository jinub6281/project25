import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
// 경로가 중요합니다! [...nextauth] 안의 route 파일을 가리켜야 합니다.
import { authOptions } from "../auth/[...nextauth]/route"; 

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  // .env의 이메일들을 배열로 변환 (공백 제거 포함)
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "public/uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}