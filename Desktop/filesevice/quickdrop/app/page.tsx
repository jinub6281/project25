"use client";

import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center px-6">
      
      <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
        Droply
      </h1>

      <p className="text-gray-400 text-lg md:text-xl mb-8 text-center max-w-xl">
        Fast. Clean. Secure file sharing with zero friction.
      </p>

      <div className="flex gap-4">
        <Link
          href="/upload"
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-lg transition"
        >
          Start Uploading
        </Link>

        <Link
          href="/dashboard"
          className="border border-gray-600 hover:bg-[#161b22] px-6 py-3 rounded-xl text-lg transition"
        >
          View Files
        </Link>
      </div>
    </div>
  );
}