import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/motion/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/structured-data";

const dm = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hirelens.delusive.studio"),
  title: {
    default: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
    template: "%s | HireLens",
  },
  description:
    "Compare your resume against any job description with AI-powered match analysis, or build a 100% free ATS-friendly resume with instant PDF export. A Delusive product.",
  applicationName: "HireLens",
  authors: [{ name: "Delusive", url: "https://delusive.studio" }],
  creator: "Delusive",
  publisher: "Delusive",
  keywords: [
    "free ATS resume builder",
    "ATS friendly resume builder",
    "resume checker against job description",
    "AI resume analyzer",
    "resume to job description matching",
    "how to improve resume for a specific job",
    "free resume builder with PDF export",
    "AI resume analyzer for students",
    "HireLens",
    "Delusive",
  ],
  category: "Career & Employment",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hirelens.delusive.studio",
    siteName: "HireLens",
    title: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
    description:
      "Compare your resume against any job description with AI-powered match analysis, or build a 100% free ATS-friendly resume with instant PDF export.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HireLens — Free ATS Resume Builder & AI Resume Matcher",
    description:
      "Compare your resume against any job description with AI-powered match analysis, or build a 100% free ATS-friendly resume with instant PDF export.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="en" className={`${dm.variable} ${playfair.variable} ${mono.variable}`}>
      <head>
        <JsonLd schema={orgSchema} />
        <JsonLd schema={websiteSchema} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
