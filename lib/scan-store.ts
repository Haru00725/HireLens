/** Scan persistence layer — server only */

import { getSupabaseAdmin } from "./supabase-admin";
import {
  getScanPricePaise,
  getPackagePricePaise,
  isFreeScanPromoActive,
  getScanDraftTtlMinutes,
} from "./config";
import { canTransition, type ScanRow, type ScanStatus, type ScanSummary } from "@/types/scan";
import { Errors, AppError } from "./errors";
import type { ResumeAnalysis } from "@/types/analysis";

export async function createDraft(
  resumeText: string,
  jobDescription: string,
  packageType: "scan_only" | "bundle" = "scan_only"
): Promise<ScanRow> {
  const db = getSupabaseAdmin();
  const ttl = getScanDraftTtlMinutes();
  const expiresAt = new Date(Date.now() + ttl * 60_000).toISOString();
  const amountPaise = getPackagePricePaise(packageType);

  const initialReportMeta = {
    selectedPackage: packageType,
    bundleEntitlement: false,
    amountPaidPaise: 0,
    promoEligible: isFreeScanPromoActive() && packageType === "scan_only",
    originalResumeText: resumeText,
    jobDescription: jobDescription,
  };

  const { data, error } = await db
    .from("scans")
    .insert({
      status: "draft" as ScanStatus,
      resume_text: resumeText,
      job_description: jobDescription,
      amount_paise: amountPaise,
      currency: "INR",
      expires_at: expiresAt,
      report_json: initialReportMeta,
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, "DB_INSERT", 500);
  return data as ScanRow;
}

export async function updateScanPackage(
  id: string,
  packageType: "scan_only" | "bundle"
): Promise<ScanRow> {
  const scan = await getScan(id);
  const newAmountPaise = getPackagePricePaise(packageType);
  const existingReport = scan.report_json || {};

  const updatedReport = {
    ...existingReport,
    selectedPackage: packageType,
    promoEligible: isFreeScanPromoActive() && packageType === "scan_only",
  };

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("scans")
    .update({
      amount_paise: newAmountPaise,
      report_json: updatedReport,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new AppError(error?.message || "Failed to update scan package", "DB_UPDATE", 500);
  }
  return data as ScanRow;
}

export async function getScan(id: string): Promise<ScanRow> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("scans").select("*").eq("id", id).single();
  if (error || !data) throw Errors.SCAN_NOT_FOUND();

  // Check expiration for draft/pending states
  const row = data as ScanRow;
  if (
    (row.status === "draft" || row.status === "pending_payment") &&
    new Date(row.expires_at) < new Date()
  ) {
    await transitionStatus(id, row.status, "expired");
    throw Errors.SCAN_EXPIRED();
  }

  return row;
}

export async function getScanPublic(id: string): Promise<ScanSummary & { reportJson: Record<string, unknown> | null }> {
  const scan = await getScan(id);
  const rep = scan.report_json as Record<string, unknown> | null;
  return {
    id: scan.id,
    status: scan.status,
    roleTitle: scan.role_title,
    amountPaise: scan.amount_paise,
    currency: scan.currency,
    errorCode: scan.error_code,
    createdAt: scan.created_at,
    expiresAt: scan.expires_at,
    completedAt: scan.completed_at,
    reportJson: rep,
    selectedPackage: (rep?.selectedPackage as "scan_only" | "bundle") || "scan_only",
    hasBundleEntitlement: Boolean(rep?.bundleEntitlement),
    hasRescanConsumed: Boolean(rep?.rescanConsumed),
  };
}

export async function transitionStatus(
  id: string,
  from: ScanStatus,
  to: ScanStatus,
  extra?: Partial<Record<string, unknown>>,
): Promise<ScanRow> {
  if (!canTransition(from, to)) {
    throw Errors.INVALID_STATE(from, to);
  }
  const db = getSupabaseAdmin();
  const update: Record<string, unknown> = { status: to, ...extra };

  // Use conditional update to prevent race conditions
  const { data, error } = await db
    .from("scans")
    .update(update)
    .eq("id", id)
    .eq("status", from)
    .select()
    .single();

  if (error || !data) {
    throw Errors.INVALID_STATE(from, to);
  }
  return data as ScanRow;
}

export async function setOrderId(id: string, orderId: string): Promise<ScanRow> {
  return transitionStatus(id, "draft", "pending_payment", {
    razorpay_order_id: orderId,
  });
}

export async function markPaymentProcessing(id: string): Promise<ScanRow> {
  const scan = await getScan(id);
  return transitionStatus(id, scan.status, "payment_processing");
}

export async function markPaid(
  id: string,
  paymentId: string,
  isBundleUpgrade = false
): Promise<ScanRow> {
  const scan = await getScan(id);
  const existingReport = (scan.report_json || {}) as Record<string, unknown>;
  const isBundle = isBundleUpgrade || existingReport.selectedPackage === "bundle" || scan.amount_paise >= 3900;

  const updatedReport = {
    ...existingReport,
    selectedPackage: isBundle ? "bundle" : (existingReport.selectedPackage || "scan_only"),
    bundleEntitlement: isBundle,
    amountPaidPaise: (Number(existingReport.amountPaidPaise) || 0) + scan.amount_paise,
  };

  // Allow idempotent payment check
  if (scan.status === "paid" && scan.razorpay_payment_id === paymentId) {
    return scan;
  }
  const validFrom =
    scan.status === "payment_processing" ||
    scan.status === "pending_payment" ||
    scan.status === "draft" ||
    (isBundleUpgrade && scan.status === "completed")
      ? scan.status
      : null;

  if (!validFrom) {
    if (scan.status === "paid") return scan;
    throw Errors.INVALID_STATE(scan.status, "paid");
  }

  // If upgrading an already completed scan, update without changing completed status
  if (scan.status === "completed" && isBundleUpgrade) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("scans")
      .update({
        report_json: updatedReport,
        razorpay_payment_id: paymentId,
        payment_status: "captured",
      })
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw new AppError("Failed to update upgraded scan", "DB_UPDATE", 500);
    return data as ScanRow;
  }

  return transitionStatus(id, validFrom, "paid", {
    razorpay_payment_id: paymentId,
    payment_status: "captured",
    report_json: updatedReport,
  });
}

