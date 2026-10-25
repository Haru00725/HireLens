import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/motion/providers";

const dm = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"], weight: ["400", "500", "600"], variable: "--font-playfair", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "HireLens — Are you Hireable?",
  description: "See your resume through a recruiter's lens. Compare your resume with a specific job description.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dm.variable} ${playfair.variable} ${mono.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
