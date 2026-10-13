import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/lora";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    title: "ShelfCare — Your beauty shelf, cared for",
    description: "Track makeup and skincare freshness, routines, reminders, and shelf health in one calm daily companion.",
    openGraph: {
      title: "ShelfCare — Your beauty shelf, cared for",
      description: "A calm daily companion for your makeup, skincare, and routines.",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "ShelfCare beauty tracker" }],
    },
    twitter: { card: "summary_large_image", images: [`${origin}/og.png`] },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "ShelfCare" },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#6f7751" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
