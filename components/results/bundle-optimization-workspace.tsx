"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ResumeAnalysis } from "@/types/analysis";
import type { ATSResumeData, ContextualQuestion } from "@/types/resume";
import { ATSResumePreview } from "@/components/builder/ats-resume-preview";
import { downloadATSResumePDF } from "@/lib/ats-pdf-generator";
import { downloadReport } from "@/lib/report-generator";
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Download,
  AlertCircle,
  Loader2,
  TrendingUp,
  FileCheck2,
  Eye,
  Edit3,
} from "lucide-react";

interface Props {
  scanId: string;
  initialAnalysis: ResumeAnalysis;
  hasBundleEntitlement: boolean;
  amountPaidPaise: number;
  initialBundleData?: {
    contextualQuestions?: ContextualQuestion[];
    userAnswers?: Record<string, string>;
    enhancedResume?: ATSResumeData;
    enhancedScore?: number;
    rescanReport?: ResumeAnalysis;
    rescanConsumed?: boolean;
  };
  onEntitlementGranted?: () => void;
}

export function BundleOptimizationWorkspace({
  scanId,
  initialAnalysis,
  hasBundleEntitlement,
  amountPaidPaise,
  initialBundleData,
  onEntitlementGranted,
}: Props) {
  // Upgrade state
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Bundle optimization state
  const [stage, setStage] = useState<"questions" | "edit_resume" | "comparison">(
    initialBundleData?.rescanConsumed && initialBundleData?.rescanReport
      ? "comparison"
      : initialBundleData?.enhancedResume
      ? "edit_resume"
      : "questions"
  );

  const [questions, setQuestions] = useState<ContextualQuestion[]>(
    initialBundleData?.contextualQuestions || []
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialBundleData?.userAnswers || {}
  );
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [rescaning, setRescaning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enhancedResume, setEnhancedResume] = useState<ATSResumeData | null>(
    initialBundleData?.enhancedResume || null
  );
  const [rescanReport, setRescanReport] = useState<ResumeAnalysis | null>(
    initialBundleData?.rescanReport || null
  );
  const [enhancedScore, setEnhancedScore] = useState<number | null>(
    initialBundleData?.enhancedScore ?? null
  );

  // Calculate upgrade amount: ₹39 minus whatever was verified paid
  const paidInr = Math.round(amountPaidPaise / 100);
  const upgradePriceInr = Math.max(0, 39 - paidInr);

  // Load contextual questions on mount if entitled and not loaded
  useEffect(() => {
    if (hasBundleEntitlement && questions.length === 0 && !enhancedResume && !loadingQuestions) {
      setLoadingQuestions(true);
      fetch(`/api/scans/${scanId}/bundle/questions`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.questions && Array.isArray(data.questions)) {
            setQuestions(data.questions);
          }
        })
        .catch((err) => console.error("Failed to load questions:", err))
        .finally(() => setLoadingQuestions(false));
    }
  }, [hasBundleEntitlement, scanId, questions.length, enhancedResume, loadingQuestions]);

  // Handle post-scan bundle upgrade
  const handleUpgrade = async () => {
    setUpgrading(true);
    setUpgradeError(null);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          upgrade: true,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.message || orderData.error || "Failed to create upgrade order.");
      }

      const RazorpayConstructor = (window as unknown as { Razorpay?: new (opts: unknown) => { open: () => void } }).Razorpay;
      if (!orderData.keyId || !RazorpayConstructor) {
        throw new Error("Razorpay checkout is unavailable. Verify configuration.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "HireLens",
        description: "Upgrade to Complete AI Optimization Bundle",
        order_id: orderData.orderId,
        theme: { color: "#111318" },
        modal: {
          ondismiss: () => setUpgrading(false),
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                scanId,
                upgrade: true,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Upgrade verification failed.");
            setUpgrading(false);
            if (onEntitlementGranted) onEntitlementGranted();
            window.location.reload();
          } catch (vErr) {
            setUpgradeError(vErr instanceof Error ? vErr.message : "Verification error.");
            setUpgrading(false);
          }
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Upgrade initiation failed.");
      setUpgrading(false);
    }
  };

  // Submit answers & generate enhanced resume
  const handleGenerateEnhancedResume = async () => {
    setOptimizing(true);
    setError(null);

    try {
      const res = await fetch(`/api/scans/${scanId}/bundle/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || resData.error || "Failed to generate enhanced resume.");
      }

      setEnhancedResume(resData.enhancedResume);
      setStage("edit_resume");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed.");
    } finally {
      setOptimizing(false);
    }
  };

  // Run the included rescan against the same JD
  const handleRunRescan = async () => {
    if (!enhancedResume) return;
    setRescaning(true);
    setError(null);

    try {
      const res = await fetch(`/api/scans/${scanId}/bundle/rescan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enhancedResume }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || resData.error || "Failed to execute re-scan.");
      }

      setRescanReport(resData.rescanReport);
      setEnhancedScore(resData.enhancedScore);
      setStage("comparison");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-scan failed.");
    } finally {
      setRescaning(false);
    }
  };

  // CASE 1: USER DOES NOT HAVE BUNDLE ENTITLEMENT (Show Upgrade Card)
  if (!hasBundleEntitlement) {
    return (
      <div className="mt-14 rounded-[8px] border-2 border-ink bg-white p-7 shadow-[4px_4px_0_#111318]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-[4px] border border-ink bg-lime px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                PACKAGE UPGRADE AVAILABLE
              </span>
              <span className="font-mono text-xs text-muted">
                Incremental Price: ₹{upgradePriceInr}
              </span>
            </div>

            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              Upgrade to Complete AI Optimization Bundle
              <Sparkles size={18} className="text-lime-600 fill-lime-400" />
            </h3>

            <p className="text-xs leading-relaxed text-muted">
              Turn this analysis into a concrete, interview-ready resume. Answer a few targeted questions about your real background, receive an AI-enhanced ATS resume, and run your included re-scan against this exact job.
            </p>

            <ul className="grid gap-2 pt-1 text-xs text-muted sm:grid-cols-2">
              <li className="flex items-center gap-1.5 font-medium text-ink">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Targeted questions for missing requirements
              </li>
              <li className="flex items-center gap-1.5 font-medium text-ink">
                <CheckCircle2 size={13} className="text-emerald-600" />
                AI-enhanced ATS-friendly resume
              </li>
              <li className="flex items-center gap-1.5 font-medium text-ink">
                <CheckCircle2 size={13} className="text-emerald-600" />
                1 included re-scan against this role
              </li>
              <li className="flex items-center gap-1.5 font-medium text-ink">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Before & after score comparison
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="text-right">
              <span className="font-mono text-3xl font-extrabold text-ink">
                ₹{upgradePriceInr}
              </span>
              <span className="ml-1 font-mono text-xs text-muted">one-time</span>
              <p className="text-[10px] text-muted">Total bundle value ₹39</p>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-bold text-ink shadow-[2px_2px_0_#111318] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {upgrading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Upgrade to Bundle (₹{upgradePriceInr}) →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {upgradeError && (
          <p className="mt-3 text-xs text-rose-600 font-medium">{upgradeError}</p>
        )}
      </div>
    );
  }

  // CASE 2: USER HAS VERIFIED BUNDLE ENTITLEMENT
  return (
    <div className="mt-14 space-y-8 rounded-[8px] border-2 border-ink bg-paper p-6 md:p-8 shadow-[4px_4px_0_#111318]">
      {/* Workspace Header */}
      <div className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] border border-ink bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
              COMPLETE BUNDLE UNLOCKED
            </span>
            <span className="font-mono text-xs text-muted">Step 2 of 2 • AI Optimization</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            AI Resume Optimization & Included Re-Scan
          </h2>
          <p className="text-xs text-muted">
            Enhance your evidence alignment based on verified facts, review your ATS resume, and re-score against this job.
          </p>
        </div>

        {/* Progress Tracker Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span
            className={`rounded-[3px] px-2.5 py-1 ${
              stage === "questions" ? "bg-ink text-paper font-bold" : "bg-line/30 text-muted"
            }`}
          >
            1. Evidence Q&A
          </span>
          <span className="text-muted">→</span>
          <span
            className={`rounded-[3px] px-2.5 py-1 ${
              stage === "edit_resume" ? "bg-ink text-paper font-bold" : "bg-line/30 text-muted"
            }`}
          >
            2. ATS Review
          </span>
          <span className="text-muted">→</span>
          <span
            className={`rounded-[3px] px-2.5 py-1 ${
              stage === "comparison" ? "bg-lime text-ink font-bold border border-ink" : "bg-line/30 text-muted"
            }`}
          >
            3. Final Re-Scan
          </span>
        </div>
      </div>

      {/* STAGE 1: CONTEXTUAL FOLLOW-UP QUESTIONS */}
      {stage === "questions" && (
        <div className="space-y-6">
          <div className="rounded-[6px] border border-line bg-white p-5">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <HelpCircle size={16} className="text-muted" />
              Targeted Follow-Up Questions
            </h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Based on the gaps identified in your initial scan, answering these questions helps the AI accurately position your real experience. You may skip any question you don't have details for.
            </p>
          </div>

          {loadingQuestions ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center">
              <Loader2 size={28} className="animate-spin text-ink" />
              <p className="mt-3 font-mono text-xs text-muted">
                Analyzing missing evidence and formulating questions...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="rounded-[6px] border border-line bg-white p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
                        Question {idx + 1} • {q.category.replace(/_/g, " ")}
                      </span>
                      <h4 className="mt-0.5 text-sm font-semibold text-ink">{q.question}</h4>
                      <p className="mt-1 text-xs text-muted italic">Why we ask: {q.reason}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          [q.id]: answers[q.id] === "Skipped by candidate" ? "" : "Skipped by candidate",
                        })
                      }
                      className="shrink-0 text-xs text-muted hover:text-ink underline"
                    >
                      {answers[q.id] === "Skipped by candidate" ? "Undo skip" : "Skip"}
                    </button>
                  </div>

                  {answers[q.id] !== "Skipped by candidate" ? (
                    <textarea
                      rows={2}
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder={q.placeholder || "Your answer..."}
                      className="w-full rounded-[4px] border border-line bg-paper p-2.5 text-xs text-ink focus:border-ink focus:outline-none"
                    />
                  ) : (
                    <p className="font-mono text-[11px] text-muted bg-line/20 p-2 rounded-[3px]">
                      Skipped — no changes will be made for this item.
                    </p>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end pt-3">
                <button
                  onClick={handleGenerateEnhancedResume}
                  disabled={optimizing}
                  className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-7 py-3 text-xs font-bold text-ink shadow-[2px_2px_0_#111318] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  {optimizing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Generating Enhanced ATS Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate Enhanced Resume →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: EDITABLE ATS RESUME & INCLUDED RESCAN TRIGGER */}
      {stage === "edit_resume" && enhancedResume && (
        <div className="space-y-6">
          <div className="rounded-[6px] border border-line bg-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                <FileCheck2 size={18} className="text-emerald-600" />
                Enhanced ATS Resume Ready for Review
              </h3>
              <p className="mt-1 text-xs text-muted">
                Review your updated ATS resume below. You can refine any section before running your included re-scan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadATSResumePDF(enhancedResume)}
                className="flex items-center gap-1.5 rounded-[4px] border border-ink bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-line/20"
              >
                <Download size={13} /> Export PDF
              </button>

              <button
                onClick={handleRunRescan}
                disabled={rescaning}
                className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-2.5 text-xs font-bold text-ink shadow-[2px_2px_0_#111318] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {rescaning ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Scoring Enhanced Resume...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={14} />
                    <span>Run Included Re-Scan Now →</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="rounded-[6px] border border-line bg-line/10 p-4">
            <ATSResumePreview data={enhancedResume} />
          </div>
        </div>
      )}

      {/* STAGE 3: BEFORE-AND-AFTER COMPARISON & FINAL DASHBOARD */}
      {stage === "comparison" && rescanReport && (
        <div className="space-y-8">
          {/* Comparison Score Card */}
          <div className="rounded-[8px] border-2 border-ink bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
                  Score Comparison • Re-Scan Complete
                </span>
                <h3 className="mt-1 text-xl font-bold text-ink">
                  {rescanReport.matchScore > initialAnalysis.matchScore ? (
                    <span className="text-emerald-700">
                      Match Score Increased by +{rescanReport.matchScore - initialAnalysis.matchScore}%
                    </span>
                  ) : rescanReport.matchScore === initialAnalysis.matchScore ? (
                    <span>Match Score Maintained ({rescanReport.matchScore}%)</span>
                  ) : (
                    <span>Match Score: {rescanReport.matchScore}%</span>
                  )}
                </h3>
                <p className="mt-1 text-xs text-muted max-w-xl">
                  {rescanReport.summary}
                </p>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-4">
                <div className="rounded-[6px] border border-line bg-paper p-3 text-center min-w-[90px]">
                  <span className="font-mono text-[10px] uppercase text-muted">Initial Scan</span>
                  <p className="font-mono text-2xl font-bold text-muted">
                    {initialAnalysis.matchScore}%
                  </p>
                </div>

                <span className="text-xl font-bold text-ink">→</span>

                <div className="rounded-[6px] border-2 border-ink bg-lime p-3 text-center min-w-[100px] shadow-xs">
                  <span className="font-mono text-[10px] font-bold uppercase text-ink">Enhanced</span>
                  <p className="font-mono text-3xl font-extrabold text-ink">
                    {rescanReport.matchScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Better Evidenced & Remaining Gaps */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[6px] border border-line bg-white p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Requirements Better Evidenced
              </h4>
              <ul className="space-y-2 text-xs text-ink">
                {rescanReport.requirements
                  .filter((r) => r.status === "matched")
                  .map((r, i) => (
                    <li key={i} className="flex items-start gap-2 border-b border-line/30 pb-1.5">
                      <span className="font-mono text-emerald-600 font-bold">✓</span>
                      <div>
                        <strong>{r.name}</strong>
                        <p className="text-[11px] text-muted italic">Evidence: "{r.evidence}"</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="rounded-[6px] border border-line bg-white p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-600" />
                Remaining Gaps & Next Steps
              </h4>
              <ul className="space-y-2 text-xs text-muted">
                {rescanReport.requirements
                  .filter((r) => r.status !== "matched")
                  .map((r, i) => (
                    <li key={i} className="flex items-start gap-2 border-b border-line/30 pb-1.5">
                      <span className="font-mono text-rose-600 font-bold">✕</span>
                      <div>
                        <strong className="text-ink">{r.name}</strong>
                        <p className="text-[11px]">{r.recommendation}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Download Center for Bundle */}
          <div className="rounded-[6px] border-2 border-ink bg-paper p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-bold text-ink">Download Your Complete Package Assets</h4>
              <p className="text-xs text-muted">
                Your enhanced ATS resume PDF and branded report PDFs are ready for offline submission.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {enhancedResume && (
                <button
                  onClick={() => downloadATSResumePDF(enhancedResume)}
                  className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-5 py-2.5 text-xs font-bold text-ink shadow-[2px_2px_0_#111318]"
                >
                  <Download size={14} /> Download Enhanced Resume (ATS PDF)
                </button>
              )}

              <button
                onClick={() => downloadReport(rescanReport)}
                className="flex items-center gap-2 rounded-[4px] border border-ink bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:bg-line/20"
              >
                <Download size={14} /> Download Final Report PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 p-3 rounded-[4px]">
          {error}
        </p>
      )}
    </div>
  );
}
