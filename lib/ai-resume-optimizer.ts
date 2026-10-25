/**
 * Server-only AI Resume Optimization and Writing Assistant
 * Strict ground rules:
 * - Never hallucinate or invent employers, titles, degrees, unconfirmed skills, or fake metrics.
 * - Only optimize phrasing, structure, alignment, and incorporate user-confirmed evidence.
 */

import { generateLLMCompletion } from "./llm-client";
import type { ResumeAnalysis } from "@/types/analysis";
import type { ATSResumeData, ContextualQuestion } from "@/types/resume";

export async function generateContextualQuestions(
  resumeText: string,
  jobDescription: string,
  analysis: ResumeAnalysis
): Promise<ContextualQuestion[]> {
  const missingOrPartialReqs = analysis.requirements
    .filter((r) => r.status === "missing" || r.status === "partial")
    .slice(0, 5);

  const systemPrompt = `You are HireLens' senior technical resume coach.
Your job is to inspect an initial resume analysis against a job description, and generate 3 to 5 clear, friendly follow-up questions to uncover real, existing candidate experience that might have been omitted or under-explained in their resume.

## RULES
1. NEVER tell the candidate to lie or invent skills.
2. Ask about genuine projects, specific technologies from the JD they might have used, quantifiable outcomes (e.g. users served, latency improved, team size), or missing profile links (GitHub, LinkedIn, Portfolio).
3. Every question must include:
   - id: unique string
   - category: "missing_link" | "unclear_metric" | "missing_evidence" | "unelaborated_skill"
   - question: direct, polite question
   - reason: 1 sentence explaining why this helps their match for this specific role
   - suggestedTargetField: which section of resume this belongs to ("experience" | "projects" | "skills" | "personalInfo")
   - placeholder: practical example of how they can answer
4. Respond ONLY with a valid JSON array of question objects. No markdown fences.`;

  const userPrompt = `Job Title: ${analysis.roleTitle}
Gaps Identified in Initial Scan:
${JSON.stringify(missingOrPartialReqs, null, 2)}

Original Resume Snippet:
${resumeText.slice(0, 5000)}

Generate 3-5 specific, actionable questions for this candidate.`;

  try {
    const raw = await generateLLMCompletion({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.2,
    });

    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || [];
    return questionsArray.slice(0, 5);
  } catch (err) {
    console.error("[Contextual Questions] Error:", err);
    // Fallback sensible questions if LLM fails
    return [
      {
        id: "q_metrics",
        category: "unclear_metric",
        question: "Can you share any measurable results or metrics from your key projects (e.g., performance gains, users served, or scale)?",
        reason: "Recruiters look for quantifiable impact to verify senior-level contribution.",
        suggestedTargetField: "experience",
        placeholder: "e.g., Improved API response time by 35% and scaled service to 50k DAU.",
      },
      {
        id: "q_links",
        category: "missing_link",
        question: "Do you have a public GitHub, LinkedIn, or personal portfolio URL you'd like included?",
        reason: "Direct evidence links significantly boost reviewer confidence.",
        suggestedTargetField: "personalInfo",
        placeholder: "e.g., github.com/yourhandle or linkedin.com/in/yourprofile",
      },
      {
        id: "q_skills",
        category: "missing_evidence",
        question: `For the requirement "${missingOrPartialReqs[0]?.name || "Core JD Skills"}", have you used this in any capacity?`,
        reason: "Clarifying whether you have used this skill allows us to position it accurately.",
        suggestedTargetField: "skills",
        placeholder: "e.g., Used in internal tooling for 6 months; comfortable with fundamental patterns.",
      },
    ];
  }
}

