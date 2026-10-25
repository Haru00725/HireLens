"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion/reveal";
import { PixelIcon } from "@/components/motion/pixel-icon";
import { EASE } from "@/lib/tokens";

const STEPS = [
  { n: "01", icon: "doc", t: "Upload your resume", d: "Upload a PDF or DOCX, or paste your resume text." },
  { n: "02", icon: "list", t: "Add the job description", d: "Give HireLens the specific role you want to understand." },
  { n: "03", icon: "check", t: "Review your results", d: "Explore your estimated match, requirement evidence, and actionable suggestions." },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="grid-bg border-t border-white/10 px-5 py-24 text-paper md:px-14 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label text-lime">03 / How it works</p>
          <h2 className="mt-6 text-[clamp(2.2rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight">Three steps. A clearer direction.</h2>
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n}>
              <div className="relative h-4">
                <motion.div className="absolute left-0 top-1/2 h-px w-full origin-left bg-lime" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 1, ease: EASE, delay: i * 0.25 }} />
                <motion.span className="absolute left-0 top-0 h-4 w-4 bg-lime" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.25, duration: 0.3 }} />
              </div>
              <Reveal delay={0.2 + i * 0.25} className="pt-8">
                <span className="label text-lime">{s.n}</span>
                <div className="mt-4"><PixelIcon name={s.icon} /></div>
                <h3 className="mt-5 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 max-w-xs text-paper/70">{s.d}</p>
              </Reveal>
            </div>
          ))}
        </div>
        <Reveal className="mt-14">
          <Link href="/analyze" className="inline-block rounded-[4px] border-2 border-lime bg-lime px-7 py-4 font-semibold text-ink transition-transform hover:-translate-y-0.5">Analyze my resume ↗</Link>
        </Reveal>
      </div>
    </section>
  );
}