export async function markAnalyzing(id: string): Promise<ScanRow> {
  const scan = await getScan(id);
  const from = scan.status === "failed" ? "failed" : "paid";
  return transitionStatus(id, from, "analyzing");
}

export async function markCompleted(
  id: string,
  report: ResumeAnalysis,
): Promise<ScanRow> {
  const db = getSupabaseAdmin();
  const scan = await getScan(id);
  const existingReport = (scan.report_json || {}) as Record<string, unknown>;

  const mergedReport = {
    ...existingReport,
    ...report,
    originalResumeText: existingReport.originalResumeText || scan.resume_text,
    jobDescription: existingReport.jobDescription || scan.job_description,
    selectedPackage: existingReport.selectedPackage || "scan_only",
    bundleEntitlement: Boolean(existingReport.bundleEntitlement),
  };

  const { data, error } = await db
    .from("scans")
    .update({
      status: "completed" as ScanStatus,
      report_json: mergedReport,
      role_title: report.roleTitle,
      completed_at: new Date().toISOString(),
      // Store resume & JD in report_json for bundle rescan, keep columns clean
      resume_text: null,
      job_description: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new AppError(error?.message || "Failed to save completed scan", "DB_UPDATE", 500);
  }
  return data as ScanRow;
}

export async function updateBundleData(
  id: string,
  partial: Record<string, unknown>
): Promise<ScanRow> {
  const scan = await getScan(id);
  const existingReport = (scan.report_json || {}) as Record<string, unknown>;
  const updatedReport = {
    ...existingReport,
    ...partial,
  };

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("scans")
    .update({ report_json: updatedReport })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new AppError(error?.message || "Failed to update bundle data", "DB_UPDATE", 500);
  }
  return data as ScanRow;
}


export async function markFailed(id: string, errorCode: string): Promise<ScanRow> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("scans")
    .update({ status: "failed" as ScanStatus, error_code: errorCode })
    .eq("id", id)
    .eq("status", "analyzing")
    .select()
    .single();
  if (error || !data) {
    // If already failed or completed, just return current
    return getScan(id);
  }
  return data as ScanRow;
}

export async function findScanByOrderId(orderId: string): Promise<ScanRow | null> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("scans").select("*").eq("razorpay_order_id", orderId).single();
  return (data as ScanRow) ?? null;
}

/** Cleanup expired drafts — call from a cron or admin endpoint */
export async function cleanupExpired(): Promise<number> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("scans")
    .update({ status: "expired" as ScanStatus, resume_text: null, job_description: null })
    .in("status", ["draft", "pending_payment"])
    .lt("expires_at", new Date().toISOString())
    .select("id");
  return data?.length ?? 0;
}
