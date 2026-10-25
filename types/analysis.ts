/** Structured AI analysis output */
export type RequirementImportance = "high" | "medium" | "low";
export type RequirementStatus = "matched" | "partial" | "missing";

export interface Requirement {
  name: string;
  importance: RequirementImportance;
  status: RequirementStatus;
  evidence: string;
  recommendation: string;
}

export interface Improvement {
  title: string;
  explanation: string;
  example: string;
}

export interface ResumeAnalysis {
  roleTitle: string;
  matchScore: number; // 0-100 integer
  summary: string;
  strengths: string[];
  requirements: Requirement[];
  improvements: Improvement[];
  caveats: string[];
}
