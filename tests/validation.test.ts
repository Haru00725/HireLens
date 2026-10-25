import { describe, it, expect } from "vitest";
import {
  draftInputSchema,
  scanIdSchema,
  analysisSchema,
  RESUME_TEXT_MIN,
  RESUME_TEXT_MAX,
  JOB_DESC_MIN,
  JOB_DESC_MAX,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("draftInputSchema", () => {
    it("accepts valid resume text and job description", () => {
      const valid = {
        resumeText: "Experienced Software Engineer with 5 years in TypeScript, React, Next.js, and Node.js backend systems.".repeat(2),
        jobDescription: "Looking for a Senior Frontend Engineer with React, TypeScript, and TailwindCSS experience.".repeat(2),
      };
      const res = draftInputSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects resume text below minimum threshold", () => {
      const invalid = {
        resumeText: "Too short",
        jobDescription: "Valid job description with enough length to meet the requirement limit.".repeat(2),
      };
      const res = draftInputSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain(String(RESUME_TEXT_MIN));
      }
    });

    it("rejects job description below minimum threshold", () => {
      const invalid = {
        resumeText: "Valid resume text with enough characters to pass the initial validation check easily.".repeat(2),
        jobDescription: "Short JD",
      };
      const res = draftInputSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain(String(JOB_DESC_MIN));
      }
    });

    it("rejects excessively long inputs", () => {
      const oversizedResume = {
        resumeText: "a".repeat(RESUME_TEXT_MAX + 1),
        jobDescription: "Valid job description.".repeat(5),
      };
      expect(draftInputSchema.safeParse(oversizedResume).success).toBe(false);

      const oversizedJd = {
        resumeText: "Valid resume text.".repeat(10),
        jobDescription: "a".repeat(JOB_DESC_MAX + 1),
      };
      expect(draftInputSchema.safeParse(oversizedJd).success).toBe(false);
    });
  });

  describe("scanIdSchema", () => {
    it("accepts valid UUIDs", () => {
      expect(scanIdSchema.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toBe(true);
    });

    it("rejects non-UUID strings and path traversal attempts", () => {
      expect(scanIdSchema.safeParse("not-a-uuid").success).toBe(false);
      expect(scanIdSchema.safeParse("../../../etc/passwd").success).toBe(false);
      expect(scanIdSchema.safeParse("123").success).toBe(false);
    });
  });

  describe("analysisSchema (AI output validation)", () => {
    const validSample = {
      roleTitle: "Senior Frontend Engineer",
      matchScore: 82,
      summary: "Strong match on React and TypeScript architecture, with slight gap on AWS infrastructure.",
      strengths: ["5+ years React and Next.js", "Clean component architecture", "State management expertise"],
      requirements: [
        {
          name: "React & Next.js",
          importance: "high" as const,
          status: "matched" as const,
          evidence: "5 years building production apps with Next.js App Router.",
          recommendation: "Highlight recent Next.js 15 projects prominently.",
        },
        {
          name: "GraphQL & Apollo",
          importance: "medium" as const,
          status: "partial" as const,
          evidence: "Used GraphQL client in one contract role.",
          recommendation: "Detail specific schema design or cache tuning experience.",
        },
        {
          name: "Kubernetes & CI/CD",
          importance: "low" as const,
          status: "missing" as const,
          evidence: "",
          recommendation: "If you have container deployment experience, add a bullet in your DevOps section.",
        },
      ],
      improvements: [
        {
          title: "Quantify Core Web Vitals achievements",
          explanation: "The job posting emphasizes page speed and conversion impact.",
          example: "Optimized LCP by 42% (2.4s to 1.4s) across checkout funnel, lifting conversion by 4.1%.",
        },
      ],
      caveats: [
        "Score is calculated from text presence, not an infallible measure of hands-on ability.",
        "Missing requirements indicate absence of text evidence, not necessarily lack of skill.",
      ],
    };

    it("validates a well-formed Gemini analysis object", () => {
      const res = analysisSchema.safeParse(validSample);
      expect(res.success).toBe(true);
    });

    it("rejects scores outside 0-100 boundary", () => {
      const negativeScore = { ...validSample, matchScore: -5 };
      expect(analysisSchema.safeParse(negativeScore).success).toBe(false);

      const overScore = { ...validSample, matchScore: 105 };
      expect(analysisSchema.safeParse(overScore).success).toBe(false);
    });

    it("rejects invalid requirement status values", () => {
      const badStatus = {
        ...validSample,
        requirements: [
          {
            name: "React",
            importance: "high",
            status: "unknown_status",
            evidence: "some",
            recommendation: "some",
          },
        ],
      };
      expect(analysisSchema.safeParse(badStatus).success).toBe(false);
    });

    it("rejects invalid importance values", () => {
      const badImportance = {
        ...validSample,
        requirements: [
          {
            name: "React",
            importance: "critical", // valid are high, medium, low
            status: "matched",
            evidence: "some",
            recommendation: "some",
          },
        ],
      };
      expect(analysisSchema.safeParse(badImportance).success).toBe(false);
    });
  });
});
