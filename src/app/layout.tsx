import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HUD from "@/components/ui/HUD";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Helix - Escape Room",
  description: "A team-based interactive escape room web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col relative">
        {/* Glow Effects Background */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[100px]" />
          <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-purple-900/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] rounded-full bg-green-900/10 blur-[100px]" />
        </div>
        
        <HUD />
        
        <main className="flex-1 flex flex-col pt-24 px-4 pb-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
