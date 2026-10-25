"use client";
import { motion } from "motion/react";

export function MagnifyingLens({ className = "" }: { className?: string }) {
  const marks: [number, number][] = [[52, 60], [72, 60], [52, 80], [96, 96], [64, 108]];
  return (
    <motion.svg viewBox="0 0 200 200" aria-hidden="true" className={className} whileHover={{ rotate: -8, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}>
      <circle cx="82" cy="82" r="66" fill="#C8F169" stroke="#111318" strokeWidth="9" />
      <path d="M38 70a46 46 0 0 1 30-30" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {marks.map(([x, y], i) => <rect key={i} x={x} y={y} width="12" height="12" fill="#111318" opacity={i === 3 ? 1 : 0.18} />)}
      <motion.rect x="104" y="104" width="10" height="10" fill="#111318" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
      {[[82, 4], [82, 160], [4, 82], [160, 82]].map(([x, y], i) => <rect key={i} x={x - 4} y={y - 4} width="8" height="8" fill="#111318" />)}
      <line x1="132" y1="132" x2="186" y2="186" stroke="#111318" strokeWidth="24" strokeLinecap="round" />
      <line x1="128" y1="128" x2="144" y2="144" stroke="#C8F169" strokeWidth="5" strokeLinecap="round" />
    </motion.svg>
  );
}
