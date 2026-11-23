"use client";

import Link from "next/link";
import { useArtistLanguage } from "@/components/ArtistLanguage";
import { ArtistImage } from "@/components/ArtistImage";
import type { AboutData } from "@/lib/types";
import { artistText } from "@/lib/artistTranslations";

type Props = {
  about: AboutData;
};

export function AboutPageClient({ about }: Props) {
  const { language, toggleLanguage } = useArtistLanguage();
  const english = language === "en";
  const telegram = about.links?.find(link => link.label.toLowerCase() === "telegram");

  return (
    <main className="artistAbout">
      <nav className="artistAboutNav">
        <Link href="/">{english ? "Portfolio" : "К работам"}</Link>
        <button type="button" onClick={toggleLanguage} aria-label={english ? "Переключить на русский" : "Switch to English"}>{english ? "RU" : "EN"}</button>
      </nav>
      <section className="artistAboutText">
        <h1 className="handCaption">{artistText(about.title, language)}</h1>
        <p>{artistText(about.text, language)}</p>
        {telegram && <a href={telegram.href} target="_blank" rel="noreferrer">{telegram.label}</a>}
        {about.photos.map((src, index) => (
          <ArtistImage key={`${src}-${index}`} src={src} alt={english ? "Photo of the artist" : "Фото автора"} />
        ))}
      </section>
    </main>
  );
}
