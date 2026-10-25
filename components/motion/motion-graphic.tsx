"use client";
import { motion } from "motion/react";

/** Pass `src` (local /public path, MP4/WebM) once the Google Flow asset exists. */
export function MotionGraphic({ src, poster }: { src?: string; poster?: string }) {
  if (src) {
    return (
      <video className="w-full border border-white/20" src={src} poster={poster} autoPlay muted loop playsInline preload="none"
        aria-label="Animation of a lens scanning a resume and a job description" />
    );
  }
  const rows = (n: number) => Array.from({ length: n }, (_, i) => i);
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden border border-white/20 bg-ink/60">
      <svg viewBox="0 0 400 320" className="h-full w-full" role="img" aria-label="Placeholder illustration: a lens scanning a resume and a job description">
        {[{ x: 30, t: "RESUME" }, { x: 250, t: "JOB" }].map((d) => (
          <g key={d.t}>
            <rect x={d.x} y={50} width={120} height={180} fill="#F7F7F0" />
            <text x={d.x + 10} y={70} fontSize="9" fontFamily="monospace" fill="#111318">{d.t}</text>
            {rows(7).map((i) => <rect key={i} x={d.x + 10} y={85 + i * 18} width={i % 3 === 2 ? 60 : 98} height={8} fill="#111318" opacity={0.2} />)}
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <motion.rect key={i} width="12" height="12" fill="#C8F169" y={100 + i * 40}
            animate={{ x: [150, 238], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }} />
        ))}
        <motion.g animate={{ x: [-10, 190, -10], y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
          <circle cx="90" cy="150" r="40" fill="#C8F169" fillOpacity="0.55" stroke="#C8F169" strokeWidth="5" />
          <line x1="119" y1="179" x2="148" y2="208" stroke="#C8F169" strokeWidth="10" strokeLinecap="round" />
        </motion.g>
      </svg>
      <span className="label absolute bottom-3 left-3 text-lime/80">MOTION GRAPHIC / PLACEHOLDER</span>
    </div>
  );
}
