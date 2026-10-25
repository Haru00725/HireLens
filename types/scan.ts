/** Scan entity and state machine */

export type ScanStatus =
  | "draft"
  | "pending_payment"
  | "payment_processing"
  | "paid"
  | "analyzing"
  | "completed"
  | "failed"
  | "expired";

export interface ScanRow {
  id: string;
  status: ScanStatus;
  resume_text: string | null;
  job_description: string | null;
  role_title: string | null;
  amount_paise: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: string | null;
  report_json: Record<string, unknown> | null;
  error_code: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  completed_at: string | null;
}

/** Which transitions are legal */
const TRANSITIONS: Record<ScanStatus, ScanStatus[]> = {
  draft: ["pending_payment", "expired"],
  pending_payment: ["payment_processing", "paid", "expired"],
  payment_processing: ["paid", "pending_payment", "failed", "expired"],
  paid: ["analyzing"],
  analyzing: ["completed", "failed"],
  completed: [],
  failed: ["analyzing"], // retry after paid failure
  expired: [],
};

export function canTransition(from: ScanStatus, to: ScanStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Client-safe scan summary (no resume text / JD) */
export interface ScanSummary {
  id: string;
  status: ScanStatus;
  roleTitle: string | null;
  amountPaise: number;
  currency: string;
  errorCode: string | null;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  selectedPackage?: "scan_only" | "bundle";
  hasBundleEntitlement?: boolean;
  hasRescanConsumed?: boolean;
}

