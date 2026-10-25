# HireLens — AI Resume & Job Description Matching SaaS

HireLens is an objective, privacy-first AI matching platform and ATS resume builder. It evaluates how well a candidate's resume satisfies a target job description, provides a calibrated match score (0–100), offers a free ATS resume builder, and features a complete AI optimization bundle with an included re-scan.

---

## 1. Product Packages & Pricing

HireLens features two scan packages presented before checkout:

| Package | Launch Promotion (48 Hours) | Regular Pricing | What's Included |
| :--- | :--- | :--- | :--- |
| **Option 1: Initial Scan Only** | **FREE (₹0)** | **₹19 / scan** | 1 initial scan against target JD, match score (0–100), requirements breakdown with quotes, recommendations, downloadable PDF report. |
| **Option 2: Complete AI Optimization Bundle** | **₹39 TOTAL** | **₹39 TOTAL** | Everything in Initial Scan + targeted follow-up questions to uncover missing evidence, AI-enhanced ATS resume, editable ATS workspace, **1 included re-scan** against the same JD, before & after score comparison, and 3 downloadable PDFs. |

### Post-Report Upgrades
Users who initially select Option 1 can upgrade to the complete bundle after reviewing their first report:
- **₹20 upgrade** if they already paid ₹19.
- **₹39 upgrade** if their initial scan was free during the launch offer.
- The server computes the exact upgrade differential; users are never double-charged.

---

## 2. Features & Capabilities

- **Free ATS Resume Builder (`/builder`)**: Guided, single-column resume builder with real-time completeness feedback, section-by-section editing, AI writing assistance (summaries & bullet points), instant selectable-text PDF export, and direct handoff to `/analyze`.
- **ATS-Friendly Format Only**: Single-column layout, standard readable fonts (Helvetica vector), conventional headings, consistent margins, selectable text. No columns, no tables, no avatars, and no graphical skill bars.
- **AI Matching & Optimization**: Dual-engine pipeline powered by Groq (`openai/gpt-oss-120b` / `qwen/qwen3.8-27b`) with automatic fallback to Gemini (`gemini-3.5-flash-lite`).
- **48-Hour Free Scan Launch Offer**: Server-authoritative promotion (`startAt <= serverNow < startAt + 48h`). When active, Option 1 is free without fake payment records. Complete bundle remains ₹39.
- **Security & Privacy**: Ephemeral in-memory file parsing, server-side HMAC-SHA256 signature verification, and automated raw text pruning.

---

## 3. Directory Structure

```
hirelens/
├── app/
│   ├── analyze/page.tsx             # 3-step Resume & JD upload with 2-package checkout
│   ├── builder/page.tsx             # Free ATS Resume Builder & live preview
│   ├── results/[scanId]/page.tsx    # Scan dashboard, bundle Q&A, rescan comparison
│   ├── privacy/page.tsx             # Data retention & privacy policy
│   ├── api/
│   │   ├── builder/ai-assist/       # AI bullet and summary drafting assistant
│   │   ├── scans/draft/route.ts     # Draft creation & document parser
│   │   ├── scans/[scanId]/package/  # Update scan package type
│   │   ├── scans/[scanId]/bundle/   # Questions, optimization, and included rescan
│   │   ├── payments/create-order/   # Razorpay orders (₹19, ₹39, or ₹20 upgrade)
│   │   ├── payments/free-checkout/  # Genuine launch promo verification
│   │   └── payments/verify/route.ts # Timing-safe signature verification
├── components/
│   ├── analyzer/                    # Multi-step upload & 2-package selection
│   ├── builder/                     # Guided ATS resume wizard & live preview
│   ├── results/                     # Dashboard & interactive bundle workspace
│   ├── landing/                     # Landing page sections & StartFromScratch
│   └── navigation/navbar.tsx        # Branded navigation with /builder link
├── lib/
│   ├── config.ts                    # Server configuration & promo eligibility
│   ├── ats-resume.ts                # Structured ATS resume schema & plain-text
│   ├── ats-pdf-generator.ts         # Single-column ATS vector PDF generator
│   ├── ai-resume-optimizer.ts       # Contextual Q&A and ATS resume enhancement
│   ├── groq.ts / gemini.ts          # AI inference engines with fallback
│   ├── scan-store.ts                # Database state transitions & bundle persistence
│   └── report-generator.ts          # Branded analysis report PDF generator
```

