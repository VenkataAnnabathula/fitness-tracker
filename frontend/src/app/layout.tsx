import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thecaffeinate.com"),
  title: { default: "The Caffeinate — Private PDF Tools", template: "%s · The Caffeinate" },
  description: "Edit, merge, split, compress, and convert PDFs locally on Mac and Windows. No uploads, accounts, or document tracking.",
  keywords: ["private PDF editor", "offline PDF editor", "local PDF tools", "PDF editor for Mac", "PDF editor for Windows"],
  openGraph: { title: "Wake up your PDFs. Keep them private.", description: "Private PDF tools that work locally on your Mac or Windows PC.", url: "https://www.thecaffeinate.com", siteName: "The Caffeinate", type: "website", images: [{url:"/og.png",width:1200,height:630,alt:"The Caffeinate private PDF tools"}] },
  twitter: { card: "summary_large_image", title: "The Caffeinate — Private PDF Tools", description: "Your files stay on your computer. Exactly where they belong.", images:["/og.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5efe5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
