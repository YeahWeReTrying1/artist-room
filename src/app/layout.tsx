import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StrokeLoader } from "@/components/StrokeLoader";
import { getLoader } from "@/lib/storage";

const siteBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#c5c7d5"
};

export const metadata: Metadata = {
  title: "Bobkov — творческое портфолио",
  description: "Рисунки, наброски и комната работ.",
  icons: {
    icon: [{ url: `${siteBasePath}/favicon-v2.png`, type: "image/png" }],
    apple: [{ url: `${siteBasePath}/apple-icon.png`, type: "image/png" }]
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const loader = await getLoader();

  return (
    <html lang="ru">

      <body>
        <StrokeLoader loader={loader} storageKey="bobkov-loader-artist" />
        {children}
      </body>
    </html>
  );
}
