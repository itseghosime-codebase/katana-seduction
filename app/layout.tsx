import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Katana Seduction",
  description: "Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased relative min-h-screen flex flex-col`}
      >

        {/* Overlay */}
        <div className="fixed inset-0 z-10 h-full bg-white/17 backdrop-blur-3xl" />

        {/* Main Content */}
        <main className="relative z-20 w-full max-w-[1450px] mx-auto flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-14">
          {children}
        </main>
      </body>
    </html>
  );
}
