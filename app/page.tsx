import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSequence } from "@/components/landing/problem-sequence";
import { ProblemExplanation } from "@/components/landing/problem-explanation";
import { AboutSection } from "@/components/landing/about-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ResultsPreview } from "@/components/landing/results-preview";
import { FeaturesSection } from "@/components/landing/features-section";
import { StartFromScratch } from "@/components/landing/start-from-scratch";
import { PrivacySection } from "@/components/landing/privacy-section";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getWebApplicationSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: {
    absolute: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
  },
  description:
    "Compare your resume against any job description with calibrated match scores and missing requirements, or build a strictly ATS-friendly resume for free with vector PDF export.",
  alternates: {
    canonical: "https://hirelens.delusive.studio",
  },
  openGraph: {
    title: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
    description:
      "Compare your resume against any job description with calibrated match scores and missing requirements, or build a strictly ATS-friendly resume for free with vector PDF export.",
    url: "https://hirelens.delusive.studio",
  },
};

export default function Home() {
  const webAppSchema = getWebApplicationSchema();

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSequence />
        <ProblemExplanation />
        <AboutSection />
        <HowItWorks />
        <ResultsPreview />
        <FeaturesSection />
        <StartFromScratch />
        <PrivacySection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
