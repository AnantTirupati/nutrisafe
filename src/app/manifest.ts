import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NutriSafe – AI Food Safety & Diet Assistant",
    short_name: "NutriSafe",
    description:
      "Analyze packaged food ingredients and labels against your health conditions and allergies.",
    start_url: "/",
    display: "standalone",
    background_color: "#153322",
    theme_color: "#153322",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
