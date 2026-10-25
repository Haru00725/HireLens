/**
 * ATS-Friendly Resume PDF Generator
 * Generates single-column, strictly accessible vector PDF resumes with selectable text.
 * No tables, no columns, no avatars, no icons, no graphical skill bars.
 */

import { jsPDF } from "jspdf";
import type { ATSResumeData } from "@/types/resume";

export function generateATSResumePDF(data: ATSResumeData): jsPDF {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18; // ~0.7 inch margins
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 18;

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = margin;
    }
  };

  const addSectionHeader = (title: string) => {
    checkPageBreak(12);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;

    // Standard conventional thin underline
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  };

  // 1. Personal / Contact Info Header
  const { personalInfo } = data;
  if (personalInfo.fullName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17, 19, 24);
    doc.text(personalInfo.fullName.toUpperCase(), margin, y);
    y += 6;

    if (personalInfo.targetRole) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(personalInfo.targetRole, margin, y);
      y += 5;
    }

    // Contact line
    const contacts: string[] = [];
    if (personalInfo.email) contacts.push(personalInfo.email);
    if (personalInfo.phone) contacts.push(personalInfo.phone);
    if (personalInfo.location) contacts.push(personalInfo.location);

    if (contacts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text(contacts.join("   •   "), margin, y);
      y += 4.5;
    }

    // Links line
    const links: string[] = [];
    if (personalInfo.linkedin) links.push(`LinkedIn: ${personalInfo.linkedin}`);
    if (personalInfo.github) links.push(`GitHub: ${personalInfo.github}`);
    if (personalInfo.portfolio) links.push(`Portfolio: ${personalInfo.portfolio}`);

    if (links.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      const linkText = links.join("   •   ");
      const wrappedLinks = doc.splitTextToSize(linkText, contentWidth);
      doc.text(wrappedLinks, margin, y);
      y += wrappedLinks.length * 4.5;
    }

    y += 3;
  }

  // 2. Professional Summary
  if (data.professionalSummary && data.professionalSummary.trim()) {
    addSectionHeader("Professional Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(35, 35, 35);
    const summaryLines = doc.splitTextToSize(data.professionalSummary.trim(), contentWidth);
    checkPageBreak(summaryLines.length * 4.5);
    doc.text(summaryLines, margin, y, { lineHeightFactor: 1.3 });
    y += summaryLines.length * 4.8 + 2;
  }

  // 3. Work Experience
  if (data.experience && data.experience.length > 0) {
    addSectionHeader("Work Experience");

    data.experience.forEach((exp) => {
      checkPageBreak(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);

      const titleLine = `${exp.role || "Role"} — ${exp.organization || "Company"}`;
      const dateLine = `${exp.startDate || ""} - ${exp.isCurrent ? "Present" : exp.endDate || ""}`.trim();

      doc.text(titleLine, margin, y);

      if (dateLine) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(dateLine, margin + contentWidth, y, { align: "right" });
      }
      y += 4.8;

      if (exp.bulletPoints && exp.bulletPoints.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);

        exp.bulletPoints.forEach((bp) => {
          if (!bp.trim()) return;
          const bulletIndent = 4;
          const textWidth = contentWidth - bulletIndent;
          const wrapped = doc.splitTextToSize(bp.trim(), textWidth);

          checkPageBreak(wrapped.length * 4.2 + 2);
          doc.text("•", margin, y);
          doc.text(wrapped, margin + bulletIndent, y, { lineHeightFactor: 1.25 });
          y += wrapped.length * 4.2 + 1.2;
        });
      }
      y += 2.5;
    });
  }

  // 4. Projects
  if (data.projects && data.projects.length > 0) {
    addSectionHeader("Projects");

    data.projects.forEach((proj) => {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);

      doc.text(proj.title, margin, y);

      const urls = [proj.projectUrl, proj.githubUrl].filter(Boolean).join(" | ");
      if (urls) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        doc.text(urls, margin + contentWidth, y, { align: "right" });
      }
      y += 4.5;

      if (proj.technologies) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(`Technologies: ${proj.technologies}`, margin, y);
        y += 4.2;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      const items: string[] = [];
      if (proj.description) items.push(proj.description.trim());
      if (proj.personalContribution) items.push(`Contribution: ${proj.personalContribution.trim()}`);
      if (proj.outcomes) items.push(`Impact: ${proj.outcomes.trim()}`);

      items.forEach((item) => {
        const bulletIndent = 4;
        const textWidth = contentWidth - bulletIndent;
        const wrapped = doc.splitTextToSize(item, textWidth);

        checkPageBreak(wrapped.length * 4.2 + 1.5);
        doc.text("•", margin, y);
        doc.text(wrapped, margin + bulletIndent, y, { lineHeightFactor: 1.25 });
        y += wrapped.length * 4.2 + 1.2;
      });

      y += 2.5;
    });
  }

  // 5. Education
  if (data.education && data.education.length > 0) {
    addSectionHeader("Education");

    data.education.forEach((edu) => {
      checkPageBreak(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);

      const degField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
      doc.text(degField || "Degree", margin, y);

      const dates = `${edu.startDate || ""} - ${edu.endDate || ""}`.trim();
      if (dates) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(dates, margin + contentWidth, y, { align: "right" });
      }
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      let subLine = edu.institution || "";
      if (edu.grade) subLine += `  |  Grade: ${edu.grade}`;
      doc.text(subLine, margin, y);
      y += 4.5;

      if (edu.coursework) {
        doc.setFontSize(8.5);
        const wrapped = doc.splitTextToSize(`Coursework: ${edu.coursework}`, contentWidth);
        checkPageBreak(wrapped.length * 4.2);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 4.2;
      }
      y += 2.5;
    });
  }

  // 6. Skills
  const hasSkills =
    (data.skills?.technical && data.skills.technical.length > 0) ||
    (data.skills?.toolsAndFrameworks && data.skills.toolsAndFrameworks.length > 0) ||
    (data.skills?.softSkills && data.skills.softSkills.length > 0);

  if (hasSkills) {
    addSectionHeader("Skills & Competencies");
    doc.setFontSize(9);

    if (data.skills.technical && data.skills.technical.length > 0) {
      checkPageBreak(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text("Technical Skills: ", margin, y);
      const labelW = doc.getTextWidth("Technical Skills: ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const wrapped = doc.splitTextToSize(data.skills.technical.join(", "), contentWidth - labelW);
      doc.text(wrapped, margin + labelW, y);
      y += wrapped.length * 4.5 + 1.5;
    }

    if (data.skills.toolsAndFrameworks && data.skills.toolsAndFrameworks.length > 0) {
      checkPageBreak(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text("Tools & Frameworks: ", margin, y);
      const labelW = doc.getTextWidth("Tools & Frameworks: ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const wrapped = doc.splitTextToSize(data.skills.toolsAndFrameworks.join(", "), contentWidth - labelW);
      doc.text(wrapped, margin + labelW, y);
      y += wrapped.length * 4.5 + 1.5;
    }

    if (data.skills.softSkills && data.skills.softSkills.length > 0) {
      checkPageBreak(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text("Core Competencies: ", margin, y);
      const labelW = doc.getTextWidth("Core Competencies: ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const wrapped = doc.splitTextToSize(data.skills.softSkills.join(", "), contentWidth - labelW);
      doc.text(wrapped, margin + labelW, y);
      y += wrapped.length * 4.5 + 1.5;
    }
  }

  // 7. Certifications & Achievements
  if (data.certifications && data.certifications.length > 0) {
    addSectionHeader("Certifications");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);

    data.certifications.forEach((c) => {
      checkPageBreak(6);
      const wrapped = doc.splitTextToSize(c, contentWidth - 4);
      doc.text("•", margin, y);
      doc.text(wrapped, margin + 4, y);
      y += wrapped.length * 4.2 + 1;
    });
    y += 2;
  }

  if (data.achievements && data.achievements.length > 0) {
    addSectionHeader("Key Achievements");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);

    data.achievements.forEach((a) => {
      checkPageBreak(6);
      const wrapped = doc.splitTextToSize(a, contentWidth - 4);
      doc.text("•", margin, y);
      doc.text(wrapped, margin + 4, y);
      y += wrapped.length * 4.2 + 1;
    });
    y += 2;
  }

  return doc;
}

export function downloadATSResumePDF(data: ATSResumeData, filename?: string): void {
  const doc = generateATSResumePDF(data);
  const safeName = (data.personalInfo.fullName || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
  const finalName = filename || `${safeName}_ATS_Resume.pdf`;

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
