/** PDF report generator — client-side HireLens themed vector export */

import { jsPDF } from "jspdf";
import type { ResumeAnalysis } from "@/types/analysis";

// HireLens Design System Tokens
const COLORS = {
  ink: [17, 19, 24] as [number, number, number], // #111318
  paper: [247, 247, 240] as [number, number, number], // #F7F7F0
  cardBg: [255, 255, 255] as [number, number, number], // #FFFFFF
  cardBorder: [220, 221, 211] as [number, number, number], // #DCDDD3
  cardBorderSubtle: [235, 236, 230] as [number, number, number],
  lime: [200, 241, 105] as [number, number, number], // #C8F169
  limeLight: [238, 250, 210] as [number, number, number],
  muted: [119, 122, 114] as [number, number, number], // #777A72
  mutedDark: [70, 73, 67] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  
  // Requirement status colors
  matchedBg: [200, 241, 105] as [number, number, number], // #C8F169
  matchedText: [17, 19, 24] as [number, number, number],
  partialBg: [254, 243, 199] as [number, number, number], // #FEF3C7 amber-100
  partialText: [146, 64, 14] as [number, number, number], // #92400E amber-800
  missingBg: [254, 226, 226] as [number, number, number], // #FEE2E2 rose-100
  missingText: [153, 27, 27] as [number, number, number], // #991B1B rose-800
  
  // Callout & quote
  quoteBg: [243, 243, 237] as [number, number, number],
  exampleBg: [245, 247, 240] as [number, number, number],
};

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN; // 178 mm
const LINE_HEIGHT = 5.2;

