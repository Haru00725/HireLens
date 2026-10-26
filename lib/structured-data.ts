/**
 * Type-safe structured data (JSON-LD) generators for HireLens.
 * All information is strictly verified against actual product offerings.
 */

export const SITE_URL = "https://hirelens.delusive.studio";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "HireLens",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon`,
      width: 32,
      height: 32,
    },
    email: "hello@delusive.studio",
    parentOrganization: {
      "@type": "Organization",
      name: "Delusive",
      url: "https://delusive.studio",
    },
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "HireLens",
    url: SITE_URL,
    description:
      "AI-powered resume and job-description matching tool with a free ATS-friendly resume builder.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en-US",
  };
}

export function getWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#webapp`,
    name: "HireLens",
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All modern web browsers",
    description:
      "See your resume through a recruiter's lens. Compare your resume against any job description with calibrated match scores, or create a strictly ATS-friendly resume with instant PDF export.",
    offers: [
      {
        "@type": "Offer",
        name: "Free ATS Resume Builder",
        price: "0",
        priceCurrency: "INR",
        description:
          "Build a single-column, strictly ATS-friendly resume from your experience with instant vector PDF export.",
      },
      {
        "@type": "Offer",
        name: "Single AI Resume Scan",
        price: "19",
        priceCurrency: "INR",
        description:
          "Full AI resume and job-description match analysis with requirement breakdown and actionable recommendations.",
      },
    ],
    featureList: [
      "Single-column ATS-friendly resume builder",
      "Vector PDF export formatted for applicant tracking systems",
      "Objective 0–100 resume-to-job match calibration",
      "Requirement-by-requirement evidence breakdown",
      "Actionable bullet point and strength recommendations",
      "In-memory parsing with zero permanent file storage",
      "Zero-training commercial AI privacy policy",
    ],
    browserRequirements: "Requires HTML5 and JavaScript enabled.",
    creator: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}



export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Safely serialize JSON-LD script content preventing script injection.
 */
export function serializeSchema(schema: Record<string, unknown> | Array<Record<string, unknown>>) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
