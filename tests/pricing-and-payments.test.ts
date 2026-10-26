import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { canTransition } from "@/types/scan";
import { getScanPricePaise } from "@/lib/config";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay";

describe("Pricing, State Machine & Payment Verification", () => {
  describe("Pricing", () => {
    it("converts scan price to paise correctly (₹19 = 1900 paise)", () => {
      const paise = getScanPricePaise();
      expect(paise).toBe(1900);
      expect(Number.isInteger(paise)).toBe(true);
    });

    it("returns 0 paise when free scan promotion is active", async () => {
      vi.stubEnv("FREE_SCAN_PROMO_ENABLED", "true");
      vi.stubEnv("FREE_SCAN_PROMO_START_AT", new Date(Date.now() - 3600_000).toISOString());
      vi.stubEnv("FREE_SCAN_PROMO_DURATION_HOURS", "48");

      const { isFreeScanPromoActive, getScanPricePaise } = await import("@/lib/config");
      expect(isFreeScanPromoActive()).toBe(true);
      expect(getScanPricePaise()).toBe(0);

      vi.unstubAllEnvs();
    });

    it("returns standard 1900 paise when promotion is disabled", async () => {
      vi.stubEnv("FREE_SCAN_PROMO_ENABLED", "false");

      const { isFreeScanPromoActive, getScanPricePaise } = await import("@/lib/config");
      expect(isFreeScanPromoActive()).toBe(false);
      expect(getScanPricePaise()).toBe(1900);

      vi.unstubAllEnvs();
    });
  });


  describe("Scan State Machine Transitions", () => {
    it("allows the standard happy path lifecycle", () => {
      expect(canTransition("draft", "pending_payment")).toBe(true);
      expect(canTransition("pending_payment", "payment_processing")).toBe(true);
      expect(canTransition("payment_processing", "paid")).toBe(true);
      expect(canTransition("paid", "analyzing")).toBe(true);
      expect(canTransition("analyzing", "completed")).toBe(true);
    });

    it("allows paid scan to retry after AI failure without another charge", () => {
      expect(canTransition("analyzing", "failed")).toBe(true);
      // Critical requirement: a paid scan in 'failed' status can transition back to 'analyzing'
      expect(canTransition("failed", "analyzing")).toBe(true);
    });

    it("allows expiration from draft or pending payment", () => {
      expect(canTransition("draft", "expired")).toBe(true);
      expect(canTransition("pending_payment", "expired")).toBe(true);
    });

    it("strictly blocks illegal state jumps", () => {
      expect(canTransition("draft", "paid")).toBe(false); // cannot jump unpaid draft to paid
      expect(canTransition("draft", "analyzing")).toBe(false);
      expect(canTransition("draft", "completed")).toBe(false);
      expect(canTransition("completed", "analyzing")).toBe(false); // completed scans are immutable
      expect(canTransition("completed", "draft")).toBe(false);
      expect(canTransition("expired", "paid")).toBe(false);
    });
  });

  describe("Razorpay Signature Verification", () => {
    const testSecret = "test_rzp_secret_key_12345";
    const orderId = "order_N123456789";
    const paymentId = "pay_P987654321";

    beforeEach(() => {
      vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_key");
      vi.stubEnv("RAZORPAY_KEY_SECRET", testSecret);
      vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "test_webhook_secret");
    });

    it("validates correct HMAC-SHA256 signature", () => {
      const payload = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac("sha256", testSecret)
        .update(payload)
        .digest("hex");

      const isValid = verifyPaymentSignature(orderId, paymentId, validSignature);
      expect(isValid).toBe(true);
    });

    it("rejects forged or modified signature", () => {
      const forgedSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const isValid = verifyPaymentSignature(orderId, paymentId, forgedSignature);
      expect(isValid).toBe(false);
    });

    it("rejects signature when orderId or paymentId has been swapped", () => {
      const payload = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac("sha256", testSecret)
        .update(payload)
        .digest("hex");

      const swappedOrder = verifyPaymentSignature("order_different", paymentId, validSignature);
      expect(swappedOrder).toBe(false);

      const swappedPayment = verifyPaymentSignature(orderId, "pay_different", validSignature);
      expect(swappedPayment).toBe(false);
    });

    it("verifies webhook payload against raw request body", () => {
      const rawBody = JSON.stringify({
        entity: "event",
        event: "payment.captured",
        payload: { payment: { entity: { id: paymentId, amount: 1900, currency: "INR" } } },
      });

      const validWebhookSig = crypto
        .createHmac("sha256", "test_webhook_secret")
        .update(rawBody)
        .digest("hex");

      expect(verifyWebhookSignature(rawBody, validWebhookSig)).toBe(true);

      // Modified body should fail verification
      const tamperedBody = rawBody + " ";
      expect(verifyWebhookSignature(tamperedBody, validWebhookSig)).toBe(false);
    });
  });
});
