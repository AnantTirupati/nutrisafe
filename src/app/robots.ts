import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/legal/", "/auth/", "/features/"],
        disallow: [
          "/dashboard/",
          "/scan/",
          "/history/",
          "/safe-foods/",
          "/diet-plan/",
          "/my-plans/",
          "/profile/",
          "/premium/",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
