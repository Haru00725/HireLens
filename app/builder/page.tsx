import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { ResumeBuilder } from "@/components/builder/resume-builder";
import { JsonLd } from "@/components/seo/json-ld";
import { getBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Free ATS Resume Builder with PDF Export",
  description:
    "Build a single-column, strictly ATS-friendly resume from your real experience, projects, and skills. 100% free with instant vector PDF export and seamless role matching.",
  alternates: {
    canonical: "https://hirelens.delusive.studio/builder",
  },
  openGraph: {
    title: "Free ATS Resume Builder with PDF Export | HireLens",
    description:
      "Build a single-column, strictly ATS-friendly resume from your real experience, projects, and skills. 100% free with instant vector PDF export.",
    url: "https://hirelens.delusive.studio/builder",
  },
};

export default function BuilderPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Free ATS Resume Builder", path: "/builder" },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <Navbar />
      <main className="min-h-screen bg-paper">
        <ResumeBuilder />
      </main>
      <SiteFooter />
    </>
  );
}
