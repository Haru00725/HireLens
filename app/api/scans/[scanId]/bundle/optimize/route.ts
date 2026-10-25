import { NextRequest, NextResponse } from "next/server";
import { getScan, updateBundleData } from "@/lib/scan-store";
import { generateEnhancedATSResume } from "@/lib/ai-resume-optimizer";
import { errorResponse, Errors } from "@/lib/errors";
import type { ResumeAnalysis } from "@/types/analysis";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;
    const body = await req.json();
    const userAnswers: Record<string, string> = body.answers || {};

    const scan = await getScan(scanId);
    if (scan.status !== "completed") {
      throw Errors.INVALID_STATE(scan.status, "completed_bundle");
    }

    const reportMeta = (scan.report_json || {}) as Record<string, unknown>;
    const hasEntitlement = Boolean(reportMeta.bundleEntitlement || reportMeta.selectedPackage === "bundle" || scan.amount_paise >= 3900);

    if (!hasEntitlement) {
      throw Errors.UNAUTHORIZED("Complete AI Optimization Bundle is required for resume enhancement.");
    }

    const resumeText = (reportMeta.originalResumeText as string) || scan.resume_text || "";
    const jobDescription = (reportMeta.jobDescription as string) || scan.job_description || "";
    const analysis = reportMeta as unknown as ResumeAnalysis;

    const enhancedResume = await generateEnhancedATSResume(
      resumeText,
      jobDescription,
      analysis,
      userAnswers
    );

    await updateBundleData(scanId, {
      userAnswers,
      enhancedResume,
    });

    return NextResponse.json({
      enhancedResume,
      status: "optimized",
    });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
