import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { AnalyzerShell } from "@/components/analyzer/analyzer-shell";

export const metadata: Metadata = {
  title: "Analyze Resume — HireLens",
  description:
    "Upload your resume and match it against any job description. Get an objective score, requirements breakdown, and actionable improvements for ₹19.",
};

export default function AnalyzePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-paper">
        <AnalyzerShell />
      </main>
      <SiteFooter />
    </>
  );
}
