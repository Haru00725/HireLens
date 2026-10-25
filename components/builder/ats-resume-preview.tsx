"use client";

import type { ATSResumeData } from "@/types/resume";

interface Props {
  data: ATSResumeData;
  className?: string;
}

export function ATSResumePreview({ data, className = "" }: Props) {
  const { personalInfo, professionalSummary, experience, projects, education, skills, certifications, achievements } = data;

  const contacts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const links = [
    personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`,
    personalInfo.github && `GitHub: ${personalInfo.github}`,
    personalInfo.portfolio && `Portfolio: ${personalInfo.portfolio}`,
  ].filter(Boolean);

  const hasSkills =
    (skills?.technical && skills.technical.length > 0) ||
    (skills?.toolsAndFrameworks && skills.toolsAndFrameworks.length > 0) ||
    (skills?.softSkills && skills.softSkills.length > 0);

  return (
    <div
      className={`mx-auto w-full max-w-[800px] rounded-[4px] border border-line bg-white p-8 md:p-12 text-[#111318] shadow-sm font-sans ${className}`}
      style={{ minHeight: "1050px" }}
    >
      {/* 1. Header / Contact Information */}
      <header className="border-b border-gray-200 pb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-ink md:text-3xl">
          {personalInfo.fullName || "Your Full Name"}
        </h1>

        {personalInfo.targetRole && (
          <p className="mt-1 text-sm font-medium text-gray-700">
            {personalInfo.targetRole}
          </p>
        )}

        {contacts.length > 0 && (
          <p className="mt-2 text-xs text-gray-600">
            {contacts.join("   •   ")}
          </p>
        )}

        {links.length > 0 && (
          <p className="mt-1 text-xs text-gray-600">
            {links.join("   •   ")}
          </p>
        )}
      </header>

      {/* 2. Professional Summary */}
      {professionalSummary && professionalSummary.trim() && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Professional Summary
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-800">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* 3. Work Experience */}
      {experience && experience.length > 0 && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Work Experience
          </h2>
          <div className="mt-3 space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex items-baseline justify-between font-semibold text-ink">
                  <span>
                    {exp.role || "Role"} — <span className="font-normal text-gray-700">{exp.organization || "Company"}</span>
                  </span>
                  <span className="font-normal text-gray-500">
                    {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-gray-800">
                    {exp.bulletPoints.map((bp, i) => (
                      <li key={i} className="leading-relaxed">
                        {bp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Projects */}
      {projects && projects.length > 0 && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Projects
          </h2>
          <div className="mt-3 space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="flex items-baseline justify-between font-semibold text-ink">
                  <span>{proj.title}</span>
                  {(proj.projectUrl || proj.githubUrl) && (
                    <span className="font-normal text-gray-500 text-[11px]">
                      {[proj.projectUrl, proj.githubUrl].filter(Boolean).join(" | ")}
                    </span>
                  )}
                </div>
                {proj.technologies && (
                  <p className="mt-0.5 text-[11px] italic text-gray-600">
                    Technologies: {proj.technologies}
                  </p>
                )}
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-gray-800">
                  {proj.description && <li className="leading-relaxed">{proj.description}</li>}
                  {proj.personalContribution && (
                    <li className="leading-relaxed">Contribution: {proj.personalContribution}</li>
                  )}
                  {proj.outcomes && (
                    <li className="leading-relaxed">Outcomes: {proj.outcomes}</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Education */}
      {education && education.length > 0 && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Education
          </h2>
          <div className="mt-3 space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex items-baseline justify-between font-semibold text-ink">
                  <span>
                    {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ") || "Degree"}
                  </span>
                  <span className="font-normal text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="mt-0.5 text-gray-600">
                  {edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ""}
                </p>
                {edu.coursework && (
                  <p className="mt-1 text-[11px] text-gray-600">
                    Relevant Coursework: {edu.coursework}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Skills */}
      {hasSkills && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Skills & Competencies
          </h2>
          <div className="mt-2.5 space-y-1.5 text-xs text-gray-800">
            {skills.technical && skills.technical.length > 0 && (
              <p>
                <strong className="text-ink">Technical Skills:</strong>{" "}
                {skills.technical.join(", ")}
              </p>
            )}
            {skills.toolsAndFrameworks && skills.toolsAndFrameworks.length > 0 && (
              <p>
                <strong className="text-ink">Tools & Frameworks:</strong>{" "}
                {skills.toolsAndFrameworks.join(", ")}
              </p>
            )}
            {skills.softSkills && skills.softSkills.length > 0 && (
              <p>
                <strong className="text-ink">Core Competencies:</strong>{" "}
                {skills.softSkills.join(", ")}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 7. Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Certifications
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-800">
            {certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 8. Achievements */}
      {achievements && achievements.length > 0 && (
        <section className="mt-6">
          <h2 className="border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-ink">
            Key Achievements
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-800">
            {achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
