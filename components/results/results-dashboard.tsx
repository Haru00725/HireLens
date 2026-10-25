"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ResumeAnalysis, RequirementStatus } from "@/types/analysis";
import { downloadReport } from "@/lib/report-generator";
import { EASE } from "@/lib/tokens";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Lightbulb,
} from "lucide-react";
import { BundleOptimizationWorkspace } from "./bundle-optimization-workspace";

interface Props {
  scanId: string;
  analysis: ResumeAnalysis;
  completedAt?: string | null;
  hasBundleEntitlement?: boolean;
  amountPaidPaise?: number;
  bundleData?: Record<string, unknown>;
  onRefreshScan?: () => void;
}

export function ResultsDashboard({
  scanId,
  analysis,
  completedAt,
  hasBundleEntitlement = false,
  amountPaidPaise = 0,
  bundleData,
  onRefreshScan,
}: Props) {
  const [filter, setFilter] = useState<"all" | RequirementStatus>("all");
  const [downloading, setDownloading] = useState(false);

  const {
    roleTitle,
    matchScore,
    summary,
    strengths,
    requirements,
    improvements,
    caveats,
  } = analysis;

  const handleDownload = () => {
    try {
      setDownloading(true);
      downloadReport(analysis);
    } catch (err) {
      console.error("[HireLens PDF Download Error]:", err);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const matchedCount = requirements.filter((r) => r.status === "matched").length;
  const partialCount = requirements.filter((r) => r.status === "partial").length;
  const missingCount = requirements.filter((r) => r.status === "missing").length;

  const filteredRequirements =
    filter === "all"
      ? requirements
      : requirements.filter((r) => r.status === filter);

  // Score tier
  const getScoreRating = (score: number) => {
    if (score >= 80) return { label: "High Alignment", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 60) return { label: "Moderate Match", color: "text-amber-800 bg-amber-50 border-amber-200" };
    return { label: "Significant Gaps", color: "text-rose-800 bg-rose-50 border-rose-200" };
  };

  const scoreRating = getScoreRating(matchScore);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-28 md:px-10">
      {/* Top Header bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span>SCAN ID: {scanId.slice(0, 8)}...</span>
            <span>•</span>
            <span>{completedAt ? new Date(completedAt).toLocaleDateString() : "Today"}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl text-ink">
            {roleTitle || "Target Role Analysis"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Objective candidate evaluation against explicit job requirements.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analyze"
            className="flex items-center gap-1.5 rounded-[4px] border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-line/20"
          >
            <RotateCcw size={14} /> Scan another resume
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-5 py-2.5 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <Download size={14} />
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>
      </motion.div>

      {/* Main Grid: Score Card + Overall Summary */}
      <div className="mt-8 grid gap-6 md:grid-cols-12">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex flex-col justify-between rounded-[6px] border-2 border-ink bg-paper p-6 md:col-span-4"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Match Score
              </span>
              <span
                className={`rounded-[3px] border px-2 py-0.5 font-mono text-[11px] font-semibold ${scoreRating.color}`}
              >
                {scoreRating.label}
              </span>
            </div>

            {/* Score Ring / Number */}
            <div className="mt-6 flex items-baseline gap-2">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-mono text-6xl font-bold tracking-tight text-ink md:text-7xl"
              >
                {matchScore}
              </motion.span>
              <span className="font-mono text-xl text-muted">/100</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-line/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${matchScore}%` }}
                transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
                className="h-full bg-ink"
              />
            </div>
          </div>

          <div className="mt-6 rounded-[4px] border border-line bg-line/20 p-3 text-[11px] leading-relaxed text-muted">
            <p className="flex items-center gap-1 font-medium text-ink">
              <Info size={13} className="shrink-0" />
              Not a hiring guarantee
            </p>
            <p className="mt-1">
              This score measures how clearly your resume text demonstrates the posted requirements. Real hiring decisions involve cultural fit, portfolio reviews, and recruiter subjectivity.
            </p>
          </div>
        </motion.div>

        {/* Overall Assessment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          className="flex flex-col justify-between rounded-[6px] border border-line bg-paper p-6 md:col-span-8"
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Executive Assessment
            </span>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              Overall Candidate Profile
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {summary}
            </p>
          </div>

          {/* Key Strengths Pills */}
          {strengths && strengths.length > 0 && (
            <div className="mt-6 border-t border-line/60 pt-4">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink flex items-center gap-1">
                <Sparkles size={13} className="text-lime-700" />
                Verified Strengths
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {strengths.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-line/30 px-3 py-1 text-xs text-ink"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Requirements Breakdown Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="mt-12"
      >
        <div className="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Requirements Breakdown
            </h2>
            <p className="mt-1 text-xs text-muted">
              Every extracted qualification with cited resume evidence and tailored recommendations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-[5px] border border-line bg-line/20 p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-[3px] px-3 py-1 font-mono text-xs transition-colors ${
                filter === "all"
                  ? "bg-ink font-semibold text-paper"
                  : "text-muted hover:text-ink"
              }`}
            >
              All ({requirements.length})
            </button>
            <button
              onClick={() => setFilter("matched")}
              className={`rounded-[3px] px-3 py-1 font-mono text-xs transition-colors ${
                filter === "matched"
                  ? "bg-emerald-700 font-semibold text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              Matched ({matchedCount})
            </button>
            <button
              onClick={() => setFilter("partial")}
              className={`rounded-[3px] px-3 py-1 font-mono text-xs transition-colors ${
                filter === "partial"
                  ? "bg-amber-600 font-semibold text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              Partial ({partialCount})
            </button>
            <button
              onClick={() => setFilter("missing")}
              className={`rounded-[3px] px-3 py-1 font-mono text-xs transition-colors ${
                filter === "missing"
                  ? "bg-rose-700 font-semibold text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              Missing ({missingCount})
            </button>
          </div>
        </div>

        {/* Requirements Cards */}
        <div className="mt-6 grid gap-4">
          {filteredRequirements.map((req, i) => {
            const isMatched = req.status === "matched";
            const isPartial = req.status === "partial";
            const isMissing = req.status === "missing";

            return (
              <div
                key={i}
                className="rounded-[6px] border border-line bg-paper p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {isMatched && (
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                    )}
                    {isPartial && (
                      <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                    )}
                    {isMissing && (
                      <XCircle size={18} className="shrink-0 text-rose-600" />
                    )}
                    <h3 className="font-semibold text-ink">{req.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-[3px] border ${
                        req.importance === "high"
                          ? "border-rose-300 bg-rose-50 text-rose-800"
                          : req.importance === "medium"
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-line bg-line/30 text-muted"
                      }`}
                    >
                      {req.importance} Priority
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded-[3px] ${
                        isMatched
                          ? "bg-emerald-100 text-emerald-800"
                          : isPartial
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
                  {/* Evidence Column */}
                  <div className="rounded-[4px] bg-line/20 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Resume Evidence
                    </p>
                    <p className="mt-1 leading-relaxed text-ink italic">
                      {req.evidence || "No direct evidence found in the provided resume text."}
                    </p>
                  </div>

                  {/* Recommendation Column */}
                  <div className="rounded-[4px] border border-line/60 bg-paper p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Actionable Recommendation
                    </p>
                    <p className="mt-1 leading-relaxed text-muted">
                      {req.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Suggested Improvements Section */}
      {improvements && improvements.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="mt-14"
        >
          <div className="border-b border-line pb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Targeted Resume Improvements
            </h2>
            <p className="mt-1 text-xs text-muted">
              Strategic rewrites adapted to this job posting. Adapt these examples with your authentic metrics.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {improvements.map((imp, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-[6px] border border-line bg-paper p-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-ink shrink-0" />
                    <h3 className="font-semibold text-ink">{imp.title}</h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted">
                    {imp.explanation}
                  </p>
                </div>

                <div className="mt-4 rounded-[4px] border border-ink/20 bg-lime/15 p-3.5">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink">
                    Suggested Adaptation:
                  </span>
                  <p className="mt-1 text-xs font-mono leading-relaxed text-ink">
                    "{imp.example}"
                  </p>
                  <p className="mt-2 font-mono text-[9px] text-muted">
                    *Example illustration — customize with your actual achievements and verified results.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Ethical AI & Caveats Section */}
      {caveats && caveats.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
          className="mt-14 rounded-[6px] border border-line bg-line/20 p-6"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldAlert size={16} className="text-muted" />
            Important Caveats & Limitations
          </div>
          <ul className="mt-3 grid gap-2 text-xs text-muted md:grid-cols-2">
            {caveats.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-ink font-bold">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* AI Resume Optimization & Re-Scan Bundle Workspace */}
      <BundleOptimizationWorkspace
        scanId={scanId}
        initialAnalysis={analysis}
        hasBundleEntitlement={hasBundleEntitlement}
        amountPaidPaise={amountPaidPaise}
        initialBundleData={bundleData as unknown as Parameters<typeof BundleOptimizationWorkspace>[0]["initialBundleData"]}
        onEntitlementGranted={onRefreshScan}
      />

      {/* Bottom CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[6px] border-2 border-ink bg-paper p-6 sm:flex-row"
      >
        <div>
          <h3 className="font-semibold text-ink">Take your analysis offline</h3>
          <p className="mt-0.5 text-xs text-muted">
            Download your complete branded PDF report with all requirements and rewrite suggestions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
          >
            Scan another <ArrowRight size={14} />
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <Download size={15} />
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
