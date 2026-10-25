"use client";
import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { EASE } from "@/lib/tokens";

// 9 sample requirements: 6 matched, 2 partial, 1 missing → (6 + 2×0.5) / 9 ≈ 78
const REQS = [
  ["React & TypeScript", "match"], ["REST API design", "match"], ["Unit testing", "match"], ["Git workflow", "match"],
  ["Agile teams", "match"], ["SQL databases", "match"], ["CI/CD pipelines", "partial"], ["Cloud deployment", "partial"], ["Kubernetes", "missing"],
] as const;
const STYLE = { match: "bg-lime text-ink", partial: "bg-white text-ink border border-ink", missing: "bg-ink text-paper" };
const LABEL = { match: "Matched", partial: "Partial", missing: "Not shown" };

export function ResultsPreview() {
  const R = 54, C = 2 * Math.PI * R;
  return (
    <section className="grid-bg border-t border-white/10 px-5 py-24 text-paper md:px-14 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label text-lime">04 / Inside your report</p>
          <h2 className="mt-6 text-[clamp(2.2rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight">Clarity you can act on.</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <div className="grid gap-px overflow-hidden rounded-[6px] border-2 border-paper bg-ink/20 text-ink lg:grid-cols-[260px_1fr_1fr]">
            <div className="flex flex-col items-center justify-center bg-paper p-8">
              <p className="label text-muted">Sample · Estimated match</p>
              <div className="relative mt-4">
                <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90" aria-hidden="true">
                  <circle cx="60" cy="60" r={R} fill="none" stroke="#DCDDD3" strokeWidth="10" />
                  <motion.circle cx="60" cy="60" r={R} fill="none" stroke="#111318" strokeWidth="10" strokeDasharray={C}
                    initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: C * (1 - 0.78) }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold">78</span><span className="label text-muted">/ 100</span></div>
              </div>
              <p className="mt-4 text-center text-sm text-muted">6 matched · 2 partial · 1 not shown</p>
            </div>
            <div className="bg-white p-8">
              <h3 className="label text-muted">Requirements</h3>
              <ul className="mt-4 space-y-2">
                {REQS.map(([t, s]) => (
                  <li key={t} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-sm">
                    <span>{t}</span><span className={`label rounded-[3px] px-2 py-1 !text-[0.62rem] ${STYLE[s]}`}>{LABEL[s]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8">
              <h3 className="label text-muted">Strengths</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm"><li>Strong frontend and API evidence</li><li>Clear testing practice</li></ul>
              <h3 className="label mt-7 text-muted">Recommendations</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm"><li>Name the CI tools you have used</li><li>Add a deployment example with outcomes</li><li>If you have container experience, show it</li></ul>
              <div className="mt-7 flex items-center gap-3 border border-dashed border-ink/40 p-3 text-sm"><FileText size={20} aria-hidden="true" /><span>PDF report <span className="label text-muted">· sample</span></span></div>
            </div>
          </div>
          <p className="label mt-5 text-paper/60">Illustrative example only. Match scores are estimates, not hiring predictions.</p>
        </Reveal>
      </div>
    </section>
  );
}
