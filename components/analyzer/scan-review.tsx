"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
  Layers,
  Sparkle,
} from "lucide-react";

interface Props {
  resumeFile: File | null;
  resumeText: string;
  resumeMode: "file" | "text";
  jobDescription: string;
  onBack: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ScanReview({
  resumeFile,
  resumeText,
  resumeMode,
  jobDescription,
  onBack,
}: Props) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<"scan_only" | "bundle">("bundle");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    if (!document.getElementById("razorpay-checkout-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const resumeDisplayName =
    resumeMode === "file" && resumeFile
      ? resumeFile.name
      : `Pasted resume text (${resumeText.length.toLocaleString()} chars)`;

  const resumeSizeLabel =
    resumeMode === "file" && resumeFile
      ? formatBytes(resumeFile.size)
      : `${resumeText.split(/\s+/).filter(Boolean).length} words`;

  const jdPreview =
    jobDescription.trim().length > 180
      ? jobDescription.trim().slice(0, 180) + "..."
      : jobDescription.trim();

  // Create scan draft
  const createDraftOnServer = async (pkg: "scan_only" | "bundle"): Promise<string> => {
    let draftRes: Response;
    if (resumeMode === "file" && resumeFile) {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);
      formData.append("packageType", pkg);
      draftRes = await fetch("/api/scans/draft", {
        method: "POST",
        body: formData,
      });
    } else {
      draftRes = await fetch("/api/scans/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          packageType: pkg,
        }),
      });
    }

    const draftData = await draftRes.json();
    if (!draftRes.ok) {
      throw new Error(
        draftData.message ||
          draftData.error ||
          "Failed to create scan draft. Please verify your inputs."
      );
    }
    return draftData.scanId;
  };

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      setStatusText("Creating scan draft...");
      const scanId = await createDraftOnServer(selectedPackage);

      // CASE A: Option 1 (Initial Scan Only) during launch promotion
      if (selectedPackage === "scan_only") {
        setStatusText("Applying launch offer (100% OFF)...");
        const freeRes = await fetch("/api/payments/free-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scanId }),
        });

        const freeData = await freeRes.json();

        if (freeRes.ok) {
          setStatusText("Scan authorized! Launching HireLens analysis...");
          router.push(`/results/${scanId}`);
          return;
        }

        throw new Error(
          freeData.message ||
            freeData.error ||
            "Unable to activate the launch free scan offer. Please try again or refresh the page."
        );
      }


      // CASE B: Complete Bundle (₹39) or Scan Only post-promo (₹19) via Razorpay
      setStatusText("Preparing secure checkout...");
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          packageType: selectedPackage,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || orderData.error || "Failed to initialize payment.");
      }

      // If Razorpay keys are not configured or window.Razorpay unavailable, provide a clear, helpful message
      const RazorpayConstructor = (window as unknown as { Razorpay?: new (opts: unknown) => { open: () => void } }).Razorpay;

      if (!orderData.keyId || !RazorpayConstructor) {
        throw new Error(
          "Payment gateway is being initialized. If you are testing locally, please ensure RAZORPAY_KEY_ID is configured in .env."
        );
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "HireLens",
        description:
          selectedPackage === "bundle"
            ? "Complete AI Optimization Bundle (Scan + Optimize + Re-scan)"
            : "Initial Resume Match Scan",
        order_id: orderData.orderId,
        theme: {
          color: "#111318",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatusText(null);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setStatusText("Verifying payment signature with server...");
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                scanId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || verifyData.error || "Payment verification failed.");
            }

            setStatusText("Payment confirmed! Starting analysis...");
            router.push(`/results/${scanId}`);
          } catch (verifyErr) {
            setError(verifyErr instanceof Error ? verifyErr.message : "Payment verification error.");
            setLoading(false);
            setStatusText(null);
          }
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during checkout initialization."
      );
      setLoading(false);
      setStatusText(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Review & Select Package</h2>
        <p className="mt-1 text-sm text-muted">
          Confirm your uploaded documents and select the right analysis package for your goals.
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Resume Card */}
        <div className="rounded-[6px] border border-line bg-paper p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Document 01
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-ink">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Ready
            </span>
          </div>
          <h3 className="mt-3 font-semibold text-ink">Your Resume</h3>
          <div className="mt-2 flex items-center gap-2 rounded-[4px] bg-line/20 p-2.5">
            <FileText size={18} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">
                {resumeDisplayName}
              </p>
              <p className="font-mono text-[11px] text-muted">{resumeSizeLabel}</p>
            </div>
          </div>
        </div>

        {/* Job Description Card */}
        <div className="rounded-[6px] border border-line bg-paper p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Document 02
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-ink">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Ready
            </span>
          </div>
          <h3 className="mt-3 font-semibold text-ink">Target Role</h3>
          <div className="mt-2 rounded-[4px] bg-line/20 p-2.5">
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              "{jdPreview}"
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {jobDescription.length.toLocaleString()} characters
            </p>
          </div>
        </div>
      </div>

      {/* TWO SCAN PACKAGES GRID */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
            Step 3 of 3 • Select Package
          </span>
          <span className="text-xs text-muted">
            All reports backed by server-side evidence verification
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* PACKAGE OPTION 1: Initial Scan Only */}
          <div
            onClick={() => setSelectedPackage("scan_only")}
            className={`cursor-pointer rounded-[6px] border-2 p-6 transition-all ${
              selectedPackage === "scan_only"
                ? "border-ink bg-white shadow-[3px_3px_0_#111318]"
                : "border-line bg-paper/60 hover:border-ink/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Option 01
              </span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedPackage === "scan_only"
                    ? "border-ink bg-ink text-paper"
                    : "border-line"
                }`}
              >
                {selectedPackage === "scan_only" && <Check size={12} strokeWidth={3} />}
              </div>
            </div>

            <h3 className="mt-2 text-lg font-bold text-ink">Initial Scan Only</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Understand how your resume matches the role before deciding what to improve.
            </p>

            <div className="my-5 flex items-baseline gap-2 border-y border-line/60 py-3.5">
              <span className="font-mono text-3xl font-extrabold text-ink">FREE</span>
              <span className="rounded-[4px] border border-ink bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                48H LAUNCH OFFER
              </span>
              <span className="ml-auto font-mono text-xs text-muted line-through">₹19</span>
            </div>

            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>One initial resume scan against the target job</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>Calibrated match score (0–100)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>Strengths, partial & missing requirements with quotes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>Initial recommendations & downloadable PDF report</span>
              </li>
              <li className="flex items-start gap-2 opacity-50">
                <span className="font-mono text-xs text-muted">✕</span>
                <span>Does not include AI resume optimization or re-scan</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setSelectedPackage("scan_only")}
              className={`mt-6 w-full rounded-[4px] border py-2.5 text-xs font-semibold transition-all ${
                selectedPackage === "scan_only"
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-muted hover:text-ink"
              }`}
            >
              {selectedPackage === "scan_only" ? "Selected: Initial Scan" : "Choose Initial Scan"}
            </button>
          </div>

          {/* PACKAGE OPTION 2: Complete AI Optimization Bundle (EMPHASIZED WITH LIME) */}
          <div
            onClick={() => setSelectedPackage("bundle")}
            className={`relative cursor-pointer rounded-[6px] border-2 p-6 transition-all ${
              selectedPackage === "bundle"
                ? "border-ink bg-white shadow-[4px_4px_0_#111318]"
                : "border-line bg-paper/60 hover:border-ink/50"
            }`}
          >
            <div className="absolute -top-3 right-5 rounded-[4px] border border-ink bg-lime px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink shadow-xs">
              RECOMMENDED BUNDLE
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Option 02
              </span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedPackage === "bundle"
                    ? "border-ink bg-ink text-paper"
                    : "border-line"
                }`}
              >
                {selectedPackage === "bundle" && <Check size={12} strokeWidth={3} />}
              </div>
            </div>

            <h3 className="mt-2 text-lg font-bold text-ink flex items-center gap-1.5">
              Get the complete package
              <Sparkles size={16} className="text-lime-600 fill-lime-400" />
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Scan your resume, improve it with AI using your real experience, and check the updated version against the same job.
            </p>

            <div className="my-5 flex items-baseline gap-2 border-y border-line/60 py-3.5">
              <span className="font-mono text-3xl font-extrabold text-ink">₹39</span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">TOTAL</span>
              <span className="ml-auto text-[11px] text-muted">One-time payment</span>
            </div>

            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span className="font-medium text-ink">Everything in Initial Scan included</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>Personalized follow-up questions to uncover missing evidence</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>AI-enhanced, strictly ATS-friendly resume based on verified facts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>Editable resume workspace with live ATS preview</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span><strong className="text-ink">1 Included Re-Scan</strong> against the same role with before & after score comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>Downloadable Enhanced Resume PDF + Initial & Final Report PDFs</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setSelectedPackage("bundle")}
              className={`mt-6 w-full rounded-[4px] border-2 py-2.5 text-xs font-bold transition-all ${
                selectedPackage === "bundle"
                  ? "border-ink bg-lime text-ink shadow-[2px_2px_0_#111318]"
                  : "border-line bg-paper text-muted hover:text-ink"
              }`}
            >
              {selectedPackage === "bundle" ? "Selected: Complete Bundle (₹39)" : "Choose Complete Bundle"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[11px] text-muted">
          *The bundle costs ₹39 total, not ₹39 on top of the initial scan.
        </p>
      </div>

      {/* Selected Confirmation Banner */}
      <div className="rounded-[6px] border-2 border-ink bg-paper p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Checkout Confirmation
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-lg font-bold text-ink">
                {selectedPackage === "bundle"
                  ? "Complete AI Optimization Bundle"
                  : "Initial Scan Only"}
              </span>
              <span className="font-mono text-2xl font-extrabold text-ink">
                {selectedPackage === "bundle" ? "₹39" : "₹0 (Launch Free)"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {selectedPackage === "bundle"
                ? "Includes initial scan, personalized Q&A, AI ATS resume enhancement, and 1 included rescan."
                : "Includes 1 full initial scan report and downloadable PDF. Upgrade available anytime."}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-[4px] border border-line bg-line/30 px-3.5 py-2.5 text-[11px] text-muted">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>Encrypted • In-memory parsing • No fake payments</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-[6px] border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Checkout Notice</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 font-medium text-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          <ArrowLeft size={16} /> Back to edit
        </button>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="relative flex items-center justify-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-8 py-3.5 font-semibold text-ink shadow-[3px_3px_0_#111318] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111318] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{statusText || "Processing..."}</span>
            </>
          ) : selectedPackage === "bundle" ? (
            <>
              <Sparkles size={16} />
              <span>Get Complete Bundle (₹39) →</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Start Free Initial Scan →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
