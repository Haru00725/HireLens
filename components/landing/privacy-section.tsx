import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

const POINTS = [
  ["Supported formats", "PDF and DOCX files, or pasted resume text."],
  ["How text is processed", "Your resume text is extracted in-memory to evaluate it against the target job requirements."],
  ["AI Engine", "Evaluated by HireLens Advanced LLMs via encrypted, zero-training enterprise API pipelines."],
  ["Retention", "Drafts expire in 45 minutes and raw files are purged immediately after scan completion."],
  ["It's an estimate", "Scores are objective match estimates. Missing evidence on a resume doesn't prove you lack a skill."],
  ["No guarantees", "HireLens provides calibration data to improve your chances, not guaranteed employment."],
];

export function PrivacySection() {
  return (
    <section className="grid-bg border-t border-white/10 px-5 py-24 text-paper md:px-14 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label text-lime">06 / Built with transparency</p>
          <h2 className="mt-6 max-w-3xl text-[clamp(2.2rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight">Your resume is personal. Treat it that way.</h2>
        </Reveal>
        <dl className="mt-14 grid gap-x-12 md:grid-cols-2">
          {POINTS.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 2) * 0.08} className="border-t border-white/20 py-6"><dt className="font-semibold text-lime">{t}</dt><dd className="mt-1 text-paper/75">{d}</dd></Reveal>
          ))}
        </dl>
        <Link href="/privacy" className="mt-8 inline-block underline underline-offset-4 hover:text-lime">Read the privacy page</Link>
      </div>
    </section>
  );
}
