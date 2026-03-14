import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import AuthButton from "./components/AuthButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#0d1117] text-gray-200">
        <Providers>
          <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">

              {/* Left - Logo */}
              <Link href="/" className="text-xl font-bold tracking-tight">
                QuickDrop
              </Link>

              {/* Center - Navigation */}
              <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                <Link href="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/upload" className="hover:text-white transition">
                  Upload
                </Link>
              </nav>

              {/* Right - Auth */}
              <div className="flex items-center gap-4">
                <AuthButton />
              </div>

            </header>

          <main className="p-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}