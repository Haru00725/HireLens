import { Reveal } from "@/components/motion/reveal";
import { PixelIcon } from "@/components/motion/pixel-icon";

const ITEMS = [
  { icon: "bars", t: "Understand the match.", d: "See how your experience lines up with what the role asks for." },
  { icon: "eye", t: "Discover missing evidence.", d: "Find requirements your resume doesn't clearly demonstrate yet." },
  { icon: "arrow", t: "Improve with purpose.", d: "Get specific suggestions tied to the job description." },
] as const;

export function AboutSection() {
  return (
    <section id="about" className="grid-bg border-t border-white/10 px-5 py-24 text-paper md:px-14 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label text-lime">02 / About HireLens</p>
          <h2 className="mt-6 max-w-3xl text-[clamp(2.2rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight">See your resume through a recruiter&apos;s lens.</h2>
          <p className="mt-6 max-w-xl text-lg text-paper/75">HireLens compares your resume with a specific job description to help you understand where your experience aligns, where evidence is missing, and what you can improve.</p>
        </Reveal>
        <div className="mt-16 grid border-t border-white/20 md:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.t} delay={i * 0.1} className="border-b border-white/20 py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <PixelIcon name={it.icon} />
              <h3 className="mt-6 text-xl font-semibold">{it.t}</h3>
              <p className="mt-2 max-w-xs text-paper/70">{it.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
