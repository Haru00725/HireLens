/** Server-only environment helpers. Never import in client components. */

import { Errors } from "./errors";

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw Errors.MISSING_CONFIG(key);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export function getServerConfig() {
  return {
    geminiApiKey: required("GEMINI_API_KEY"),
    geminiModel: optional("GEMINI_MODEL", "gemini-3.5-flash-lite"),
    razorpayKeyId: required("RAZORPAY_KEY_ID"),
    razorpayKeySecret: required("RAZORPAY_KEY_SECRET"),
    razorpayWebhookSecret: required("RAZORPAY_WEBHOOK_SECRET"),
    supabaseUrl: required("SUPABASE_URL"),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    scanPriceInr: Number(optional("SCAN_PRICE_INR", "19")),
    scanDraftTtlMinutes: Number(optional("SCAN_DRAFT_TTL_MINUTES", "45")),
    reportRetentionDays: Number(optional("REPORT_RETENTION_DAYS", "7")),
    appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  };
}

/** Check only the subset of config needed for a specific provider */
export function requireGemini() {
  return {
    apiKey: required("GEMINI_API_KEY"),
    model: optional("GEMINI_MODEL", "gemini-3.5-flash-lite"),
  };
}

export function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  const isConfigured = Boolean(
    apiKey &&
    apiKey.trim().startsWith("gsk_") &&
    !apiKey.includes("mock") &&
    !apiKey.includes("replace_with")
  );
  return {
    apiKey: isConfigured ? apiKey!.trim() : null,
    model: optional("GROQ_MODEL", "openai/gpt-oss-120b"),
    isConfigured,
  };
}

export function requireRazorpay() {
  return {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
  };
}

export function requireSupabase() {
  return {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function isFreeScanPromoActive(): boolean {
  const enabled = process.env.FREE_SCAN_PROMO_ENABLED === "true";
  if (!enabled) return false;

  const startAtStr = process.env.FREE_SCAN_PROMO_START_AT || "2026-10-26T00:00:00Z";
  if (!startAtStr || !startAtStr.trim()) return false;


  const startAt = new Date(startAtStr.trim()).getTime();
  if (isNaN(startAt)) return false;

  const durationHours = Number(process.env.FREE_SCAN_PROMO_DURATION_HOURS) || 48;
  const durationMs = durationHours * 3600 * 1000;
  const now = Date.now();

  return now >= startAt && now < startAt + durationMs;
}

export function getScanPricePaise(): number {
  if (isFreeScanPromoActive()) {
    return 0;
  }
  return Number(optional("SCAN_PRICE_INR", "19")) * 100;
}

export function getBundlePricePaise(): number {
  return Number(optional("BUNDLE_PRICE_INR", "39")) * 100;
}

export function getPackagePricePaise(packageType: "scan_only" | "bundle"): number {
  if (packageType === "bundle") {
    return getBundlePricePaise();
  }
  return getScanPricePaise();
}

export function getUpgradePricePaise(alreadyPaidPaise: number): number {
  const bundlePaise = getBundlePricePaise();
  return Math.max(0, bundlePaise - alreadyPaidPaise);
}

export function getScanDraftTtlMinutes(): number {
  return Number(optional("SCAN_DRAFT_TTL_MINUTES", "45"));
}

export function getReportRetentionDays(): number {
  return Number(optional("REPORT_RETENTION_DAYS", "7"));
}

