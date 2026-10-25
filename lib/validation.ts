import { z } from "zod";

// ── Text limits ──────────────────────────────────────
export const RESUME_TEXT_MIN = 80;
export const RESUME_TEXT_MAX = 32_000;
export const JOB_DESC_MIN = 40;
export const JOB_DESC_MAX = 12_000;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Allowed upload types ─────────────────────────────
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".docx"] as const;

// ── File magic bytes ─────────────────────────────────
export const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
export const DOCX_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // PK (zip)

// ── Schemas ──────────────────────────────────────────

export const draftInputSchema = z.object({
  resumeText: z
    .string()
    .min(RESUME_TEXT_MIN, `Resume text must be at least ${RESUME_TEXT_MIN} characters`)
    .max(RESUME_TEXT_MAX, `Resume text must not exceed ${RESUME_TEXT_MAX} characters`),
  jobDescription: z
    .string()
    .min(JOB_DESC_MIN, `Job description must be at least ${JOB_DESC_MIN} characters`)
    .max(JOB_DESC_MAX, `Job description must not exceed ${JOB_DESC_MAX} characters`),
  packageType: z.enum(["scan_only", "bundle"]).optional().default("scan_only"),
});

export type DraftInput = z.infer<typeof draftInputSchema>;

export const scanIdSchema = z.string().uuid("Invalid scan ID");

// ── Gemini output schema (Zod) ───────────────────────

export const requirementSchema = z.object({
  name: z.string().max(200),
  importance: z.enum(["high", "medium", "low"]),
  status: z.enum(["matched", "partial", "missing"]),
  evidence: z.string().max(1000),
  recommendation: z.string().max(1000),
});

export const improvementSchema = z.object({
  title: z.string().max(200),
  explanation: z.string().max(1000),
  example: z.string().max(1500),
});

export const analysisSchema = z.object({
  roleTitle: z.string().max(200),
  matchScore: z.number().int().min(0).max(100),
  summary: z.string().max(2000),
  strengths: z.array(z.string().max(500)).max(10),
  requirements: z.array(requirementSchema).max(25),
  improvements: z.array(improvementSchema).max(10),
  caveats: z.array(z.string().max(500)).max(8),
});

export type ValidatedAnalysis = z.infer<typeof analysisSchema>;
