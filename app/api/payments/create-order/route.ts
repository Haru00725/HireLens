/** POST /api/payments/create-order — Create a Razorpay order for a scan draft */

import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/razorpay";
import { getScan, setOrderId } from "@/lib/scan-store";
import { scanIdSchema } from "@/lib/validation";
import { errorResponse, Errors } from "@/lib/errors";
import { rateLimitByIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip");
    const rl = rateLimitByIp(ip, "create-order", 5, 60_000);
    if (!rl.allowed) {
      const err = errorResponse(Errors.RATE_LIMITED());
      return NextResponse.json(err, { status: err.status });
    }

    const body = await req.json();
    const scanId = scanIdSchema.parse(body.scanId);
    const isUpgrade = Boolean(body.upgrade);
    const requestedPackage: "scan_only" | "bundle" = body.packageType === "bundle" || isUpgrade ? "bundle" : "scan_only";

    const scan = await getScan(scanId);

    // Check expiration
    if (new Date(scan.expires_at) < new Date()) {
      throw Errors.SCAN_EXPIRED();
    }

    const { getPackagePricePaise, getUpgradePricePaise, requireRazorpay } = await import("@/lib/config");

    let amountPaise = 0;

    if (isUpgrade) {
      // Must be already completed or paid
      if (scan.status !== "completed" && scan.status !== "paid") {
        throw Errors.INVALID_STATE(scan.status, "bundle_upgrade");
      }
      const existingReport = (scan.report_json || {}) as Record<string, unknown>;
      const paidPaise = Number(existingReport.amountPaidPaise ?? scan.amount_paise) || 0;
      amountPaise = getUpgradePricePaise(paidPaise);

      if (amountPaise <= 0) {
        throw new Error("This scan already has the complete bundle entitlement.");
      }
    } else {
      // Standard scan draft flow
      if (scan.status !== "draft" && scan.status !== "pending_payment") {
        throw Errors.INVALID_STATE(scan.status, "pending_payment");
      }

      // Update package on the draft scan
      const { updateScanPackage } = await import("@/lib/scan-store");
      const updatedScan = await updateScanPackage(scanId, requestedPackage);
      amountPaise = updatedScan.amount_paise;

      if (amountPaise === 0) {
        throw new Error("This package is free under the launch promotion. Please use free checkout.");
      }
    }

    // Create Razorpay order (exact server-verified amount)
    const order = await createOrder(scanId, amountPaise);

    // Persist order ID
    if (!isUpgrade) {
      await setOrderId(scanId, order.orderId);
    } else {
      const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
      await getSupabaseAdmin()
        .from("scans")
        .update({ razorpay_order_id: order.orderId })
        .eq("id", scanId);
    }

    return NextResponse.json(order);
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
