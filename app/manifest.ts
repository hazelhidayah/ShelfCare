import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "ShelfCare — Beauty Shelf Tracker", short_name: "ShelfCare", description: "Track makeup, skincare, routines, ingredients, and expiry reminders.", start_url: "/", display: "standalone", background_color: "#fbf5f1", theme_color: "#6f7751", orientation: "portrait" };
}
