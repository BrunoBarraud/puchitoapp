import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Puchito App",
    short_name: "Puchito",
    description: "App para controlar esos gastos chicos que te funden.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f7eddc",
    theme_color: "#2f2118",
    orientation: "portrait",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/logo-puchito-app.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo-puchito-app.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo-puchito-app.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
