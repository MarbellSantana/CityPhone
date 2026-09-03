import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "City Phone | Gestión del local",
    short_name: "City Phone",
    description: "Sistema de gestión para City Phone",
    start_url: "/Cityphone/",
    scope: "/Cityphone/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#b8e6c1",
    lang: "es",
    icons: [
      { src: "/Cityphone/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
    ],
  };
}
