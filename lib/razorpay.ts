/** Server-only Razorpay integration */

import Razorpay from "razorpay";
import crypto from "crypto";
import { requireRazorpay, getScanPricePaise } from "./config";
import { Errors } from "./errors";

let instance: InstanceType<typeof Razorpay> | null = null;

function getRazorpay(): InstanceType<typeof Razorpay> {
  if (instance) return instance;
  const { keyId, keySecret } = requireRazorpay();
  instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return instance;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createOrder(
  scanId: string,
  customAmountPaise?: number
): Promise<OrderResult> {
  const rz = getRazorpay();
  const { keyId } = requireRazorpay();
  const amountPaise = customAmountPaise ?? getScanPricePaise();

  const order = await rz.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: scanId.slice(0, 40),
    notes: { scanId },
  });

  return {
    orderId: order.id,
    amount: amountPaise,
    currency: "INR",
    keyId,
  };
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { keySecret } = requireRazorpay();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export async function fetchPayment(paymentId: string) {
  const rz = getRazorpay();
  return rz.payments.fetch(paymentId);
}
