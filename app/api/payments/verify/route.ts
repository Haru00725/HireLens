/** POST /api/payments/verify — Verify Razorpay payment signature */

import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getScan, markPaid } from "@/lib/scan-store";
import { scanIdSchema } from "@/lib/validation";
import { errorResponse, Errors } from "@/lib/errors";
import { getScanPricePaise } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scanId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate inputs
    scanIdSchema.parse(scanId);
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw Errors.PAYMENT_VERIFICATION_FAILED();
    }

    // Verify signature
    const valid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!valid) {
      throw Errors.PAYMENT_VERIFICATION_FAILED();
    }

    // Verify scan matches order
    const scan = await getScan(scanId);
    if (scan.razorpay_order_id !== razorpay_order_id) {
      throw Errors.ORDER_SCAN_MISMATCH();
    }

    const { getPackagePricePaise, getUpgradePricePaise } = await import("@/lib/config");
    const existingReport = (scan.report_json || {}) as Record<string, unknown>;
    const isUpgrade = Boolean(body.upgrade || scan.status === "completed");

    if (isUpgrade) {
      const paidPaise = Number(existingReport.amountPaidPaise ?? scan.amount_paise) || 0;
      const expectedUpgrade = getUpgradePricePaise(paidPaise);
      if (expectedUpgrade <= 0) {
        throw new Error("Invalid upgrade payment: scan already fully entitled.");
      }
    } else {
      const pkg = (existingReport.selectedPackage as "scan_only" | "bundle") || "scan_only";
      const expectedAmount = getPackagePricePaise(pkg);
      if (scan.amount_paise !== expectedAmount) {
        throw Errors.PAYMENT_AMOUNT_MISMATCH();
      }
    }

    // Mark as paid (idempotent, server-verified)
    await markPaid(scanId, razorpay_payment_id, isUpgrade);

    return NextResponse.json({ status: "paid", scanId, package: isUpgrade ? "bundle" : existingReport.selectedPackage });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
