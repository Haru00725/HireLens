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

export default function Home() {
  return (
    <>
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
