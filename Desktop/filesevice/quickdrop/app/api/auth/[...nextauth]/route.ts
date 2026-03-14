import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 1. 설정을 여기서 바로 정의하고 내보냅니다 (다른 파일에서 쓰기 위함)
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // 로그인이 안 될 때 에러를 확인하기 위해 디버그 모드 추가
  debug: true, 
};

// 2. Next.js App Router용 핸들러
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };