"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { ResultsDashboard } from "@/components/results/results-dashboard";
import { AnalyzingState } from "@/components/results/analyzing-state";
import type { ResumeAnalysis } from "@/types/analysis";
import type { ScanStatus } from "@/types/scan";
import { Loader2, AlertCircle, RotateCcw, ArrowLeft, ShieldAlert } from "lucide-react";

interface Props {
  params: Promise<{ scanId: string }>;
}

export default function ResultsPage({ params }: Props) {
  const { scanId } = use(params);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [report, setReport] = useState<ResumeAnalysis | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [scanSummary, setScanSummary] = useState<{
    hasBundleEntitlement?: boolean;
    amountPaise?: number;
    reportJson?: Record<string, unknown>;
  } | null>(null);
  const isTriggeringRef = useRef(false);

  // Trigger analysis for paid scan
  const triggerAnalysis = useCallback(async () => {
    if (isTriggeringRef.current) return;
    isTriggeringRef.current = true;
    try {
      setStatus("analyzing");
      const res = await fetch(`/api/scans/${scanId}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.status === "completed" && data.reportJson) {
        setReport(data.reportJson as ResumeAnalysis);
        setCompletedAt(data.completedAt);
        setStatus("completed");
        setScanSummary(data);
      }
    } catch (err) {
      // Do not abort; AnalyzingState polling will pick up completion
      console.warn("Analyze fetch notice:", err);
    } finally {
      isTriggeringRef.current = false;
    }
  }, [scanId]);

  // Initial fetch
  const fetchScan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/scans/${scanId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Scan not found. It may have expired or never existed.");
        }
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to load scan.");
      }

      const scan = await res.json();
      setStatus(scan.status);
      setScanSummary(scan);

      if (scan.status === "completed" && scan.reportJson) {
        setReport(scan.reportJson as ResumeAnalysis);
        setCompletedAt(scan.completedAt);
      } else if (scan.status === "paid" || scan.status === "analyzing") {
        setStatus("analyzing");
        if (scan.status === "paid") {
          triggerAnalysis();
        }
      } else if (scan.status === "failed") {
        setError(scan.errorCode || "Analysis failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load report.");
    } finally {
      setLoading(false);
    }
  }, [scanId, triggerAnalysis]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      await fetchScan();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-paper">
        {loading ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
            <Loader2 size={36} className="animate-spin text-ink" />
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">
              Loading scan details...
            </p>
          </div>
        ) : status === "completed" && report ? (
          <ResultsDashboard
            scanId={scanId}
            analysis={report}
            completedAt={completedAt}
            hasBundleEntitlement={Boolean(scanSummary?.hasBundleEntitlement)}
            amountPaidPaise={Number(scanSummary?.amountPaise) || 0}
            bundleData={scanSummary?.reportJson}
            onRefreshScan={fetchScan}
          />
        ) : status === "analyzing" ? (
          <AnalyzingState
            scanId={scanId}
            onCompleted={fetchScan}
            onFailed={(err) => {
              setError(err);
              setStatus("failed");
            }}
          />
        ) : status === "failed" ? (
          <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-600 bg-rose-50 text-rose-700">
              <AlertCircle size={32} />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-ink">
              Analysis Encountered an Issue
            </h2>
            <p className="mt-2 text-sm text-muted">
              {error || "An error occurred while communicating with the AI model. Your payment has been verified, so you will not be charged again for retrying."}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                <RotateCcw size={14} className={retrying ? "animate-spin" : ""} />
                {retrying ? "Retrying analysis..." : "Retry analysis (No extra charge)"}
              </button>
              <Link
                href="/analyze"
                className="flex items-center gap-1.5 rounded-[4px] border border-line bg-paper px-4 py-3 text-xs font-medium text-muted hover:text-ink"
              >
                Start over
              </Link>
            </div>
          </div>
        ) : status === "expired" ? (
          <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-600 bg-amber-50 text-amber-700">
              <ShieldAlert size={32} />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-ink">
              Scan Draft Expired
            </h2>
            <p className="mt-2 text-sm text-muted">
              Unpaid drafts expire after 45 minutes to protect your privacy and ensure stale data is pruned.
            </p>
            <Link
              href="/analyze"
              className="mt-6 inline-flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-semibold text-ink"
            >
              Start a new scan →
            </Link>
          </div>
        ) : status === "draft" || status === "pending_payment" ? (
          <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
            <h2 className="text-2xl font-semibold text-ink">Payment Pending</h2>
            <p className="mt-2 text-sm text-muted">
              This scan requires verified payment of ₹19 before the AI matching engine can run.
            </p>
            <Link
              href="/analyze"
              className="mt-6 inline-flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-semibold text-ink"
            >
              <ArrowLeft size={14} /> Return to checkout
            </Link>
          </div>
        ) : (
          <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-red-600">{error || "Unable to display results."}</p>
            <Link
              href="/analyze"
              className="mt-4 underline text-xs text-muted hover:text-ink"
            >
              Back to analyzer
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
