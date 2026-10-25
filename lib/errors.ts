/** Structured, safe application errors */

export class AppError extends Error {
  public readonly isHireLensAppError = true;

  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly userMessage?: string,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static isAppError(err: unknown): err is AppError {
    return (
      err instanceof AppError ||
      (typeof err === "object" && err !== null && (err as { isHireLensAppError?: boolean }).isHireLensAppError === true)
    );
  }
}

// ── Common errors ────────────────────────────────────

export const Errors = {
  // File / input
  UNSUPPORTED_FORMAT: (ext: string) =>
    new AppError(`Unsupported file format: ${ext}`, "UNSUPPORTED_FORMAT", 400, "Please upload a PDF or DOCX file."),
  FILE_TOO_LARGE: (maxMb: number) =>
    new AppError("File too large", "FILE_TOO_LARGE", 400, `Maximum file size is ${maxMb} MB.`),
  EMPTY_TEXT: () =>
    new AppError("Extracted text is empty", "EMPTY_TEXT", 400, "No readable text was found in your file. If it is a scanned or image-only PDF, please paste your resume text instead."),
  INVALID_SIGNATURE: () =>
    new AppError("Invalid file signature", "INVALID_SIGNATURE", 400, "The file does not appear to be a valid PDF or DOCX. Please check the file and try again."),
  ENCRYPTED_PDF: () =>
    new AppError("Encrypted PDF", "ENCRYPTED_PDF", 400, "This PDF is encrypted. Please upload an unencrypted version or paste your resume text."),
  TEXT_TOO_SHORT: (field: string, min: number) =>
    new AppError(`${field} too short`, "TEXT_TOO_SHORT", 400, `${field} must be at least ${min} characters.`),
  TEXT_TOO_LONG: (field: string, max: number) =>
    new AppError(`${field} too long`, "TEXT_TOO_LONG", 400, `${field} must not exceed ${max} characters.`),

  // Scan
  SCAN_NOT_FOUND: () =>
    new AppError("Scan not found", "SCAN_NOT_FOUND", 404, "This scan could not be found."),
  SCAN_EXPIRED: () =>
    new AppError("Scan expired", "SCAN_EXPIRED", 410, "This scan has expired. Please start a new analysis."),
  INVALID_STATE: (current: string, target: string) =>
    new AppError(`Cannot transition from ${current} to ${target}`, "INVALID_STATE", 409, "This scan is not in the correct state for this action."),

  // Payment
  PAYMENT_VERIFICATION_FAILED: () =>
    new AppError("Payment verification failed", "PAYMENT_VERIFICATION_FAILED", 400, "We could not verify your payment. Please contact support if you were charged."),
  PAYMENT_AMOUNT_MISMATCH: () =>
    new AppError("Payment amount mismatch", "PAYMENT_AMOUNT_MISMATCH", 400, "The payment amount does not match. Please contact support."),
  ORDER_SCAN_MISMATCH: () =>
    new AppError("Order does not match scan", "ORDER_SCAN_MISMATCH", 400, "The payment order does not match this scan."),

  // AI
  ANALYSIS_FAILED: (reason?: string) =>
    new AppError(`Analysis failed: ${reason}`, "ANALYSIS_FAILED", 502, "The analysis could not be completed. You will not be charged again — please retry."),
  INVALID_AI_OUTPUT: () =>
    new AppError("Invalid AI output", "INVALID_AI_OUTPUT", 502, "The analysis produced an unexpected result. Please retry."),

  // Config
  MISSING_CONFIG: (key: string) =>
    new AppError(`Missing configuration: ${key}`, "MISSING_CONFIG", 500, "The server is not fully configured. Please contact the administrator."),

  // Rate limit
  RATE_LIMITED: () =>
    new AppError("Rate limited", "RATE_LIMITED", 429, "Too many requests. Please wait a moment and try again."),

  // Auth / Entitlement
  UNAUTHORIZED: (reason?: string) =>
    new AppError(reason || "Unauthorized action", "UNAUTHORIZED", 403, reason || "Unauthorized access."),

  // Generic
  INTERNAL: () =>
    new AppError("Internal server error", "INTERNAL", 500, "Something went wrong. Please try again."),
} as const;

/** Convert any error to a safe JSON response */
export function errorResponse(err: unknown): { error: string; code: string; status: number } {
  if (AppError.isAppError(err)) {
    return { error: err.userMessage ?? err.message, code: err.code, status: err.statusCode };
  }
  console.error("[HireLens] Unhandled error:", err instanceof Error ? err.message : err);
  return { error: "Something went wrong. Please try again.", code: "INTERNAL", status: 500 };
}
