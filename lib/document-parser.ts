/** Server-only document parser for PDF and DOCX */

import { AppError, Errors } from "./errors";
import {
  MAX_FILE_SIZE_BYTES,
  RESUME_TEXT_MIN,
  RESUME_TEXT_MAX,
  PDF_MAGIC,
  DOCX_MAGIC,
} from "./validation";

/** Normalize whitespace: collapse runs, trim lines */
function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

function checkMagicBytes(buffer: ArrayBuffer, expected: number[]): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < expected.length) return false;
  return expected.every((b, i) => bytes[i] === b);
}

export interface ParseResult {
  text: string;
  pageCount?: number;
}

export async function parseDocument(
  buffer: ArrayBuffer,
  filename: string,
  mimeType: string,
): Promise<ParseResult> {
  // Size check
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw Errors.FILE_TOO_LARGE(5);
  }

  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (ext === ".pdf") {
    if (!checkMagicBytes(buffer, PDF_MAGIC)) throw Errors.INVALID_SIGNATURE();
    return parsePdf(buffer);
  }

  if (ext === ".docx") {
    if (!checkMagicBytes(buffer, DOCX_MAGIC)) throw Errors.INVALID_SIGNATURE();
    return parseDocx(buffer);
  }

  throw Errors.UNSUPPORTED_FORMAT(ext);
}

async function parsePdf(buffer: ArrayBuffer): Promise<ParseResult> {
  // In serverless / Node environments, importing the legacy worker module directly
  // binds WorkerMessageHandler to globalThis.pdfjsWorker, enabling the fake worker
  // in-memory without filesystem path resolution.
  // @ts-expect-error - legacy worker bundle does not provide typescript type declarations
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");



  try {
    const doc = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
    }).promise;

    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .filter(Boolean)
        .join(" ");
      pages.push(text);
    }

    const raw = pages.join("\n\n");
    const text = normalizeText(raw);

    if (!text || text.length < 10) {
      throw Errors.EMPTY_TEXT();
    }

    return { text, pageCount: doc.numPages };
  } catch (err) {
    console.error("[HireLens PDF Parser Error Details]:", err);
    if (AppError.isAppError(err)) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("password") || msg.includes("encrypted")) {
      throw Errors.ENCRYPTED_PDF();
    }
    throw new AppError(`PDF parsing failed: ${msg}`, "PDF_PARSE_ERROR", 400, "Could not read this PDF. Please try a different file or paste your resume text.");
  }
}

async function parseDocx(buffer: ArrayBuffer): Promise<ParseResult> {
  const mammoth = await import("mammoth");

  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    const text = normalizeText(result.value);

    if (!text || text.length < 10) {
      throw Errors.EMPTY_TEXT();
    }

    return { text };
  } catch (err) {
    if (AppError.isAppError(err)) throw err;
    throw new AppError("DOCX parsing failed", "DOCX_PARSE_ERROR", 400, "Could not read this DOCX file. Please try a different file or paste your resume text.");
  }
}

/** Validate already-extracted text length */
export function validateTextLength(text: string, label: string): string {
  const trimmed = text.trim();
  if (trimmed.length < RESUME_TEXT_MIN) {
    throw Errors.TEXT_TOO_SHORT(label, RESUME_TEXT_MIN);
  }
  if (trimmed.length > RESUME_TEXT_MAX) {
    throw Errors.TEXT_TOO_LONG(label, RESUME_TEXT_MAX);
  }
  return trimmed;
}
