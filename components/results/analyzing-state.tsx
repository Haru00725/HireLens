"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Sparkles, Lightbulb, Compass, ArrowRight } from "lucide-react";
import { EASE } from "@/lib/tokens";

interface Props {
  scanId: string;
  onCompleted: () => void;
  onFailed: (err: string) => void;
}

const STAGES = [
  "Parsing resume structure and credentials...",
  "Extracting explicit & implicit job requirements...",
  "Cross-referencing verified evidence & qualifications...",
  "Evaluating seniority alignment & technical scope...",
  "Formulating actionable recommendations & rewrites...",
];

const RESUME_TIPS = [
  {
    topic: "The Google XYZ Formula",
    text: "Structure major achievements as: 'Accomplished [X], as measured by [Y], by doing [Z]'. Resumes with quantified business metrics receive 2.4x more interview callbacks.",
  },
  {
    topic: "ATS Scanner Optimization",
    text: "Avoid rating skills with 5-star bars or progress graphs. ATS parsers treat graphical skill meters as unreadable blanks, obscuring your real proficiency.",
  },
  {
    topic: "Title & Seniority Alignment",
    text: "If you led architectural decisions or managed engineers under a flat title, reflect that seniority in your summary (e.g. 'Senior / Lead Frontend Architect').",
  },
  {
    topic: "Keyword Integration vs Stuffing",
    text: "Never paste white text or hidden keyword blocks. Modern parsing algorithms detect invisible text and flag your resume. Always weave terms naturally into bullet points.",
  },
  {
    topic: "Single-Column Hierarchy",
    text: "Stick to clean single-column hierarchy for initial online applications. Multi-column sidebars frequently scramble employment chronology in enterprise applicant systems.",
  },
  {
    topic: "The 7-Second Rule",
    text: "Recruiters scan resumes in an F-shaped pattern, spending an average of 7.4 seconds. Place your 3 strongest matching accomplishments in the top 30% of page one.",
  },
  {
    topic: "Exact Terminology Matching",
    text: "Mirror the exact phrasing used in the job post: if they ask for 'Kubernetes orchestration', use that exact term alongside general containerization experience.",
  },
];

export function AnalyzingState({ scanId, onCompleted, onFailed }: Props) {
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(14);

  // Rotate stage text
  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
      setProgress((prev) => Math.min(prev + 18, 94));
    }, 2600);
    return () => clearInterval(stageTimer);
  }, []);

  // Rotate tips
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % RESUME_TIPS.length);
    }, 4200);
    return () => clearInterval(tipTimer);
  }, []);

  // Poll scan status
  useEffect(() => {
    let mounted = true;
    let pollCount = 0;
    const maxPolls = 150; // 150 * 1.2s = 180 seconds max

    const checkStatus = async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(interval);
        if (mounted) onFailed("Analysis is taking longer than usual. Please retry.");
        return;
      }

      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (!mounted) return;

        if (data.status === "completed" && data.reportJson) {
          setProgress(100);
          clearInterval(interval);
          setTimeout(onCompleted, 400);
        } else if (data.status === "failed") {
          clearInterval(interval);
          onFailed(data.errorCode || "Analysis failed during processing.");
        }
      } catch {
        // network glitch, continue polling
      }
    };

    // Check immediately
    checkStatus();
    const interval = setInterval(checkStatus, 1200);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [scanId, onCompleted, onFailed]);

  const currentTip = RESUME_TIPS[tipIndex];

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      {/* Sleek Scanning Lens Animation */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Outer Rings */}
        <div className="absolute h-40 w-40 rounded-full border border-ink/10 bg-lime/10 animate-ping opacity-60" />
        <div className="absolute h-32 w-32 rounded-full border border-dashed border-ink/30 animate-[spin_10s_linear_infinite]" />

        {/* Central Scanner Core */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-paper shadow-md"
        >
          {/* Animated Laser Beam */}
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-[2.5px] bg-lime-600 shadow-[0_0_8px_#C8F169]"
          />

          <Compass size={38} className="text-ink animate-[spin_20s_linear_infinite]" />
        </motion.div>
      </div>

      {/* Status Heading & Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        className="mt-8"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full border border-ink bg-lime px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
            HIRELENS ADVANCED LLMS RUNNING
          </span>
          <span className="font-mono text-xs font-semibold text-muted">
            {progress}%
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Analyzing your resume against the role...
        </h2>

        {/* Active Stage Indicator */}
        <div className="mt-2.5 flex items-center justify-center gap-2 font-mono text-xs text-muted">
          <Sparkles size={14} className="text-lime-700 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.span
              key={stageIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-ink font-medium"
            >
              {STAGES[stageIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Smooth Progress Bar */}
        <div className="mx-auto mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-line/60">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: EASE }}
            className="h-full bg-ink"
          />
        </div>
      </motion.div>

      {/* Rotating Resume & Job Tips Box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        className="relative mt-10 w-full overflow-hidden rounded-[8px] border-2 border-ink bg-paper p-6 text-left shadow-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lime border border-ink">
              <Lightbulb size={13} className="text-ink" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
              PRO RESUME & INTERVIEW TIP
            </span>
          </div>

          <span className="font-mono text-[11px] text-muted">
            Tip {tipIndex + 1} of {RESUME_TIPS.length}
          </span>
        </div>

        {/* Tip Content with Animation */}
        <div className="min-h-[90px] pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <h4 className="text-sm font-semibold text-ink">
                {currentTip.topic}
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {currentTip.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated Tip Timer Bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line/40">
          <motion.div
            key={tipIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.2, ease: "linear" }}
            className="h-full bg-lime-600"
          />
        </div>
      </motion.div>

      {/* Live Checkpoints */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Factual evidence extraction
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Zero AI model training
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Instant PDF ready on complete
        </span>
      </div>
    </div>
  );
}
