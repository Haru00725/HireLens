import { NextRequest, NextResponse } from "next/server";
import { getScan, updateBundleData } from "@/lib/scan-store";
import { analyzeResumeWithGroq } from "@/lib/groq";
import { analyzeResume as analyzeResumeWithGemini } from "@/lib/gemini";
import { getGroqConfig } from "@/lib/config";
import { atsResumeToPlainText } from "@/lib/ats-resume";
import { errorResponse, Errors } from "@/lib/errors";
import type { ResumeAnalysis } from "@/types/analysis";
import type { ATSResumeData } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;
    const body = await req.json();
    const finalResume: ATSResumeData = body.enhancedResume;

    if (!finalResume || !finalResume.personalInfo) {
      throw new Error("Valid ATS resume data is required for re-scanning.");
    }

    const scan = await getScan(scanId);
    const reportMeta = (scan.report_json || {}) as Record<string, unknown>;
    const hasEntitlement = Boolean(reportMeta.bundleEntitlement || reportMeta.selectedPackage === "bundle" || scan.amount_paise >= 3900);

    if (!hasEntitlement) {
      throw Errors.UNAUTHORIZED("Complete AI Optimization Bundle is required for included rescan.");
    }

    if (reportMeta.rescanConsumed && reportMeta.rescanReport) {
      // Re-scan is strictly limited to one included rescan per bundle
      return NextResponse.json({
        rescanReport: reportMeta.rescanReport,
        enhancedScore: reportMeta.enhancedScore,
        initialScore: reportMeta.matchScore,
        rescanConsumed: true,
        alreadyCompleted: true,
      });
    }

    const jobDescription = (reportMeta.jobDescription as string) || scan.job_description || "";
    if (!jobDescription) {
      throw new Error("Job description missing for this scan.");
    }

    // Convert structured ATS resume to plain text using standard ATS formatting
    const formattedResumeText = atsResumeToPlainText(finalResume);

    let rescanReport: ResumeAnalysis;
    const groqConfig = getGroqConfig();

    if (groqConfig.isConfigured) {
      try {
        console.log(`[HireLens Engine] Re-scanning enhanced resume with Groq (${groqConfig.model})...`);
        rescanReport = await analyzeResumeWithGroq(formattedResumeText, jobDescription);
      } catch (err) {
        console.warn("[HireLens Engine] Groq rescan failed, falling back to Gemini:", err);
        rescanReport = await analyzeResumeWithGemini(formattedResumeText, jobDescription);
      }
    } else {
      rescanReport = await analyzeResumeWithGemini(formattedResumeText, jobDescription);
    }

    const initialScore = Number(reportMeta.matchScore) || 0;
    const enhancedScore = rescanReport.matchScore;

    // Save final rescan report and mark rescan consumed
    await updateBundleData(scanId, {
      enhancedResume: finalResume,
      rescanReport,
      enhancedScore,
      rescanConsumed: true,
      rescanAt: new Date().toISOString(),
    });

    return NextResponse.json({
      rescanReport,
      initialScore,
      enhancedScore,
      scoreDelta: enhancedScore - initialScore,
      rescanConsumed: true,
    });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
