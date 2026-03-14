"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="text-sm bg-red-600 px-3 py-1 rounded"
      >
        Logout
      </button>
    );
  }

  return (
    <button
        onClick={() => signIn("google")}
        className="bg-[#21262d] hover:bg-[#30363d] px-5 py-2 rounded-lg text-sm transition"
        >
        Login
    </button>
  );
}