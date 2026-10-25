import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-lime px-5 py-16 text-ink md:px-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-bold tracking-tight">HireLens</p>
            <span className="font-mono text-xs uppercase tracking-wider text-ink/75 font-semibold">
              A Delusive Product
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm">
            Compare your resume with a specific job description and see where your fit is clear, and where it isn&apos;t yet.
          </p>
        </div>

        <nav aria-label="Product" className="space-y-2">
          <p className="label">Product</p>
          <a className="block underline-offset-4 hover:underline" href="/#about">About</a>
          <a className="block underline-offset-4 hover:underline" href="/#how">How it works</a>
          <a className="block underline-offset-4 hover:underline" href="/#features">Features</a>
          <Link className="block underline-offset-4 hover:underline" href="/analyze">Check my resume</Link>
          <Link className="block underline-offset-4 hover:underline" href="/builder">Resume builder</Link>
        </nav>

        <nav aria-label="Support & Legal" className="space-y-2">
          <p className="label">Queries</p>
          <a
            className="block font-mono text-xs font-semibold underline-offset-4 hover:underline break-all"
            href="mailto:hello@delusive.studio"
          >
            hello@delusive.studio
          </a>
          <div className="pt-3">
            <p className="label">Legal</p>
            <Link className="block underline-offset-4 hover:underline" href="/privacy">
              Privacy
            </Link>
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t-2 border-ink pt-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <p className="label">© {new Date().getFullYear()} HireLens</p>
          <span className="text-ink/40">•</span>
          <p className="label font-semibold">A Delusive Product</p>
        </div>
        <div aria-hidden="true" className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-3 w-3 bg-ink" style={{ opacity: 1 - i * 0.25 }} />
          ))}
        </div>
      </div>
    </footer>
  );
}

