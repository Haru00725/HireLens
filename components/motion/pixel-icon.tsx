const ICONS: Record<string, string[]> = {
  check: ["....#", "...##", "#.##.", ".##..", "..#.."],
  eye: [".###.", "#...#", "#.#.#", "#...#", ".###."],
  arrow: ["..#..", ".###.", "#.#.#", "..#..", "..#.."],
  bars: ["....#", "..#.#", "#.#.#", "#.#.#", "#####"],
  list: ["#.###", ".....", "#.###", ".....", "#.###"],
  doc: ["####.", "#..##", "#...#", "#...#", "#####"],
};
export function PixelIcon({ name, className = "text-lime" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 5 5" width="40" height="40" aria-hidden="true" className={className} shapeRendering="crispEdges" fill="currentColor">
      {ICONS[name].flatMap((row, y) => [...row].map((c, x) => (c === "#" ? <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
  );
}