---

## 3. Environment Variables Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your actual provider credentials:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Application URL (e.g. `http://localhost:3000` or production domain) |
| `GEMINI_API_KEY` | Google Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | Model identifier (defaults to `gemini-2.5-flash`) |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret configured in your Razorpay dashboard |
| `SUPABASE_URL` | Supabase Project URL (`https://your-project.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret (bypasses RLS on server) |
| `SCAN_PRICE_INR` | Scan-only price in INR (defaults to `19`) |
| `BUNDLE_PRICE_INR` | Complete AI Optimization Bundle price in INR (defaults to `39`) |
| `FREE_SCAN_PROMO_ENABLED` | Set `true` to enable launch free scan eligibility |
| `FREE_SCAN_PROMO_START_AT` | Launch timestamp (ISO 8601 string, e.g. `2026-10-26T00:00:00Z`). If empty, promo is inactive |
| `FREE_SCAN_PROMO_DURATION_HOURS` | Promotion duration in hours (defaults to `48`) |
| `SCAN_DRAFT_TTL_MINUTES` | Time until unpaid drafts expire (defaults to `45`) |
| `REPORT_RETENTION_DAYS` | Days completed scan reports are retained (defaults to `7`) |

---

## 4. Provider Configuration Guide

### 1. Google Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/) and create an API Key.
2. Set `GEMINI_API_KEY` in your `.env.local`.
3. Default model is `gemini-2.5-flash`. Structured JSON outputs are validated with Zod.

### 2. Supabase Database
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/0001_create_scans.sql` in this repo and execute the script.
4. Go to **Project Settings** → **API** to copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY` *(Never expose this in client code)*.

### 3. Razorpay Payments
1. Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Under **Account & Settings** → **API Keys**, generate your **Key ID** and **Key Secret**.
3. Under **Account & Settings** → **Webhooks**, add a new webhook:
   - **Webhook URL**: `https://your-domain.com/api/payments/webhook`
   - **Secret**: Enter a secure random string and set as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events**: `payment.captured`, `order.paid`.

### 4. Vercel Deployment
1. Import repository into Vercel.
2. In Project Settings → Environment Variables, add all variables from `.env.example`.
3. Deploy!

---

## 5. Development & Testing Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Run TypeScript compilation check
npx tsc --noEmit

# Run Vitest unit tests
npm test

# Build production bundle
npm run build
```

---

## 6. Privacy & Data Handling Guarantee

- **Zero-Storage for Original Documents**: Uploaded PDFs and DOCX files are parsed in memory and immediately discarded. Original files are never written to disk or object storage.
- **Immediate Raw Text Purge**: Once the AI analysis completes, `resume_text` and `job_description` are set to `NULL` in the database.
- **Unpaid Draft Expiration**: Unpaid scan drafts automatically expire after 45 minutes.
- **Configured Retention**: Completed report data is kept for 7 days so users can review results and download PDFs, then automatically purged.
- **Zero AI Training**: API calls to Google Gemini use commercial API terms where user prompts are not used to train models.

---

## 7. Known Considerations

1. **Scanned/Image-Only PDFs**: Files without extractable text streams cannot be parsed by `pdfjs-dist`. HireLens rejects these with a clear prompt asking the user to upload a digital text-based PDF or paste resume text directly.
2. **Payment-First Enforcement**: Gemini analysis will only execute for scans with verified payment status. If an AI call fails, the scan enters a `failed` state and permits free retries without a second charge.
