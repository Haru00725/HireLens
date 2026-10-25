"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { EASE } from "@/lib/tokens";

const LINKS = [["About", "#about"], ["How it works", "#how"], ["Features", "#features"]];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 border-b bg-paper/95 backdrop-blur transition-all duration-300 ${scrolled ? "border-line py-2" : "border-transparent py-4"}`}>
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-10">
        <Link href="/" className="text-lg font-bold tracking-tight">HireLens</Link>
        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <Link href="/builder" className="group relative text-sm font-medium text-ink">
              Resume Builder
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </li>
          {LINKS.map(([t, h]) => (
            <li key={h}><a href={h} className="group relative text-sm font-medium">{t}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover:scale-x-100" /></a></li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link href="/builder" className="hidden sm:inline-flex items-center text-xs font-semibold text-muted hover:text-ink">Build my resume</Link>
          <Link href="/analyze" className="rounded-[4px] border-2 border-ink bg-lime px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0">Check my resume ↗</Link>
          <button className="p-2 md:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22} /></button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-modal="true" aria-label="Menu" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-0 z-50 flex flex-col bg-ink px-6 pt-5 text-paper md:hidden">
            <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close menu" className="self-end p-2"><X size={26} /></button>
            <ul className="mt-10 space-y-6">
              <li><Link href="/builder" onClick={() => setOpen(false)} className="font-serif text-4xl italic">Resume Builder</Link></li>
              {LINKS.map(([t, h]) => <li key={h}><a href={h} onClick={() => setOpen(false)} className="font-serif text-4xl italic">{t}</a></li>)}
              <li><Link href="/analyze" className="inline-block rounded-[4px] bg-lime px-5 py-3 font-semibold text-ink">Check my resume ↗</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
