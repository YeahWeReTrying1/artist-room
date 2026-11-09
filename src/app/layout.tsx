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

const title = "Творческое портфолио";
const description = "Я Максим Бобков, это моё творческое портфолио, куда я публикую работы с набросков и просто свои рисунки с поездок. Мои работы про эксперимент, поиск формы, исследование материала, человека и чувства.";
const siteUrl = "https://yeahweretrying1.github.io/artist-room/";
const socialImage = `${siteUrl}social-preview.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: title,
    locale: "ru_RU",
    images: [{ url: socialImage, width: 2545, height: 1321, alt: title }]
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
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
