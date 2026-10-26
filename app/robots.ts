import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://hirelens.delusive.studio";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/builder", "/analyze", "/privacy"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
