import { Reveal } from "@/components/motion/reveal";
import { PixelIcon } from "@/components/motion/pixel-icon";

const FEATURES = [
  { icon: "bars", t: "Estimated job-match score", d: "A single number to orient you, clearly marked as an estimate." },
  { icon: "list", t: "Requirement-by-requirement breakdown", d: "See which requirements are matched, partly shown, or missing evidence." },
  { icon: "eye", t: "Evidence-based recommendations", d: "Suggestions point to what the job description asks for, not generic tips." },
  { icon: "doc", t: "Exportable PDF report", d: "Keep your results to revisit while you edit your resume." },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="grid-bg border-t border-white/10 px-5 py-24 text-paper md:px-14 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label text-lime">05 / What you get</p>
          <h2 className="mt-6 text-[clamp(2.2rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight">More than a number.</h2>
        </Reveal>
        <div className="mt-14 grid border-t border-white/20 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.t} delay={(i % 2) * 0.1} className="flex gap-6 border-b border-white/20 py-9 md:px-8 md:odd:border-r md:odd:pl-0">
              <PixelIcon name={f.icon} className="shrink-0 text-lime" />
              <div><h3 className="text-xl font-semibold">{f.t}</h3><p className="mt-2 max-w-sm text-paper/70">{f.d}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
