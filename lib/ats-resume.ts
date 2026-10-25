/** Utilities for ATS-friendly resume formatting and plain-text extraction */

import type { ATSResumeData } from "@/types/resume";

export const DEFAULT_ATS_RESUME: ATSResumeData = {
  personalInfo: {
    fullName: "",
    targetRole: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    github: "",
  },
  professionalSummary: "",
  education: [],
  experience: [],
  projects: [],
  skills: {
    technical: [],
    toolsAndFrameworks: [],
    softSkills: [],
  },
  certifications: [],
  achievements: [],
  leadershipAndVolunteering: [],
};

/**
 * Converts structured ATS resume data into standard, single-column plain text.
 * Perfect for ATS parsing, plain-text submission, and feeding back to the HireLens scanner.
 */
export function atsResumeToPlainText(data: ATSResumeData): string {
  const parts: string[] = [];

  // Header / Contact Information
  const { personalInfo } = data;
  if (personalInfo.fullName) {
    parts.push(personalInfo.fullName.toUpperCase());
    if (personalInfo.targetRole) {
      parts.push(personalInfo.targetRole);
    }

    const contactLine: string[] = [];
    if (personalInfo.email) contactLine.push(personalInfo.email);
    if (personalInfo.phone) contactLine.push(personalInfo.phone);
    if (personalInfo.location) contactLine.push(personalInfo.location);
    if (contactLine.length > 0) parts.push(contactLine.join(" | "));

    const linksLine: string[] = [];
    if (personalInfo.linkedin) linksLine.push(`LinkedIn: ${personalInfo.linkedin}`);
    if (personalInfo.github) linksLine.push(`GitHub: ${personalInfo.github}`);
    if (personalInfo.portfolio) linksLine.push(`Portfolio: ${personalInfo.portfolio}`);
    if (linksLine.length > 0) parts.push(linksLine.join(" | "));

    parts.push(""); // blank line
  }

  // Professional Summary
  if (data.professionalSummary && data.professionalSummary.trim()) {
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(data.professionalSummary.trim());
    parts.push("");
  }

  // Work Experience
  if (data.experience && data.experience.length > 0) {
    parts.push("WORK EXPERIENCE");
    data.experience.forEach((exp) => {
      const dates = `${exp.startDate || ""} - ${exp.isCurrent ? "Present" : exp.endDate || ""}`.trim();
      parts.push(`${exp.role || "Role"} | ${exp.organization || "Company"} | ${dates}`);
      if (exp.bulletPoints && exp.bulletPoints.length > 0) {
        exp.bulletPoints.forEach((bp) => {
          if (bp.trim()) parts.push(`• ${bp.trim()}`);
        });
      }
      parts.push("");
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    parts.push("PROJECTS");
    data.projects.forEach((proj) => {
      const tech = proj.technologies ? ` (${proj.technologies})` : "";
      const urls = [proj.projectUrl, proj.githubUrl].filter(Boolean).join(" | ");
      parts.push(`${proj.title}${tech}${urls ? ` - ${urls}` : ""}`);
      if (proj.description) parts.push(`• ${proj.description.trim()}`);
      if (proj.personalContribution) parts.push(`• Contribution: ${proj.personalContribution.trim()}`);
      if (proj.outcomes) parts.push(`• Outcomes: ${proj.outcomes.trim()}`);
      parts.push("");
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    parts.push("EDUCATION");
    data.education.forEach((edu) => {
      const dates = `${edu.startDate || ""} - ${edu.endDate || ""}`.trim();
      const degField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
      parts.push(`${degField || "Degree"} | ${edu.institution || "Institution"} | ${dates}`);
      if (edu.grade) parts.push(`• Grade / CGPA: ${edu.grade}`);
      if (edu.coursework) parts.push(`• Relevant Coursework: ${edu.coursework}`);
      if (edu.description) parts.push(`• ${edu.description}`);
      parts.push("");
    });
  }

  // Skills
  const hasSkills =
    (data.skills?.technical && data.skills.technical.length > 0) ||
    (data.skills?.toolsAndFrameworks && data.skills.toolsAndFrameworks.length > 0) ||
    (data.skills?.softSkills && data.skills.softSkills.length > 0);

  if (hasSkills) {
    parts.push("SKILLS");
    if (data.skills.technical && data.skills.technical.length > 0) {
      parts.push(`• Technical Skills: ${data.skills.technical.join(", ")}`);
    }
    if (data.skills.toolsAndFrameworks && data.skills.toolsAndFrameworks.length > 0) {
      parts.push(`• Tools & Frameworks: ${data.skills.toolsAndFrameworks.join(", ")}`);
    }
    if (data.skills.softSkills && data.skills.softSkills.length > 0) {
      parts.push(`• Core Competencies: ${data.skills.softSkills.join(", ")}`);
    }
    parts.push("");
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    parts.push("CERTIFICATIONS");
    data.certifications.forEach((cert) => parts.push(`• ${cert}`));
    parts.push("");
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    parts.push("KEY ACHIEVEMENTS");
    data.achievements.forEach((ach) => parts.push(`• ${ach}`));
    parts.push("");
  }

  // Leadership & Volunteering
  if (data.leadershipAndVolunteering && data.leadershipAndVolunteering.length > 0) {
    parts.push("LEADERSHIP & INITIATIVES");
    data.leadershipAndVolunteering.forEach((lead) => parts.push(`• ${lead}`));
    parts.push("");
  }

  return parts.join("\n").trim();
}

/** Computes completeness score (0-100) and missing key fields */
export function computeResumeCompleteness(data: ATSResumeData): {
  score: number;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  if (data.personalInfo.fullName && data.personalInfo.email) {
    score += 20;
  } else {
    suggestions.push("Add your full name and contact email");
  }

  if (data.personalInfo.targetRole) {
    score += 10;
  } else {
    suggestions.push("Specify your target job role");
  }

  if (data.professionalSummary && data.professionalSummary.length > 60) {
    score += 15;
  } else {
    suggestions.push("Write a 2-3 sentence professional summary");
  }

  if (data.experience && data.experience.length > 0) {
    score += 25;
  } else {
    suggestions.push("Add at least one work experience or internship");
  }

  if (data.education && data.education.length > 0) {
    score += 15;
  } else {
    suggestions.push("Add your degree or education details");
  }

  const skillsCount =
    (data.skills?.technical?.length || 0) + (data.skills?.toolsAndFrameworks?.length || 0);
  if (skillsCount >= 4) {
    score += 15;
  } else {
    suggestions.push("List at least 4 key technical skills or tools");
  }

  return {
    score: Math.min(100, score),
    suggestions,
  };
}
