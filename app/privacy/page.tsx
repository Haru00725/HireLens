import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { ShieldCheck, Lock, Trash2, Clock, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy & Data Architecture — HireLens",
  description:
    "Honest, transparent disclosure of how HireLens processes, retains, and secures your resume data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-paper pb-24 pt-28">
        <article className="mx-auto w-full max-w-3xl px-6 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to overview
          </Link>

          <header className="mt-6 border-b border-line pb-8">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Data Stewardship
            </span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-5xl">
              Privacy by Architecture.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              HireLens is built around a single principle: we do not monetize your data, sell resume profiles, or retain documents longer than needed to deliver your scan.
            </p>
          </header>

          <div className="mt-10 space-y-12 text-sm leading-relaxed text-ink">
            {/* Section 1: Documents and In-Memory Handling */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-ink" />
                <h2 className="text-xl font-semibold">1. Accepted Documents & File Handling</h2>
              </div>
              <p className="text-muted">
                HireLens accepts resumes in <strong>PDF</strong> and <strong>DOCX</strong> format, as well as direct plain text paste. When you upload a document:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>
                  <strong className="text-ink">In-Memory Parsing Only:</strong> Uploaded files are streamed directly into server memory, parsed using open-source libraries (<code className="rounded bg-line/40 px-1 py-0.5 font-mono text-xs">pdfjs-dist</code> and <code className="rounded bg-line/40 px-1 py-0.5 font-mono text-xs">mammoth</code>), and the binary file is immediately discarded.
                </li>
                <li>
                  <strong className="text-ink">No Permanent File Storage:</strong> We do not store original PDF/DOCX files in AWS S3, Google Cloud Storage, or disk storage.
                </li>
                <li>
                  <strong className="text-ink">No Scanned Image OCR:</strong> Files without extractable text are rejected immediately to protect confidentiality.
                </li>
              </ul>
            </section>

            {/* Section 2: AI Processing & HireLens Advanced LLMs */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-ink" />
                <h2 className="text-xl font-semibold">2. How AI Analyzes Your Data</h2>
              </div>
              <p className="text-muted">
                To generate your match breakdown, the extracted text from your resume and the target job description are processed by HireLens Advanced LLMs via encrypted, server-to-server TLS connections.
              </p>
              <div className="rounded-[6px] border border-line bg-line/20 p-4 text-xs text-muted">
                <p className="font-semibold text-ink">Zero-Training & Confidentiality Commitment:</p>
                <p className="mt-1">
                  We enforce commercial, zero-training API agreements. Customer resumes, job descriptions, and prompts submitted through HireLens are strictly never used to train or improve public foundation models.
                </p>
              </div>
            </section>

            {/* Section 3: Retention & Automatic Pruning */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-ink" />
                <h2 className="text-xl font-semibold">3. Data Retention Lifecycle</h2>
              </div>
              <p className="text-muted">
                Our database enforces strict automatic time-to-live (TTL) limits and proactive data pruning:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[6px] border border-line bg-paper p-4">
                  <span className="font-mono text-xs uppercase text-amber-700 font-semibold">
                    Unpaid Drafts: 45 Minutes
                  </span>
                  <p className="mt-2 text-xs text-muted">
                    If a scan draft is created but not paid for, it expires automatically after 45 minutes and is purged.
                  </p>
                </div>
                <div className="rounded-[6px] border border-line bg-paper p-4">
                  <span className="font-mono text-xs uppercase text-emerald-700 font-semibold">
                    Post-Analysis Text Deletion
                  </span>
                  <p className="mt-2 text-xs text-muted">
                    Once the AI analysis completes, the server zeroes out the raw <code className="font-mono text-[11px]">resume_text</code> and <code className="font-mono text-[11px]">job_description</code> columns in the database.
                  </p>
                </div>
              </div>
              <p className="text-muted text-xs">
                Only the resulting structured analysis (score, matched requirements, recommendations) is retained for up to <strong>7 days</strong> so you can access your dashboard and download your PDF report without having to pay again. After 7 days, the scan record is permanently deleted.
              </p>
            </section>

            {/* Section 4: Payments & Security */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-ink" />
                <h2 className="text-xl font-semibold">4. Payments & Financial Information</h2>
              </div>
              <p className="text-muted">
                HireLens charges a one-time fee of <strong>₹19 per scan</strong> processed through <strong>Razorpay</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>HireLens never receives, sees, or stores your credit/debit card numbers or UPI PINs.</li>
                <li>All payment transactions are encrypted and processed by Razorpay under RBI guidelines and PCI-DSS compliance.</li>
                <li>There is <strong>never a subscription</strong>, automatic renewal, or hidden recurrence.</li>
              </ul>
            </section>

            {/* Section 5: AI Limitations & Disclaimers */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-ink" />
                <h2 className="text-xl font-semibold">5. AI Scope & Employment Disclaimers</h2>
              </div>
              <div className="space-y-2 text-xs text-muted">
                <p>
                  <strong>No Employment Guarantee:</strong> HireLens is an analytical evaluation tool. Receiving a high match score does not guarantee interviews, offers, or employment.
                </p>
                <p>
                  <strong>Absence of Evidence:</strong> A "Missing" rating means that the relevant skill or metric was not found in the resume text provided. It does not mean you do not possess that skill in real life.
                </p>
                <p>
                  <strong>Suggested Rewrites:</strong> Bullet point recommendations generated by the tool are examples designed to illustrate effective phrasing. You must verify and adapt them with your real accomplishments.
                </p>
              </div>
            </section>

            {/* Section 6: Data Deletion Requests */}
            <section className="space-y-4 border-t border-line pt-8">
              <div className="flex items-center gap-2">
                <Trash2 size={18} className="text-ink" />
                <h2 className="text-xl font-semibold">6. Instant Deletion Requests</h2>
              </div>
              <p className="text-muted">
                If you have any queries or wish to delete your scan record and generated report before the 7-day automatic expiry window, you can send an email with your Scan ID to:
              </p>
              <a
                href="mailto:hello@delusive.studio"
                className="font-mono text-sm font-semibold text-ink underline underline-offset-4"
              >
                hello@delusive.studio
              </a>
              <p className="text-xs text-muted">
                Queries and requests are processed within 24 hours.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
