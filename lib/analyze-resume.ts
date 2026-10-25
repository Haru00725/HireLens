import { analyzeResume as analyzeResumeWithGemini } from "./gemini";
import { analyzeResumeWithGroq } from "./groq";
import { getGroqConfig } from "./config";
import { getScan, markAnalyzing, markCompleted, markFailed } from "./scan-store";
import { Errors } from "./errors";

export async function runAnalysis(scanId: string): Promise<void> {
  const scan = await getScan(scanId);

  // If already completed, nothing to do
  if (scan.status === "completed") {
    return;
  }

  // Only paid, failed, or analyzing scans can be analyzed
  if (scan.status !== "paid" && scan.status !== "failed" && scan.status !== "analyzing") {
    throw Errors.INVALID_STATE(scan.status, "analyzing");
  }

  // Get inputs
  const reportMeta = (scan.report_json || {}) as Record<string, unknown>;
  const resumeText = scan.resume_text || (reportMeta.originalResumeText as string | undefined);
  const jobDescription = scan.job_description || (reportMeta.jobDescription as string | undefined);

  if (!resumeText || !jobDescription) {
    await markFailed(scanId, "MISSING_INPUT");
    throw Errors.ANALYSIS_FAILED("Resume or job description data is missing for this scan.");
  }

  if (scan.status !== "analyzing") {
    await markAnalyzing(scanId);
  }

  try {
    let report;
    const groqConfig = getGroqConfig();

    if (groqConfig.isConfigured) {
      try {
        console.log(`[HireLens Engine] Analyzing with Groq (${groqConfig.model})...`);
        report = await analyzeResumeWithGroq(resumeText, jobDescription);
      } catch (groqErr) {
        console.warn(
          "[HireLens Engine] Groq error, auto-fallback to Gemini:",
          groqErr instanceof Error ? groqErr.message : groqErr
        );
        report = await analyzeResumeWithGemini(resumeText, jobDescription);
      }
    } else {
      report = await analyzeResumeWithGemini(resumeText, jobDescription);
    }

    await markCompleted(scanId, report);
  } catch (err) {
    const code =
      err instanceof Error && "code" in err
        ? (err as { code: string }).code
        : "ANALYSIS_FAILED";
    await markFailed(scanId, code);
    throw err;
  }
}
