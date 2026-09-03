import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aria's Tasks",
    short_name: "Tasks",
    description: "Family routines, chores, stars and rewards.",
    // "/" redirects to /tasks, so launch straight into the family view.
    start_url: "/tasks",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    // Matches the themeColor in the root layout's viewport export.
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android crops adaptive icons; this one keeps the art inside the safe zone.
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
