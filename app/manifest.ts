import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
    short_name: "HireLens",
    description:
      "Compare your resume against any job description with AI-powered match analysis, or build a 100% free ATS-friendly resume with instant PDF export.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F7F0",
    theme_color: "#111318",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
