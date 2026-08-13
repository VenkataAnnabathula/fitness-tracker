import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./marketing.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thecaffeinate.com"),
  title: { default: "The Caffeinate — Private PDF Tools", template: "%s · The Caffeinate" },
  description: "Edit PDF text for free. Use private local OCR to create AI-ready TXT and Markdown on Mac and Windows—without uploading documents.",
  keywords: ["private PDF editor", "offline OCR", "PDF to Markdown", "PDF to text for AI", "local PDF tools", "PDF editor for Mac", "PDF editor for Windows"],
  openGraph: { title: "Edit PDFs for free. Keep them private.", description: "Private PDF editing, local OCR, and AI-ready Markdown for Mac and Windows.", url: "https://www.thecaffeinate.com", siteName: "The Caffeinate", type: "website", images: [{url:"/og.png",width:1200,height:630,alt:"The Caffeinate private PDF tools"}] },
  twitter: { card: "summary_large_image", title: "The Caffeinate — Private PDF Tools", description: "Edit PDFs for free and turn scans into AI-ready text—locally.", images:["/og.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5efe5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
