/** Strongly-typed schema for ATS-compliant resumes */

export interface PersonalInfo {
  fullName: string;
  targetRole: string;
  email: string;
  phone?: string;
  location?: string; // City, Country
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string; // CGPA / GPA
  coursework?: string;
  description?: string;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bulletPoints: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  technologies: string;
  personalContribution?: string;
  outcomes?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface ATSResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: {
    technical: string[];
    toolsAndFrameworks: string[];
    softSkills?: string[];
  };
  certifications?: string[];
  achievements?: string[];
  leadershipAndVolunteering?: string[];
}

export interface ContextualQuestion {
  id: string;
  category: "missing_link" | "unclear_metric" | "missing_evidence" | "unelaborated_skill";
  question: string;
  reason: string;
  suggestedTargetField: string;
  placeholder: string;
  value?: string;
  isSkipped?: boolean;
}

export interface BundleOptimizationState {
  selectedPackage: "scan_only" | "bundle";
  bundleEntitlement: boolean;
  amountPaidPaise: number;
  promoEligible: boolean;
  jobDescription?: string;
  originalResumeText?: string;
  contextualQuestions?: ContextualQuestion[];
  userAnswers?: Record<string, string>;
  enhancedResume?: ATSResumeData;
  enhancedScore?: number;
  rescanReport?: Record<string, unknown>;
  rescanConsumed?: boolean;
  rescanAt?: string;
}
