import { NextRequest, NextResponse } from "next/server";
import { getScan, updateBundleData } from "@/lib/scan-store";
import { generateContextualQuestions } from "@/lib/ai-resume-optimizer";
import { errorResponse, Errors } from "@/lib/errors";
import type { ResumeAnalysis } from "@/types/analysis";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;
    const scan = await getScan(scanId);

    // Verify scan is completed and has bundle entitlement
    if (scan.status !== "completed") {
      throw Errors.INVALID_STATE(scan.status, "completed_bundle");
    }

    const reportMeta = (scan.report_json || {}) as Record<string, unknown>;
    const hasEntitlement = Boolean(reportMeta.bundleEntitlement || reportMeta.selectedPackage === "bundle" || scan.amount_paise >= 3900);

    if (!hasEntitlement) {
      throw Errors.UNAUTHORIZED("Complete AI Optimization Bundle is required to access contextual questions.");
    }

    // Return cached questions if already generated
    if (Array.isArray(reportMeta.contextualQuestions) && reportMeta.contextualQuestions.length > 0) {
      return NextResponse.json({ questions: reportMeta.contextualQuestions });
    }

    const resumeText = (reportMeta.originalResumeText as string) || scan.resume_text || "";
    const jobDescription = (reportMeta.jobDescription as string) || scan.job_description || "";
    const analysis = reportMeta as unknown as ResumeAnalysis;

    const questions = await generateContextualQuestions(resumeText, jobDescription, analysis);

    // Cache questions
    await updateBundleData(scanId, { contextualQuestions: questions });

    return NextResponse.json({ questions });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
