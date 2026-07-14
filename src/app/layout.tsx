import type { Metadata } from "next";
import "./globals.css";
import { getSiteBasePath } from "@/lib/siteAssets";

export const metadata: Metadata = {
  title: "Bobkov — творческое портфолио",
  description: "Рисунки, наброски и комната работ."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = getSiteBasePath();

  return (
    <html lang="ru">
      <head>
        {basePath ? (
          <style
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:"BobkovHand";src:url("${basePath}/fonts/hand-variable.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap;}`
            }}
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
