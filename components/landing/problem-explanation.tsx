import { Reveal } from "@/components/motion/reveal";
import { MotionGraphic } from "@/components/motion/motion-graphic";

export function ProblemExplanation() {
  return (
    <section className="grid-bg px-5 py-24 text-paper md:px-14 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="label text-lime">The gap between applying and getting noticed</p>
          <p className="mt-6 max-w-xl text-2xl leading-snug md:text-3xl">
            A resume can look good and still miss what a particular role needs. <span className="text-lime">HireLens helps you spot the gaps</span> before you hit apply.
          </p>
        </Reveal>
        <Reveal delay={0.15}><MotionGraphic /></Reveal>
      </div>
    </section>
  );
}
