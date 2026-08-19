import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./marketing.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thecaffeinate.com"),
  title: { default: "The Caffeinate — Free, Private PDF Editor", template: "%s · The Caffeinate" },
  description: "A free, browser-local PDF editor plus offline desktop tools for OCR, AI-ready Markdown, merge, split, compress, and conversion. No watermarks.",
  keywords: ["private PDF editor", "offline OCR", "PDF to Markdown", "PDF to text for AI", "local PDF tools", "PDF editor for Mac", "PDF editor for Windows"],
  openGraph: { title: "Wake up your PDFs. Free, with no watermark.", description: "Free desktop PDF editing, offline OCR, and AI-ready Markdown—with no premium feature gates.", url: "https://www.thecaffeinate.com", siteName: "The Caffeinate", type: "website", images: [{url:"/og.png",width:1200,height:630,alt:"The Caffeinate free private PDF editor"}] },
  twitter: { card: "summary_large_image", title: "The Caffeinate — Free PDF Editor", description: "Edit PDFs and turn scans into AI-ready text locally, free.", images:["/og.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5efe5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
