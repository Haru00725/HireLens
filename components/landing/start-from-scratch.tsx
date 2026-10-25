"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE } from "@/lib/tokens";
import { FileText, Sparkles, ArrowRight, Check } from "lucide-react";

export function StartFromScratch() {
  return (
    <section className="relative border-t border-line bg-paper px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="label font-mono text-xs uppercase tracking-wider text-muted">
            START FROM SCRATCH
          </span>
          <h2 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight text-ink leading-tight">
            Your first resume. <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal">A stronger next step.</span>
          </h2>
          <p className="mt-4 text-base text-muted leading-relaxed">
            Create a professional resume from your real experience, projects, and skills. Refine every section, preview your ATS-friendly resume, and export it when you're ready.
          </p>
        </div>

        {/* Two Paths Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Path 1: I have a resume */}
          <div className="group rounded-[6px] border-2 border-ink bg-white p-8 shadow-[3px_3px_0_#111318] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                Path 01 • Match against a job
              </span>
              <span className="rounded-[4px] border border-ink bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-ink">
                Instant Scan
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-ink">I have a resume</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Upload your current PDF or DOCX file. Compare it against any target job description to pinpoint gaps, evidence match scores, and recruiter-focused improvements.
            </p>

            <ul className="mt-6 space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Calibrated 0–100 match score</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Detailed requirements breakdown with evidence</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Downloadable branded analysis report</span>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-bold text-ink shadow-[2px_2px_0_#111318] transition-all hover:bg-lime/90"
              >
                <span>Check my resume ↗</span>
              </Link>
            </div>
          </div>

          {/* Path 2: I need a resume */}
          <div className="group rounded-[6px] border-2 border-ink bg-paper p-8 shadow-[3px_3px_0_#111318] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                Path 02 • Build from experience
              </span>
              <span className="rounded-[4px] border border-ink bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-ink">
                100% Free
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-ink">I need a resume</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Start from scratch with our guided ATS resume builder. Enter your education, projects, and work experience. Generate a strictly single-column, recruiter-ready vector PDF.
            </p>

            <ul className="mt-6 space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Single-column format guaranteed for ATS readability</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>AI assistance for summary and bullet point clarity</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Instant PDF export and seamless role matching</span>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 rounded-[4px] border-2 border-ink bg-ink px-6 py-3 text-xs font-bold text-paper shadow-[2px_2px_0_#111318] transition-all hover:bg-ink/90"
              >
                <span>Build my resume →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
