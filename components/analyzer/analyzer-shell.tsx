"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE, SCAN_PRICE_INR } from "@/lib/tokens";
import { ProgressStepper } from "./progress-stepper";
import { ResumeUpload } from "./resume-upload";
import { JobDescriptionInput } from "./job-description-input";
import { ScanReview } from "./scan-review";
import { ArrowLeft } from "lucide-react";

type Step = 0 | 1 | 2;

export function AnalyzerShell() {
  const [step, setStep] = useState<Step>(0);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeMode, setResumeMode] = useState<"file" | "text">("file");

  // JD state
  const [jobDescription, setJobDescription] = useState("");

  // Check for handoff from /builder
  useEffect(() => {
    if (typeof window !== "undefined") {
      const builderResume = sessionStorage.getItem("hirelens_builder_resume");
      if (builderResume && builderResume.trim()) {
        setResumeMode("text");
        setResumeText(builderResume.trim());
        sessionStorage.removeItem("hirelens_builder_resume");
      }
    }
  }, []);

  const hasResume = resumeMode === "file" ? !!resumeFile : resumeText.trim().length >= 80;
  const hasJd = jobDescription.trim().length >= 40;

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 2) as Step), []);
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0) as Step), []);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-28 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Analyze your resume
        </h1>
        <p className="mt-2 text-muted">
          Compare your resume with a job description. Free launch promotion available.
        </p>
      </motion.div>

      <ProgressStepper step={step} className="mt-8" />

      <div className="relative mt-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <ResumeUpload
                mode={resumeMode}
                onModeChange={setResumeMode}
                file={resumeFile}
                onFileChange={setResumeFile}
                text={resumeText}
                onTextChange={setResumeText}
              />
              <div className="mt-8 flex justify-end">
                <button
                  disabled={!hasResume}
                  onClick={goNext}
                  className="rounded-[4px] border-2 border-ink bg-lime px-6 py-3 font-semibold text-ink transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Continue to job description →
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="jd"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
              />
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 font-medium text-muted transition-colors hover:text-ink"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  disabled={!hasJd}
                  onClick={goNext}
                  className="rounded-[4px] border-2 border-ink bg-lime px-6 py-3 font-semibold text-ink transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Review & pay →
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <ScanReview
                resumeFile={resumeFile}
                resumeText={resumeText}
                resumeMode={resumeMode}
                jobDescription={jobDescription}
                onBack={goBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