export function generateReport(analysis: ResumeAnalysis): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  // Background tint for HireLens paper aesthetic
  function paintPaperBackground() {
    doc.setFillColor(...COLORS.paper);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  }

  // Paint first page background
  paintPaperBackground();

  function checkPage(needed: number = 22) {
    if (y + needed > 275) {
      addFooter();
      doc.addPage();
      paintPaperBackground();
      addRunningHeader();
      y = 24;
    }
  }

  function addRunningHeader() {
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    const titleSnippet = (analysis.roleTitle || "Target Role").slice(0, 50);
    doc.text(`HireLens Report  •  ${titleSnippet}`, MARGIN, 12);
    doc.text("CONFIDENTIAL CANDIDATE EVALUATION", PAGE_WIDTH - MARGIN, 12, { align: "right" });

    doc.setDrawColor(...COLORS.cardBorder);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, 15, PAGE_WIDTH - MARGIN, 15);
  }

  function addFooter() {
    const page = doc.getNumberOfPages();
    doc.setDrawColor(...COLORS.cardBorder);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, 285, PAGE_WIDTH - MARGIN, 285);

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text("HireLens Advanced LLMs  •  Calibrated Against Stated Job Requirements", MARGIN, 290);
    doc.text(`Page ${page}`, PAGE_WIDTH - MARGIN, 290, { align: "right" });
  }

  function sectionPill(title: string) {
    checkPage(16);
    y += 4;
    
    // Accent tag
    doc.setFillColor(...COLORS.ink);
    doc.roundedRect(MARGIN, y - 4, 3.5, 9, 0.8, 0.8, "F");

    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.ink);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), MARGIN + 7, y + 2.5);
    y += 8;
  }

  // ══════════════════════════════════════════════════════
  // 1. PAGE 1 BRANDED HEADER
  // ══════════════════════════════════════════════════════
  doc.setFillColor(...COLORS.ink);
  doc.rect(0, 0, PAGE_WIDTH, 46, "F");

  // Logo mark: lime pill
  doc.setFillColor(...COLORS.lime);
  doc.roundedRect(MARGIN, 13, 6, 6, 1.2, 1.2, "F");

  // "HireLens" logo text
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("HireLens", MARGIN + 9, 18.5);

  // Badge: "AI AUDIT REPORT"
  doc.setFillColor(35, 38, 46);
  doc.roundedRect(MARGIN + 46, 13, 30, 6, 1, 1, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.lime);
  doc.setFont("helvetica", "bold");
  doc.text("VERIFIED SCAN", MARGIN + 49, 17.2);

  // Subtitle
  doc.setFontSize(8.5);
  doc.setTextColor(215, 218, 225);
  doc.setFont("helvetica", "normal");
  doc.text("Objective candidate match analysis calibrated against explicit job requirements.", MARGIN, 28);

  // Metadata row
  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  doc.setFontSize(7.5);
  doc.setTextColor(170, 173, 180);
  doc.text(`AUDIT DATE: ${todayStr.toUpperCase()}   •   FORMAT: A4 EXECUTIVE REPORT   •   CONFIDENTIAL`, MARGIN, 36);

  y = 54;

  // ══════════════════════════════════════════════════════
  // 2. HERO SCORE & ROLE CARD
  // ══════════════════════════════════════════════════════
  const heroCardHeight = 44;
  doc.setFillColor(...COLORS.cardBg);
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, heroCardHeight, 2, 2, "FD");

  // Role title
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  const roleLines = doc.splitTextToSize(analysis.roleTitle || "Target Role Analysis", CONTENT_WIDTH - 58);
  doc.text(roleLines.slice(0, 2), MARGIN + 6, y + 10);

  // Subtitle under role
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Target Job Requirement Evaluation & ATS Alignment Score", MARGIN + 6, y + 20);

  // Key stats row under role
  const matchedCount = (analysis.requirements || []).filter((r) => r.status === "matched").length;
  const partialCount = (analysis.requirements || []).filter((r) => r.status === "partial").length;
  const missingCount = (analysis.requirements || []).filter((r) => r.status === "missing").length;

  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.text(`${matchedCount} Matched`, MARGIN + 6, y + 33);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.text("•", MARGIN + 26, y + 33);
  doc.setTextColor(146, 64, 14);
  doc.setFont("helvetica", "bold");
  doc.text(`${partialCount} Partial`, MARGIN + 31, y + 33);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.text("•", MARGIN + 51, y + 33);
  doc.setTextColor(153, 27, 27);
  doc.setFont("helvetica", "bold");
  doc.text(`${missingCount} Not Shown`, MARGIN + 56, y + 33);

  // Score Box (Right side of hero card)
  const scoreBoxX = PAGE_WIDTH - MARGIN - 46;
  const scoreBoxY = y + 5;
  const scoreBoxW = 40;
  const scoreBoxH = 34;

  doc.setFillColor(...COLORS.lime);
  doc.setDrawColor(...COLORS.ink);
  doc.setLineWidth(0.4);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 2, 2, "FD");

  // Score number
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  const scoreStr = `${analysis.matchScore}`;
  doc.text(scoreStr, scoreBoxX + 6, scoreBoxY + 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("/ 100", scoreBoxX + 22, scoreBoxY + 16);

  // Rating pill inside score box
  let ratingText = "MODERATE MATCH";
  let ratingBg = [254, 243, 199] as [number, number, number];
  let ratingFg = [146, 64, 14] as [number, number, number];
  if (analysis.matchScore >= 80) {
    ratingText = "HIGH ALIGNMENT";
    ratingBg = [209, 250, 229];
    ratingFg = [6, 95, 70];
  } else if (analysis.matchScore < 60) {
    ratingText = "SIGNIFICANT GAPS";
    ratingBg = [254, 226, 226];
    ratingFg = [153, 27, 27];
  }

  doc.setFillColor(...ratingBg);
  doc.roundedRect(scoreBoxX + 4, scoreBoxY + 22, scoreBoxW - 8, 7, 1, 1, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(...ratingFg);
  doc.setFont("helvetica", "bold");
  doc.text(ratingText, scoreBoxX + scoreBoxW / 2, scoreBoxY + 26.8, { align: "center" });

  y += heroCardHeight + 6;

  // ══════════════════════════════════════════════════════
  // 3. EXECUTIVE ASSESSMENT SUMMARY
  // ══════════════════════════════════════════════════════
  sectionPill("Executive Recruiter Assessment");

  const summaryLines = doc.splitTextToSize(analysis.summary || "No summary provided.", CONTENT_WIDTH - 12);
  const summaryBoxH = Math.max(18, summaryLines.length * LINE_HEIGHT + 10);
  checkPage(summaryBoxH + 4);

  doc.setFillColor(...COLORS.cardBg);
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, summaryBoxH, 1.5, 1.5, "FD");

  // Accent bar on left
  doc.setFillColor(...COLORS.lime);
  doc.rect(MARGIN, y, 2.5, summaryBoxH, "F");

  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "normal");
  let lineY = y + 7;
  for (const line of summaryLines) {
    doc.text(line, MARGIN + 7, lineY);
    lineY += LINE_HEIGHT;
  }
  y += summaryBoxH + 6;

  // ══════════════════════════════════════════════════════
  // 4. IDENTIFIED STRENGTHS
  // ══════════════════════════════════════════════════════
  if (analysis.strengths && analysis.strengths.length > 0) {
    sectionPill("Key Candidate Strengths");

    for (const strength of analysis.strengths) {
      const sLines = doc.splitTextToSize(strength, CONTENT_WIDTH - 18);
      const rowH = Math.max(9, sLines.length * 4.8 + 5);
      checkPage(rowH + 2);

      doc.setFillColor(...COLORS.cardBg);
      doc.setDrawColor(...COLORS.cardBorderSubtle);
      doc.setLineWidth(0.2);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, rowH, 1.2, 1.2, "FD");

      // Lime checkmark tag
      doc.setFillColor(...COLORS.lime);
      doc.roundedRect(MARGIN + 3, y + 3, 4.5, 4.5, 0.8, 0.8, "F");
      
      // Vector checkmark
      doc.setDrawColor(...COLORS.ink);
      doc.setLineWidth(0.5);
      doc.line(MARGIN + 3.9, y + 5.2, MARGIN + 4.8, y + 6.4);
      doc.line(MARGIN + 4.8, y + 6.4, MARGIN + 6.4, y + 4.1);

      // Strength text
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.ink);
      doc.setFont("helvetica", "normal");
      let sY = y + 6;
      for (const line of sLines) {
        doc.text(line, MARGIN + 10.5, sY);
        sY += 4.8;
      }

      y += rowH + 2.5;
    }
    y += 4;
  }

  // ══════════════════════════════════════════════════════
  // 5. REQUIREMENTS BREAKDOWN & GAP AUDIT
  // ══════════════════════════════════════════════════════
  if (analysis.requirements && analysis.requirements.length > 0) {
    sectionPill("Requirements Breakdown & Gap Audit");

    const statusConfig = {
      matched: { label: "MATCHED", bg: COLORS.matchedBg, text: COLORS.matchedText },
      partial: { label: "PARTIAL", bg: COLORS.partialBg, text: COLORS.partialText },
      missing: { label: "NOT SHOWN", bg: COLORS.missingBg, text: COLORS.missingText },
    };

    for (const req of analysis.requirements) {
      const evidenceLines = req.evidence
        ? doc.splitTextToSize(`Evidence: "${req.evidence}"`, CONTENT_WIDTH - 16)
        : [];
      const recLines = req.recommendation
        ? doc.splitTextToSize(`Action: ${req.recommendation}`, CONTENT_WIDTH - 16)
        : [];

      const extraH =
        (evidenceLines.length > 0 ? evidenceLines.length * 4.4 + 5 : 0) +
        (recLines.length > 0 ? recLines.length * 4.4 + 5 : 0);
      const cardH = 14 + extraH + 4;

      checkPage(cardH + 3);

      doc.setFillColor(...COLORS.cardBg);
      doc.setDrawColor(...COLORS.cardBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, cardH, 1.5, 1.5, "FD");

      // Status pill
      const conf = statusConfig[req.status] || statusConfig.missing;
      doc.setFillColor(...conf.bg);
      doc.roundedRect(MARGIN + 5, y + 4, 21, 5, 0.8, 0.8, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(...conf.text);
      doc.setFont("helvetica", "bold");
      doc.text(conf.label, MARGIN + 15.5, y + 7.5, { align: "center" });

      // Importance badge
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.muted);
      doc.setFont("helvetica", "normal");
      doc.text(`IMPORTANCE: ${req.importance.toUpperCase()}`, MARGIN + 30, y + 7.5);

      // Requirement name
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.ink);
      doc.setFont("helvetica", "bold");
      doc.text(req.name, MARGIN + 5, y + 14);

      let innerY = y + 17;

      // Evidence quote
      if (evidenceLines.length > 0) {
        const quoteH = evidenceLines.length * 4.4 + 3;
        doc.setFillColor(...COLORS.quoteBg);
        doc.rect(MARGIN + 5, innerY, CONTENT_WIDTH - 10, quoteH, "F");
        doc.setFillColor(...COLORS.cardBorder);
        doc.rect(MARGIN + 5, innerY, 1.5, quoteH, "F");

        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.mutedDark);
        doc.setFont("helvetica", "italic");
        let qY = innerY + 3.8;
        for (const line of evidenceLines) {
          doc.text(line, MARGIN + 9, qY);
          qY += 4.4;
        }
        innerY += quoteH + 2.5;
      }

      // Actionable recommendation
      if (recLines.length > 0) {
        doc.setFontSize(7.8);
        doc.setTextColor(...COLORS.ink);
        doc.setFont("helvetica", "normal");
        let rY = innerY + 3.2;
        for (const line of recLines) {
          doc.text(line, MARGIN + 6, rY);
          rY += 4.4;
        }
      }

      y += cardH + 3.5;
    }
    y += 4;
  }

  // ══════════════════════════════════════════════════════
  // 6. ACTIONABLE RESUME REWRITES
  // ══════════════════════════════════════════════════════
  if (analysis.improvements && analysis.improvements.length > 0) {
    sectionPill("Targeted Resume Improvements");

    for (const imp of analysis.improvements) {
      const expLines = doc.splitTextToSize(imp.explanation, CONTENT_WIDTH - 14);
      const exLines = imp.example
        ? doc.splitTextToSize(`"${imp.example}"`, CONTENT_WIDTH - 18)
        : [];

      const exBoxH = exLines.length > 0 ? exLines.length * 4.4 + 8 : 0;
      const impCardH = 12 + expLines.length * 4.8 + exBoxH + 4;

      checkPage(impCardH + 3);

      doc.setFillColor(...COLORS.cardBg);
      doc.setDrawColor(...COLORS.cardBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, impCardH, 1.5, 1.5, "FD");

      // Title
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.ink);
      doc.setFont("helvetica", "bold");
      doc.text(imp.title, MARGIN + 6, y + 7);

      // Explanation
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.mutedDark);
      doc.setFont("helvetica", "normal");
      let eY = y + 12;
      for (const line of expLines) {
        doc.text(line, MARGIN + 6, eY);
        eY += 4.8;
      }

      // Example rewrite box
      if (exLines.length > 0) {
        eY += 1;
        doc.setFillColor(...COLORS.exampleBg);
        doc.setDrawColor(...COLORS.cardBorderSubtle);
        doc.setLineWidth(0.2);
        doc.roundedRect(MARGIN + 5, eY, CONTENT_WIDTH - 10, exBoxH, 1, 1, "FD");

        // Lime indicator bar
        doc.setFillColor(...COLORS.lime);
        doc.rect(MARGIN + 5, eY, 1.8, exBoxH, "F");

        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.ink);
        doc.setFont("helvetica", "bold");
        doc.text("RECOMMENDED BULLET REWRITE (ADAPT TO YOUR EXPERIENCE):", MARGIN + 9, eY + 4.2);

        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.ink);
        doc.setFont("helvetica", "normal");
        let exLineY = eY + 8.5;
        for (const line of exLines) {
          doc.text(line, MARGIN + 9, exLineY);
          exLineY += 4.4;
        }
      }

      y += impCardH + 3.5;
    }
    y += 4;
  }

  // ══════════════════════════════════════════════════════
  // 7. CAVEATS & DISCLAIMER
  // ══════════════════════════════════════════════════════
  if (analysis.caveats && analysis.caveats.length > 0) {
    sectionPill("Audit Methodology & Caveats");

    for (const c of analysis.caveats) {
      const cLines = doc.splitTextToSize(`•  ${c}`, CONTENT_WIDTH - 12);
      checkPage(cLines.length * 4.6 + 2);
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.muted);
      doc.setFont("helvetica", "normal");
      for (const line of cLines) {
        doc.text(line, MARGIN + 4, y);
        y += 4.6;
      }
    }
    y += 4;
  }

  // Disclaimer box
  checkPage(24);
  doc.setFillColor(...COLORS.cardBg);
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 1.5, 1.5, "FD");

  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  const disclaimerText =
    "This report was generated by HireLens Advanced LLMs. The match score is an objective estimate calibrated against stated job requirements. It is not a hiring guarantee or employment prediction. Missing evidence signifies absence in the submitted resume text, not necessarily absence of capability. Suggested bullets are templates to adapt to your actual career experience.";
  const dLines = doc.splitTextToSize(disclaimerText, CONTENT_WIDTH - 8);
  for (let i = 0; i < dLines.length; i++) {
    doc.text(dLines[i], MARGIN + 4, y + 5 + i * 3.8);
  }

  addFooter();
  return doc;
}

/** Reliable cross-browser PDF downloader with explicit MIME type & anchor download */
export function downloadReport(analysis: ResumeAnalysis, customFilename?: string) {
  const doc = generateReport(analysis);

  // Clean filename: e.g. hirelens-lead-frontend-engineer-report.pdf
  const roleSlug = (analysis.roleTitle || "resume-report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45);

  const filename = customFilename || `hirelens-${roleSlug || "match"}-report.pdf`;

  try {
    const pdfBlob = doc.output("blob");
    // Explicit application/pdf blob
    const typedBlob = new Blob([pdfBlob], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(typedBlob);

    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    }, 400);
  } catch {
    // Fallback if Blob / URL API fails
    doc.save(filename);
  }
}
