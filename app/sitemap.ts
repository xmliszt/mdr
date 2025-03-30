import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.lumon-industries.work",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://www.lumon-industries.work/lumon/mdr",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...Object.keys(FILES).map((fileId) => ({
      url: `https://www.lumon-industries.work/lumon/mdr/${fileId}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
