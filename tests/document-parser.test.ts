import { describe, it, expect } from "vitest";
import { parseDocument, validateTextLength } from "@/lib/document-parser";
import { RESUME_TEXT_MIN, RESUME_TEXT_MAX, MAX_FILE_SIZE_BYTES } from "@/lib/validation";
import { AppError } from "@/lib/errors";

describe("Document Parser & Text Validator", () => {
  describe("validateTextLength", () => {
    it("accepts valid text within bounds", () => {
      const sample = "Senior Software Engineer with 8 years of React, Next.js, and cloud experience.".repeat(2);
      const validated = validateTextLength(sample, "Resume");
      expect(validated).toBe(sample.trim());
    });

    it("rejects text below minimum characters", () => {
      expect(() => validateTextLength("Too short", "Resume")).toThrow(AppError);
      try {
        validateTextLength("Too short", "Resume");
      } catch (err: any) {
        expect(err.code).toBe("TEXT_TOO_SHORT");
        expect(err.userMessage).toContain(String(RESUME_TEXT_MIN));
      }
    });

    it("rejects text exceeding maximum limit", () => {
      const hugeText = "x".repeat(RESUME_TEXT_MAX + 10);
      expect(() => validateTextLength(hugeText, "Resume")).toThrow(AppError);
      try {
        validateTextLength(hugeText, "Resume");
      } catch (err: any) {
        expect(err.code).toBe("TEXT_TOO_LONG");
      }
    });
  });

  describe("parseDocument file validation", () => {
    it("rejects oversized file buffer exceeding 5 MB", async () => {
      // Create empty buffer larger than 5 MB
      const oversized = new ArrayBuffer(MAX_FILE_SIZE_BYTES + 1024);
      await expect(
        parseDocument(oversized, "resume.pdf", "application/pdf")
      ).rejects.toThrow(AppError);
    });

    it("rejects unsupported extensions", async () => {
      const buf = new ArrayBuffer(500);
      await expect(
        parseDocument(buf, "resume.exe", "application/x-msdownload")
      ).rejects.toThrow(AppError);

      await expect(
        parseDocument(buf, "resume.png", "image/png")
      ).rejects.toThrow(AppError);
    });

    it("rejects PDF with invalid magic byte signature", async () => {
      // PDF must start with %PDF [0x25, 0x50, 0x44, 0x46]
      const fakePdf = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
      await expect(
        parseDocument(fakePdf, "resume.pdf", "application/pdf")
      ).rejects.toThrow("Invalid file signature");
    });

    it("rejects DOCX with invalid magic byte signature", async () => {
      // DOCX must start with PK [0x50, 0x4b, 0x03, 0x04]
      const fakeDocx = new Uint8Array([0x10, 0x20, 0x30, 0x40]).buffer;
      await expect(
        parseDocument(fakeDocx, "resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      ).rejects.toThrow("Invalid file signature");
    });

    it("successfully parses a real PDF document buffer", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const pdfPath = path.join(process.cwd(), "public/HireLens_Resume_Analysis.pdf");
      const buffer = fs.readFileSync(pdfPath);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

      const result = await parseDocument(arrayBuffer, "HireLens_Resume_Analysis.pdf", "application/pdf");
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(100);
      expect(result.pageCount).toBeGreaterThanOrEqual(1);
    });
  });
});