export async function generateEnhancedATSResume(
  originalResumeText: string,
  jobDescription: string,
  analysis: ResumeAnalysis,
  userConfirmedAnswers: Record<string, string>
): Promise<ATSResumeData> {
  const systemPrompt = `You are HireLens' master ATS resume optimizer.
Your objective is to re-architect the candidate's resume into a single-column, strictly ATS-compliant format that accurately highlights their real alignment with the job description.

## CRITICAL ETHICAL RULES
1. ONLY use information explicitly stated in the original resume OR confirmed in the user's answers.
2. NEVER invent companies, degrees, dates, job titles, or unstated technologies.
3. If an answer was skipped or left empty, DO NOT manufacture details for it.
4. Strengthen action verbs, quantify impact where confirmed, and organize sections conventionally.
5. Produce a strictly valid JSON object matching the ATSResumeData schema:
{
  "personalInfo": {
    "fullName": string,
    "targetRole": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "portfolio": string,
    "github": string
  },
  "professionalSummary": string,
  "education": [
    {
      "id": string,
      "institution": string,
      "degree": string,
      "fieldOfStudy": string,
      "startDate": string,
      "endDate": string,
      "grade": string,
      "coursework": string,
      "description": string
    }
  ],
  "experience": [
    {
      "id": string,
      "organization": string,
      "role": string,
      "startDate": string,
      "endDate": string,
      "isCurrent": boolean,
      "bulletPoints": string[]
    }
  ],
  "projects": [
    {
      "id": string,
      "title": string,
      "description": string,
      "technologies": string,
      "personalContribution": string,
      "outcomes": string,
      "projectUrl": string,
      "githubUrl": string
    }
  ],
  "skills": {
    "technical": string[],
    "toolsAndFrameworks": string[],
    "softSkills": string[]
  },
  "certifications": string[],
  "achievements": string[],
  "leadershipAndVolunteering": string[]
}
Respond ONLY with raw JSON, no markdown formatting.`;

  const userPrompt = `Target Role / Job Description:
${jobDescription.slice(0, 6000)}

Original Resume:
${originalResumeText.slice(0, 15000)}

Candidate's Confirmed Answers to Follow-up Questions:
${JSON.stringify(userConfirmedAnswers, null, 2)}

Initial Match Score: ${analysis.matchScore}%
Strengths: ${analysis.strengths.join(", ")}

Generate the enhanced ATSResumeData JSON now.`;

  const raw = await generateLLMCompletion({
    systemPrompt,
    userPrompt,
    jsonMode: true,
    temperature: 0.2,
  });

  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as ATSResumeData;
  return parsed;
}

export async function aiAssistResumeWriter(params: {
  action: "summary" | "bullet_point" | "project_rewrite" | "grammar_clarity";
  currentText: string;
  targetRole?: string;
  context?: string;
}): Promise<string> {
  const { action, currentText, targetRole, context } = params;

  const systemPrompt = `You are HireLens' AI Resume Writing Assistant.
Help the candidate refine their resume text.

RULES:
1. Preserve the candidate's authentic experience. NEVER invent new companies, degrees, unconfirmed skills, or fabricated numbers.
2. If improving bullet points, use strong action verbs (e.g., "Architected", "Engineered", "Optimized", "Spearheaded") and XYZ format (Accomplished [X] as measured by [Y], by doing [Z]).
3. Keep phrasing concise, professional, and ATS-friendly.
4. Return ONLY the improved replacement text. No conversational greeting, no quotes, no markdown fences.`;

  let userPrompt = ``;
  if (action === "summary") {
    userPrompt = `Draft or refine a compelling 2-3 sentence professional summary for a ${targetRole || "Software Professional"}.
Current text / notes: "${currentText}"
Additional context: ${context || "None provided"}`;
  } else if (action === "bullet_point") {
    userPrompt = `Improve this experience bullet point for maximum impact, conciseness, and strong action verbs:
"${currentText}"
Role context: ${targetRole || "Professional"}`;
  } else if (action === "project_rewrite") {
    userPrompt = `Refine this project description to clearly highlight problem, technical stack, personal contribution, and outcome:
"${currentText}"`;
  } else {
    userPrompt = `Correct grammar, enhance clarity, and tighten phrasing for this resume snippet:
"${currentText}"`;
  }

  return generateLLMCompletion({
    systemPrompt,
    userPrompt,
    jsonMode: false,
    temperature: 0.3,
  });
}
