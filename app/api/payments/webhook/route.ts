/** POST /api/payments/webhook — Razorpay webhook handler */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, fetchPayment } from "@/lib/razorpay";
import { findScanByOrderId, markPaid } from "@/lib/scan-store";
import { getScanPricePaise } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event;

    // Handle payment.captured and payment.authorized
    if (eventType === "payment.captured" || eventType === "payment.authorized") {
      const payment = event?.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ status: "ignored" }, { status: 200 });
      }

      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount;
      const currency = payment.currency;

      if (!orderId || !paymentId) {
        return NextResponse.json({ status: "ignored" }, { status: 200 });
      }

      // Find scan by order ID
      const scan = await findScanByOrderId(orderId);
      if (!scan) {
        console.warn(`[Webhook] No scan found for order ${orderId}`);
        return NextResponse.json({ status: "no_scan" }, { status: 200 });
      }

      // Verify amount
      const expectedPaise = getScanPricePaise();
      if (amount !== expectedPaise || currency !== "INR") {
        console.error(`[Webhook] Amount mismatch: expected ${expectedPaise} INR, got ${amount} ${currency}`);
        return NextResponse.json({ status: "amount_mismatch" }, { status: 200 });
      }

      // Already completed? Skip.
      if (scan.status === "completed" || scan.status === "paid" || scan.status === "analyzing") {
        return NextResponse.json({ status: "already_processed" }, { status: 200 });
      }

      // Mark paid (idempotent)
      try {
        await markPaid(scan.id, paymentId);
      } catch {
        // State transition error — likely already processed
        console.warn(`[Webhook] Could not mark scan ${scan.id} as paid — may already be processed`);
      }

      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    // Acknowledge other events
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  } catch (err) {
    console.error("[Webhook] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
