"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/tokens";

const STEPS = ["Resume", "Job description", "Review & payment"];

export function ProgressStepper({ step, className = "" }: { step: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="navigation" aria-label="Progress">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div className="hidden h-px w-6 bg-line sm:block md:w-10">
                {done && (
                  <motion.div
                    className="h-full bg-ink"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </div>
            )}
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-widest transition-colors ${
                active
                  ? "bg-ink text-paper"
                  : done
                    ? "bg-lime text-ink"
                    : "bg-line/60 text-muted"
              }`}
              aria-current={active ? "step" : undefined}
            >
              <span className="flex h-4 w-4 items-center justify-center text-[0.6rem] font-bold">
                {done ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
