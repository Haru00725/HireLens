import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { ResumeBuilder } from "@/components/builder/resume-builder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ATS Resume Builder — HireLens",
  description:
    "Build a single-column, strictly ATS-friendly resume from your real experience, projects, and skills. Free PDF export and direct role matching.",
};

export default function BuilderPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-paper">
        <ResumeBuilder />
      </main>
      <SiteFooter />
    </>
  );
}
