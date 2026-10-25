import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-lime px-5 py-16 text-ink md:px-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-3xl font-bold tracking-tight">HireLens</p>
          <p className="mt-3 max-w-sm">Compare your resume with a specific job description and see where your fit is clear, and where it isn&apos;t yet.</p>
        </div>
        <nav aria-label="Product" className="space-y-2">
          <p className="label">Product</p>
          <a className="block underline-offset-4 hover:underline" href="#about">About</a>
          <a className="block underline-offset-4 hover:underline" href="#how">How it works</a>
          <a className="block underline-offset-4 hover:underline" href="#features">Features</a>
          <Link className="block underline-offset-4 hover:underline" href="/analyze">Check my resume</Link>
        </nav>
        <nav aria-label="Legal" className="space-y-2">
          <p className="label">Legal</p>
          <Link className="block underline-offset-4 hover:underline" href="/privacy">Privacy</Link>
        </nav>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl items-center justify-between border-t-2 border-ink pt-5">
        <p className="label">© {new Date().getFullYear()} HireLens</p>
        <div aria-hidden="true" className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className="h-3 w-3 bg-ink" style={{ opacity: 1 - i * 0.25 }} />)}</div>
      </div>
    </footer>
  );
}
