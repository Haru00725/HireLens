/** POST /api/scans/draft — Create a scan draft with parsed resume + JD */

import { NextRequest, NextResponse } from "next/server";
import { parseDocument, validateTextLength } from "@/lib/document-parser";
import { createDraft } from "@/lib/scan-store";
import { draftInputSchema, MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, JOB_DESC_MIN, JOB_DESC_MAX, RESUME_TEXT_MIN } from "@/lib/validation";
import { errorResponse, Errors } from "@/lib/errors";
import { rateLimitByIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip");
    const rl = rateLimitByIp(ip, "draft", 5, 60_000);
    if (!rl.allowed) {
      const err = errorResponse(Errors.RATE_LIMITED());
      return NextResponse.json(err, { status: err.status });
    }

    const contentType = req.headers.get("content-type") ?? "";

    let resumeText = "";
    let jobDescription = "";
    let packageType: "scan_only" | "bundle" = "scan_only";

    if (contentType.includes("multipart/form-data")) {
      // File upload path
      const form = await req.formData();
      const file = form.get("resume") as File | null;
      const pastedText = form.get("resumeText") as string | null;
      jobDescription = (form.get("jobDescription") as string) ?? "";
      const pkg = form.get("packageType") as string | null;
      if (pkg === "bundle") packageType = "bundle";

      if (file && file.size > 0) {
        // Validate file
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw Errors.FILE_TOO_LARGE(5);
        }
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
          throw Errors.UNSUPPORTED_FORMAT(ext);
        }

        const buffer = await file.arrayBuffer();
        const result = await parseDocument(buffer, file.name, file.type);
        resumeText = validateTextLength(result.text, "Resume text");
      } else if (pastedText && pastedText.trim().length > 0) {
        resumeText = validateTextLength(pastedText.trim(), "Resume text");
      } else {
        throw Errors.TEXT_TOO_SHORT("Resume", RESUME_TEXT_MIN);
      }
    } else {
      // JSON path (pasted text only)
      const body = await req.json();
      const validated = draftInputSchema.parse(body);
      resumeText = validated.resumeText;
      jobDescription = validated.jobDescription;
      if (validated.packageType) packageType = validated.packageType;
    }

    // Validate JD
    if (!jobDescription || jobDescription.trim().length < JOB_DESC_MIN) {
      throw Errors.TEXT_TOO_SHORT("Job description", JOB_DESC_MIN);
    }
    if (jobDescription.length > JOB_DESC_MAX) {
      throw Errors.TEXT_TOO_LONG("Job description", JOB_DESC_MAX);
    }

    const scan = await createDraft(resumeText, jobDescription.trim(), packageType);

    return NextResponse.json({
      scanId: scan.id,
      status: scan.status,
      expiresAt: scan.expires_at,
      amountPaise: scan.amount_paise,
      currency: scan.currency,
      selectedPackage: packageType,
    });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
