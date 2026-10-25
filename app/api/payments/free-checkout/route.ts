/** POST /api/payments/free-checkout — Grant free scan for demo / testing */

import { NextRequest, NextResponse } from "next/server";
import { getScan, markPaid } from "@/lib/scan-store";
import { scanIdSchema } from "@/lib/validation";
import { errorResponse, Errors } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scanId = scanIdSchema.parse(body.scanId);

    const scan = await getScan(scanId);

    // If already paid/completed, return status
    if (scan.status === "paid" || scan.status === "analyzing" || scan.status === "completed") {
      return NextResponse.json({ status: "paid", scanId });
    }

    if (scan.status !== "draft" && scan.status !== "pending_payment") {
      throw Errors.INVALID_STATE(scan.status, "paid");
    }

    // Check expiration
    if (new Date(scan.expires_at) < new Date()) {
      throw Errors.SCAN_EXPIRED();
    }

    const { isFreeScanPromoActive, getPackagePricePaise } = await import("@/lib/config");

    // Strictly verify launch promo eligibility
    if (!isFreeScanPromoActive()) {
      throw new Error("Launch promotion is currently inactive. Please proceed with standard checkout.");
    }

    const existingReport = (scan.report_json || {}) as Record<string, unknown>;
    const packageType = (existingReport.selectedPackage as string) || "scan_only";

    if (packageType === "bundle") {
      throw new Error("The Complete AI Optimization Bundle requires ₹39 checkout and is not eligible for free promotion.");
    }

    // Set amount_paise to 0 and record promo eligibility
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const updatedReport = {
      ...existingReport,
      selectedPackage: "scan_only",
      promoEligible: true,
      amountPaidPaise: 0,
      bundleEntitlement: false,
    };

    // Transition directly to paid with free_launch_promo status, no fake Razorpay records
    await getSupabaseAdmin()
      .from("scans")
      .update({
        status: "paid",
        amount_paise: 0,
        payment_status: "free_launch_promo",
        razorpay_order_id: null,
        razorpay_payment_id: null,
        report_json: updatedReport,
      })
      .eq("id", scanId);

    return NextResponse.json({
      status: "paid",
      scanId,
      package: "scan_only",
      amountPaise: 0,
      paymentStatus: "free_launch_promo",
    });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
