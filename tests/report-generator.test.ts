import { describe, it, expect } from "vitest";
import { generateReport } from "@/lib/report-generator";
import type { ResumeAnalysis } from "@/types/analysis";

describe("Client-side PDF Report Generator", () => {
  const sampleAnalysis: ResumeAnalysis = {
    roleTitle: "Staff Software Engineer",
    matchScore: 88,
    summary: "Exceptional alignment with distributed systems and technical leadership requirements.",
    strengths: [
      "Extensive microservices architecture experience",
      "Demonstrated mentorship of 12+ engineers",
      "Deep Go and TypeScript production track record",
    ],
    requirements: [
      {
        name: "Distributed Systems (Kafka, gRPC)",
        importance: "high",
        status: "matched",
        evidence: "Designed event pipeline handling 250k req/sec with Kafka and gRPC.",
        recommendation: "Highlight fault-tolerance and failover numbers.",
      },
      {
        name: "Multi-Region Cloud Infrastructure",
        importance: "medium",
        status: "partial",
        evidence: "Deployed active-passive AWS clusters across 2 regions.",
        recommendation: "Clarify multi-region data replication latency and consensus setup.",
      },
      {
        name: "Rust / High-Performance Computing",
        importance: "low",
        status: "missing",
        evidence: "",
        recommendation: "If you have systems programming experience, detail it under skills.",
      },
    ],
    improvements: [
      {
        title: "Emphasize system scale metrics",
        explanation: "Staff roles require explicit demonstration of organizational and system scale.",
        example: "Architected distributed event bus reducing cross-datacenter latency by 35% across 4M daily active users.",
      },
    ],
    caveats: [
      "This score is an estimate based on textual comparison against stated job posting requirements.",
      "The absence of a skill in the resume text does not indicate candidate incompetence.",
    ],
  };

  it("generates a valid jsPDF document from validated analysis", () => {
    const doc = generateReport(sampleAnalysis);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("handles empty optional fields gracefully without throwing", () => {
    const minimalAnalysis: ResumeAnalysis = {
      roleTitle: "Product Designer",
      matchScore: 65,
      summary: "Good portfolio alignment.",
      strengths: [],
      requirements: [
        {
          name: "Figma & Design Systems",
          importance: "high",
          status: "matched",
          evidence: "Built component library used by 40 engineers.",
          recommendation: "Show token management.",
        },
      ],
      improvements: [],
      caveats: ["AI estimate."],
    };

    const doc = generateReport(minimalAnalysis);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("exports a HireLens themed PDF file to disk", async () => {
    const fs = await import("fs");
    const doc = generateReport(sampleAnalysis);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    fs.writeFileSync("/Users/abhirawat/Desktop/HireLens_Resume_Analysis.pdf", pdfBuffer);
    expect(fs.existsSync("/Users/abhirawat/Desktop/HireLens_Resume_Analysis.pdf")).toBe(true);
    expect(pdfBuffer.byteLength).toBeGreaterThan(1000);
  });
});
