"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { ATSResumeData, ExperienceEntry, EducationEntry, ProjectEntry } from "@/types/resume";
import { DEFAULT_ATS_RESUME, atsResumeToPlainText, computeResumeCompleteness } from "@/lib/ats-resume";
import { downloadATSResumePDF } from "@/lib/ats-pdf-generator";
import { ATSResumePreview } from "./ats-resume-preview";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Award,
  Eye,
  Download,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";

const SECTIONS = [
  { id: "personal", label: "Contact Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Cpu },
  { id: "preview", label: "Preview & Export", icon: Eye },
] as const;

export function ResumeBuilder() {
  const router = useRouter();
  const [data, setData] = useState<ATSResumeData>({
    ...DEFAULT_ATS_RESUME,
    personalInfo: {
      fullName: "Alex Morgan",
      targetRole: "Senior Software Engineer",
      email: "alex.morgan@example.com",
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      linkedin: "linkedin.com/in/alexmorgan",
      github: "github.com/alexmorgan",
      portfolio: "alexmorgan.dev",
    },
    professionalSummary:
      "Results-driven Senior Full-Stack Engineer with 5+ years of experience architecting distributed cloud applications, Next.js web applications, and resilient Node.js microservices. Proven track record of improving web performance and mentoring high-velocity engineering teams.",
    education: [
      {
        id: "edu_1",
        institution: "National Institute of Technology",
        degree: "Bachelor of Technology",
        fieldOfStudy: "Computer Science and Engineering",
        startDate: "2018",
        endDate: "2022",
        grade: "8.8 / 10 CGPA",
        coursework: "Data Structures, Distributed Systems, Database Management",
      },
    ],
    experience: [
      {
        id: "exp_1",
        organization: "TechForward Solutions",
        role: "Senior Software Engineer",
        startDate: "Jun 2022",
        endDate: "Present",
        isCurrent: true,
        bulletPoints: [
          "Architected real-time microservices handling 3M+ daily events using Node.js, PostgreSQL, and Redis.",
          "Spearheaded web platform migration to Next.js 14 App Router, cutting Largest Contentful Paint (LCP) by 42%.",
          "Mentored 4 junior engineers on automated CI/CD deployment pipelines, unit testing, and design systems.",
        ],
      },
    ],
    projects: [
      {
        id: "proj_1",
        title: "Distributed Cache Layer",
        technologies: "TypeScript, Redis, Go, Docker",
        description: "Built high-throughput distributed caching middleware with sub-5ms lookup latency.",
        personalContribution: "Designed consistent hashing algorithm and failover replica recovery protocols.",
        outcomes: "Reduced database read load by 60% across 12 production clusters.",
        githubUrl: "github.com/alexmorgan/cache-layer",
      },
    ],
    skills: {
      technical: ["TypeScript", "JavaScript", "Python", "React", "Next.js", "Node.js", "PostgreSQL", "Redis"],
      toolsAndFrameworks: ["Docker", "Kubernetes", "AWS", "Git", "Vitest", "TailwindCSS"],
      softSkills: ["Technical Leadership", "System Architecture", "Cross-team Collaboration"],
    },
    certifications: ["AWS Certified Solutions Architect – Associate (2023)"],
    achievements: ["Winner of Smart India Hackathon (2021) out of 1,200 participating teams."],
    leadershipAndVolunteering: ["Organized Google Developer Group (GDG) campus meetups with 250+ attendees."],
  });

  const [activeSection, setActiveSection] = useState<string>("personal");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [aiLoading, setAiLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { score: completeness, suggestions } = computeResumeCompleteness(data);

  // AI Assist handler
  const handleAIAssist = async (
    action: "summary" | "bullet_point" | "project_rewrite",
    currentText: string,
    onSuccess: (improved: string) => void
  ) => {
    if (!currentText.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/builder/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          currentText,
          targetRole: data.personalInfo.targetRole,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.improvedText) {
        onSuccess(resData.improvedText);
      }
    } catch (err) {
      console.error("[Builder AI Error]:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Handoff to /analyze
  const handleHandoffToScanner = () => {
    const plainText = atsResumeToPlainText(data);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hirelens_builder_resume", plainText);
      sessionStorage.setItem("hirelens_builder_role", data.personalInfo.targetRole || "");
    }
    router.push("/analyze");
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      downloadATSResumePDF(data);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-24 md:px-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Free Tool • No Sign-up Required
            </span>
            <span className="rounded-[4px] border border-ink bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
              100% ATS COMPLIANT
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Free ATS Resume Builder
          </h1>
          <p className="mt-1 text-sm text-muted">
            Craft a single-column, recruiter-readable resume tailored to pass applicant tracking systems.
          </p>
        </div>

        {/* Completeness Meter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-[4px] border border-line bg-paper px-3.5 py-2">
            <span className="font-mono text-xs text-muted">ATS Ready:</span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-lime transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-ink">{completeness}%</span>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-paper px-4 py-2 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download size={14} />
            {downloading ? "Exporting..." : "Export ATS PDF"}
          </button>

          <button
            onClick={handleHandoffToScanner}
            className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-5 py-2 text-xs font-semibold text-ink shadow-[2px_2px_0_#111318] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles size={14} />
            <span>Check Match on HireLens →</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="mt-4 flex rounded-[4px] border border-line bg-paper p-1 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={`flex-1 rounded-[3px] py-2 text-xs font-semibold ${
            mobileTab === "edit" ? "bg-ink text-paper" : "text-muted"
          }`}
        >
          Edit Resume Form
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 rounded-[3px] py-2 text-xs font-semibold ${
            mobileTab === "preview" ? "bg-ink text-paper" : "text-muted"
          }`}
        >
          Live ATS Preview
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Section Navigation & Edit Form (col 1-6 or full on mobile edit) */}
        <div
          className={`space-y-6 lg:col-span-6 ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Section Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-line pb-2 scrollbar-none gap-2">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-[4px] px-3.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "border border-ink bg-ink text-paper"
                      : "border border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content per Active Section */}
          <div className="rounded-[6px] border border-line bg-paper p-6 shadow-xs">
            {/* 1. PERSONAL INFO */}
            {activeSection === "personal" && (
              <div className="space-y-4">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-semibold text-ink">Personal & Contact Info</h2>
                  <p className="text-xs text-muted">
                    ATS parses direct contact lines cleanly. No photos or full street addresses needed.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-ink">Full Name *</label>
                    <input
                      type="text"
                      value={data.personalInfo.fullName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, fullName: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">Target Role *</label>
                    <input
                      type="text"
                      value={data.personalInfo.targetRole}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, targetRole: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="e.g. Senior Full Stack Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">Email *</label>
                    <input
                      type="email"
                      value={data.personalInfo.email}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, email: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">Phone</label>
                    <input
                      type="tel"
                      value={data.personalInfo.phone || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, phone: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">City, Country</label>
                    <input
                      type="text"
                      value={data.personalInfo.location || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, location: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="Bengaluru, India"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">LinkedIn URL</label>
                    <input
                      type="text"
                      value={data.personalInfo.linkedin || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, linkedin: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">GitHub URL</label>
                    <input
                      type="text"
                      value={data.personalInfo.github || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, github: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="github.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink">Portfolio / Website</label>
                    <input
                      type="text"
                      value={data.personalInfo.portfolio || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, portfolio: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      placeholder="yourname.dev"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL SUMMARY */}
            {activeSection === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Professional Summary</h2>
                    <p className="text-xs text-muted">
                      2-3 sentences highlighting your core competencies, years of experience, and specialty.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() =>
                      handleAIAssist("summary", data.professionalSummary || "Software Engineer", (improved) =>
                        setData({ ...data, professionalSummary: improved })
                      )
                    }
                    className="flex items-center gap-1.5 rounded-[4px] border border-ink bg-lime px-3 py-1.5 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <Sparkles size={13} />
                    <span>{aiLoading ? "Refining..." : "Refine with AI"}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={data.professionalSummary}
                  onChange={(e) => setData({ ...data, professionalSummary: e.target.value })}
                  className="w-full rounded-[4px] border border-line bg-white p-3 text-xs leading-relaxed text-ink focus:border-ink focus:outline-none"
                  placeholder="Write your professional summary here..."
                />
              </div>
            )}

            {/* 3. EXPERIENCE */}
            {activeSection === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Work Experience & Internships</h2>
                    <p className="text-xs text-muted">
                      Add relevant professional roles with quantifiable achievement bullets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newExp: ExperienceEntry = {
                        id: `exp_${Date.now()}`,
                        organization: "New Company",
                        role: "Software Engineer",
                        startDate: "2023",
                        endDate: "Present",
                        isCurrent: true,
                        bulletPoints: ["Accomplished key milestones using relevant tech stack."],
                      };
                      setData({ ...data, experience: [...data.experience, newExp] });
                    }}
                    className="flex items-center gap-1 rounded-[4px] border border-ink bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line/20"
                  >
                    <Plus size={14} /> Add Role
                  </button>
                </div>

                {data.experience.map((exp, expIdx) => (
                  <div key={exp.id} className="rounded-[4px] border border-line bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted">Role {expIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.experience.filter((_, i) => i !== expIdx);
                          setData({ ...data, experience: updated });
                        }}
                        className="text-muted hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-ink">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[expIdx].role = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">Company / Organization</label>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[expIdx].organization = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[expIdx].startDate = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          placeholder="e.g. Jun 2022"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">End Date</label>
                        <input
                          type="text"
                          value={exp.isCurrent ? "Present" : exp.endDate}
                          disabled={exp.isCurrent}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[expIdx].endDate = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`curr_${exp.id}`}
                        checked={exp.isCurrent}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[expIdx].isCurrent = e.target.checked;
                          if (e.target.checked) updated[expIdx].endDate = "Present";
                          setData({ ...data, experience: updated });
                        }}
                      />
                      <label htmlFor={`curr_${exp.id}`} className="text-xs text-muted">
                        I currently work in this role
                      </label>
                    </div>

                    {/* Bullet points */}
                    <div className="space-y-2 pt-2 border-t border-line/50">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-ink">Achievement Bullets</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...data.experience];
                            updated[expIdx].bulletPoints.push("Engineered and delivered key component.");
                            setData({ ...data, experience: updated });
                          }}
                          className="text-[11px] font-medium text-ink hover:underline"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      {exp.bulletPoints.map((bp, bpIdx) => (
                        <div key={bpIdx} className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted">•</span>
                          <input
                            type="text"
                            value={bp}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[expIdx].bulletPoints[bpIdx] = e.target.value;
                              setData({ ...data, experience: updated });
                            }}
                            className="flex-1 rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          />
                          <button
                            type="button"
                            title="Improve with AI"
                            disabled={aiLoading}
                            onClick={() =>
                              handleAIAssist("bullet_point", bp, (improved) => {
                                const updated = [...data.experience];
                                updated[expIdx].bulletPoints[bpIdx] = improved;
                                setData({ ...data, experience: updated });
                              })
                            }
                            className="rounded-[3px] border border-ink/40 bg-lime/30 p-1.5 text-ink hover:bg-lime disabled:opacity-50"
                          >
                            <Sparkles size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...data.experience];
                              updated[expIdx].bulletPoints = updated[expIdx].bulletPoints.filter(
                                (_, i) => i !== bpIdx
                              );
                              setData({ ...data, experience: updated });
                            }}
                            className="text-muted hover:text-rose-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. PROJECTS */}
            {activeSection === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Technical Projects</h2>
                    <p className="text-xs text-muted">
                      Showcase hands-on applications with technologies and personal outcomes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newProj: ProjectEntry = {
                        id: `proj_${Date.now()}`,
                        title: "New Project",
                        technologies: "React, Node.js, PostgreSQL",
                        description: "Developed scalable web service.",
                        personalContribution: "Implemented core API endpoints.",
                        outcomes: "Handled 10k users.",
                      };
                      setData({ ...data, projects: [...data.projects, newProj] });
                    }}
                    className="flex items-center gap-1 rounded-[4px] border border-ink bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line/20"
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>

                {data.projects.map((proj, projIdx) => (
                  <div key={proj.id} className="rounded-[4px] border border-line bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted">Project {projIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.projects.filter((_, i) => i !== projIdx);
                          setData({ ...data, projects: updated });
                        }}
                        className="text-muted hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-ink">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[projIdx].title = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[projIdx].technologies = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          placeholder="e.g. Next.js, Redis, AWS"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">GitHub URL (Optional)</label>
                        <input
                          type="text"
                          value={proj.githubUrl || ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[projIdx].githubUrl = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          placeholder="github.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">Live URL (Optional)</label>
                        <input
                          type="text"
                          value={proj.projectUrl || ""}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[projIdx].projectUrl = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink">Description & Impact</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[projIdx].description = e.target.value;
                          setData({ ...data, projects: updated });
                        }}
                        className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. EDUCATION */}
            {activeSection === "education" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Education & Academics</h2>
                    <p className="text-xs text-muted">Degrees, institutions, CGPA, and coursework.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newEdu: EducationEntry = {
                        id: `edu_${Date.now()}`,
                        institution: "University Name",
                        degree: "Bachelor of Technology",
                        fieldOfStudy: "Computer Science",
                        startDate: "2019",
                        endDate: "2023",
                      };
                      setData({ ...data, education: [...data.education, newEdu] });
                    }}
                    className="flex items-center gap-1 rounded-[4px] border border-ink bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line/20"
                  >
                    <Plus size={14} /> Add Degree
                  </button>
                </div>

                {data.education.map((edu, eduIdx) => (
                  <div key={edu.id} className="rounded-[4px] border border-line bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted">Education {eduIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.education.filter((_, i) => i !== eduIdx);
                          setData({ ...data, education: updated });
                        }}
                        className="text-muted hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-ink">Degree & Field</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[eduIdx].degree = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          placeholder="B.Tech Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[eduIdx].institution = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">Graduation Year / Dates</label>
                        <input
                          type="text"
                          value={`${edu.startDate} - ${edu.endDate}`}
                          onChange={(e) => {
                            const updated = [...data.education];
                            const parts = e.target.value.split("-");
                            updated[eduIdx].startDate = parts[0]?.trim() || "";
                            updated[eduIdx].endDate = parts[1]?.trim() || "";
                            setData({ ...data, education: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          placeholder="2018 - 2022"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink">CGPA / Grade (Optional)</label>
                        <input
                          type="text"
                          value={edu.grade || ""}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[eduIdx].grade = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          className="mt-1 w-full rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-xs text-ink"
                          placeholder="8.5 / 10 CGPA"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. SKILLS & ADDITIONAL */}
            {activeSection === "skills" && (
              <div className="space-y-4">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-semibold text-ink">Skills, Tools & Certifications</h2>
                  <p className="text-xs text-muted">Comma-separated entries for instant ATS tokenization.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink">Technical Languages & Core Skills</label>
                  <input
                    type="text"
                    value={data.skills.technical.join(", ")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        skills: {
                          ...data.skills,
                          technical: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink"
                    placeholder="TypeScript, Python, React, PostgreSQL"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink">Tools, Cloud & Frameworks</label>
                  <input
                    type="text"
                    value={data.skills.toolsAndFrameworks.join(", ")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        skills: {
                          ...data.skills,
                          toolsAndFrameworks: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink"
                    placeholder="Docker, Kubernetes, AWS, Git, Vitest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink">Certifications (Optional)</label>
                  <input
                    type="text"
                    value={(data.certifications || []).join(", ")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        certifications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink"
                    placeholder="AWS Solutions Architect, CKA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink">Key Achievements (Optional)</label>
                  <input
                    type="text"
                    value={(data.achievements || []).join(", ")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        achievements: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="mt-1 w-full rounded-[4px] border border-line bg-white px-3 py-2 text-xs text-ink"
                    placeholder="Hackathon Winner, Dean's List"
                  />
                </div>
              </div>
            )}

            {/* 7. PREVIEW & EXPORT ACTIONS */}
            {activeSection === "preview" && (
              <div className="space-y-4">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-semibold text-ink">Export & Analyze</h2>
                  <p className="text-xs text-muted">
                    Your single-column ATS resume is complete and formatted for immediate use.
                  </p>
                </div>

                <div className="rounded-[4px] border border-line bg-line/15 p-4 text-xs text-muted">
                  <p className="font-semibold text-ink">✓ Guaranteed ATS Single-Column Layout</p>
                  <p className="mt-1">
                    Uses standard Helvetica vector fonts, standard headings, and selectable text. Cleanly parsed by Workday, Greenhouse, Lever, and Taleo.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border-2 border-ink bg-paper px-6 py-3 text-xs font-semibold text-ink shadow-[2px_2px_0_#111318]"
                  >
                    <Download size={15} />
                    {downloading ? "Generating PDF..." : "Download ATS Resume PDF"}
                  </button>

                  <button
                    onClick={handleHandoffToScanner}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border-2 border-ink bg-lime px-6 py-3 text-xs font-semibold text-ink shadow-[2px_2px_0_#111318]"
                  >
                    <Sparkles size={15} />
                    <span>Check Match on HireLens →</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wizard step navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={activeSection === SECTIONS[0].id}
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.id === activeSection);
                if (idx > 0) setActiveSection(SECTIONS[idx - 1].id);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink disabled:opacity-30"
            >
              <ArrowLeft size={14} /> Previous section
            </button>

            <button
              type="button"
              disabled={activeSection === SECTIONS[SECTIONS.length - 1].id}
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.id === activeSection);
                if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id);
              }}
              className="flex items-center gap-1.5 rounded-[4px] border border-ink bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-line/20 disabled:opacity-30"
            >
              Next section <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live ATS Preview (Desktop side-by-side or mobile tab) */}
        <div
          className={`lg:col-span-6 ${
            mobileTab === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Live ATS Preview (A4 Standard)
              </span>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1 text-xs font-semibold text-ink hover:underline"
              >
                <Download size={13} /> Download PDF
              </button>
            </div>

            <div className="max-h-[85vh] overflow-y-auto rounded-[6px] border border-line bg-line/10 p-2 md:p-4">
              <ATSResumePreview data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
