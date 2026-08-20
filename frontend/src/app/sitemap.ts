import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-20");
  return [
    { url: "https://www.thecaffeinate.com/", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://www.thecaffeinate.com/editor", lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: "https://www.thecaffeinate.com/privacy", lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: "https://www.thecaffeinate.com/terms", lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
