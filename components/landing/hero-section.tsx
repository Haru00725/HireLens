"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MagnifyingLens } from "./magnifying-lens";
import { EASE } from "@/lib/tokens";

function Mask({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.12em] pr-[0.1em] ${className ?? ""}`}>
      <motion.span className="block" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: EASE, delay }}>{children}</motion.span>
    </span>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const lensY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const lensRot = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-paper px-5 pb-20 pt-28 md:px-10">
      <span className="label absolute left-5 top-24 text-muted md:left-10">Resume intelligence / 001</span>
      <motion.div style={{ y: contentY, opacity: fade }} className="mx-auto w-full max-w-7xl">
        <h1 className="leading-[0.95]">
          <Mask delay={0.25} className="text-[clamp(2.25rem,7vw,6rem)] font-medium tracking-tight">Are you</Mask>
          <span className="flex items-center gap-2 md:gap-4">
            <Mask delay={0.45} className="font-serif text-[clamp(3.6rem,15vw,13rem)] italic leading-[0.95] tracking-[-0.03em]">Hireable</Mask>
            <motion.span style={{ y: lensY, rotate: lensRot }} className="shrink-0">
              <motion.span className="block" initial={{ scale: 0.4, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}>
                <MagnifyingLens className="h-[clamp(4.5rem,13vw,11rem)] w-[clamp(4.5rem,13vw,11rem)]" />
              </motion.span>
            </motion.span>
          </span>
          <span className="sr-only-text">— Free ATS Resume Builder &amp; AI Job Description Matcher</span>
        </h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 1.2 }}
          className="mt-8 max-w-md text-lg text-ink/80">Your resume. The role. A clearer picture of your fit.</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 1.4 }} className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/analyze" className="rounded-[4px] border-2 border-ink bg-lime px-7 py-4 font-semibold text-ink shadow-[4px_4px_0_#111318] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111318] active:translate-x-1 active:translate-y-1 active:shadow-none">Check my resume ↗</Link>
          <Link href="/builder" className="rounded-[4px] border-2 border-ink bg-paper px-6 py-4 font-semibold text-ink shadow-[2px_2px_0_#111318] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111318] active:translate-x-1 active:translate-y-1 active:shadow-none">Build my resume</Link>
          <span className="label text-muted">Free ATS builder · Role matching</span>
        </motion.div>
      </motion.div>
      <motion.a href="#problem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="label absolute bottom-6 left-1/2 -translate-x-1/2 text-muted">
        <motion.span className="block" animate={{ y: [0, 4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>Scroll to explore ↓</motion.span>
      </motion.a>
    </section>
  );
}
