"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";

const PHRASES = ["You apply.", "You wait.", "But do you know why?"];
const RANGES: [number, number][] = [[0, 0.3], [0.3, 0.62], [0.62, 1]];

function Phrase({ text, progress, range, last }: { text: string; progress: MotionValue<number>; range: [number, number]; last: boolean }) {
  const [a, b] = range;
  const y = useTransform(progress, last ? [a, a + 0.1] : [a, a + 0.08, b - 0.08, b], last ? ["110%", "0%"] : ["110%", "0%", "0%", "-110%"]);
  const line = useTransform(progress, last ? [a + 0.08, a + 0.2] : [a, a + 0.1], ["0%", "100%"]);
  return (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col items-start justify-center px-5 md:px-14">
      <div className="overflow-hidden pb-[0.15em]">
        <motion.p style={{ y }} className={`font-medium leading-[0.95] tracking-tight ${last ? "text-[clamp(2.4rem,9vw,8rem)]" : "text-[clamp(3.2rem,13vw,12rem)]"}`}>
          {last ? <>But do you <span className="font-serif italic text-lime">know why?</span></> : text}
        </motion.p>
      </div>
      <motion.div style={{ width: line }} className="mt-4 h-[3px] bg-lime" />
    </div>
  );
}

export function ProblemSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const clip = useTransform(enter, [0, 1], ["inset(14svh 7vw 0vw 7vw)", "inset(0svh 0vw 0vw 0vw)"]);

  if (reduce) {
    return (
      <div id="problem" className="grid-bg px-5 py-24 text-paper md:px-14">
        <p className="label text-lime">01 / The problem</p>
        <h2 className="mt-6 space-y-2 text-5xl font-medium md:text-7xl">{PHRASES.map((p) => <span key={p} className="block">{p}</span>)}</h2>
      </div>
    );
  }
  return (
    <div ref={ref} id="problem" className="relative h-[280svh] bg-paper">
      <motion.div style={{ clipPath: clip }} className="grid-bg sticky top-0 h-svh overflow-hidden text-paper">
        <p className="label absolute left-5 top-24 text-lime md:left-14">01 / The problem</p>
        <h2 className="sr-only-text">You apply. You wait. But do you know why?</h2>
        {PHRASES.map((p, i) => <Phrase key={p} text={p} progress={scrollYProgress} range={RANGES[i]} last={i === 2} />)}
      </motion.div>
    </div>
  );
}
