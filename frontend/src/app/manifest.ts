import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ekim Craft — El yapımı",
    short_name: "Ekim Craft",
    description: "El yapımı, kişiye özel ürünler.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#2d4a3e",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
