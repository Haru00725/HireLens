import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { AnalyzerShell } from "@/components/analyzer/analyzer-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { getBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "AI Resume Checker & Job Description Matcher",
  description:
    "Upload your resume in PDF/DOCX or text format and compare it with any job description. Get calibrated match scores, evidence breakdowns, and actionable suggestions.",
  alternates: {
    canonical: "https://hirelens.delusive.studio/analyze",
  },
  openGraph: {
    title: "AI Resume Checker & Job Description Matcher | HireLens",
    description:
      "Upload your resume in PDF/DOCX or text format and compare it with any job description. Get calibrated match scores, evidence breakdowns, and actionable suggestions.",
    url: "https://hirelens.delusive.studio/analyze",
  },
};

export default function AnalyzePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "AI Resume Checker", path: "/analyze" },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <Navbar />
      <main className="min-h-screen bg-paper">
        <AnalyzerShell />
      </main>
      <SiteFooter />
    </>
  );
}
