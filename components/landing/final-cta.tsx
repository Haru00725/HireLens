"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { MagnifyingLens } from "./magnifying-lens";
import { Reveal } from "@/components/motion/reveal";

export function FinalCta() {
  return (
    <section className="grid-bg relative overflow-hidden border-t border-white/10 px-5 py-28 text-paper md:px-14 md:py-40">
      <motion.div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 hidden w-[28rem] -translate-y-1/2 opacity-90 md:block"
        initial={{ x: 120, rotate: 20, opacity: 0 }} whileInView={{ x: 0, rotate: 0, opacity: 0.9 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
        <MagnifyingLens className="w-full" />
      </motion.div>
      <Reveal className="relative mx-auto max-w-7xl">
        <h2 className="max-w-3xl text-[clamp(2.4rem,7vw,6rem)] font-medium leading-[1] tracking-tight">Stop guessing. Start improving.</h2>
        <p className="mt-6 max-w-md text-lg text-paper/75">See what your resume communicates before you send your next application.</p>
        <Link href="/analyze" className="mt-10 inline-block rounded-[4px] border-2 border-lime bg-lime px-8 py-4 font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0">Check my resume ↗</Link>
      </Reveal>
    </section>
  );
}
