if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env");
  } catch {
    // ignore if missing in CI
  }
}

import { describe, it, expect } from "vitest";
import { analyzeResumeWithGroq } from "@/lib/groq";

describe("Groq LLM Resume Analysis Integration", () => {
  it("successfully analyzes a resume against a job description using Groq", async () => {
    const sampleResume = `
      John Doe
      Full Stack Software Engineer
      San Francisco, CA | john@example.com

      Summary:
      Results-driven Software Engineer with 5 years of experience building scalable web applications using Next.js, React, TypeScript, and Node.js. Experienced in PostgreSQL and cloud platforms (AWS, GCP).

      Experience:
      Senior Frontend Developer | TechCorp (2022 - Present)
      - Spearheaded migration of legacy React dashboard to Next.js 14 App Router, improving LCP by 45%.
      - Architected reusable design system components used by 12 internal product teams.
      - Mentored 4 junior engineers and implemented automated CI/CD testing pipelines.

      Software Engineer | StartupLabs (2020 - 2022)
      - Built REST and GraphQL APIs using Node.js, Express, and PostgreSQL handling 2M requests/day.
      - Integrated Stripe and Razorpay payment flows with webhooks and signature verification.

      Skills:
      Languages & Frameworks: TypeScript, JavaScript, React, Next.js, Node.js, Python, TailwindCSS
      Databases: PostgreSQL, Redis, Supabase
      DevOps & Tools: Docker, Git, CI/CD, Jest, Vitest
    `;

    const sampleJD = `
      Position: Senior Full-Stack Engineer
      Company: ScaleUp Inc.

      Requirements:
      - 4+ years of professional full-stack development experience
      - Deep expertise in Next.js, React, and TypeScript
      - Strong backend capabilities in Node.js and SQL databases (PostgreSQL)
      - Experience with payment processing integrations (Stripe, Razorpay, or similar)
      - Familiarity with Kubernetes and microservices (nice-to-have)
    `;

    const result = await analyzeResumeWithGroq(sampleResume, sampleJD);

    expect(result).toBeDefined();
    expect(result.roleTitle).toBeTruthy();
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.summary).toBeTruthy();
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.requirements.length).toBeGreaterThan(0);
    expect(result.improvements.length).toBeGreaterThan(0);
    console.log("Groq result score:", result.matchScore);
    console.log("Groq role:", result.roleTitle);
    console.log("Groq requirements count:", result.requirements.length);
  }, 30000);
});
