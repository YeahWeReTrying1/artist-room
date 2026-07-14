"use client";

import { useEffect, useMemo, useState } from "react";
import type { AboutData } from "@/lib/types";
import { publicUrl } from "@/lib/siteAssets";

type Props = {
  about: AboutData;
};

export function AboutPageClient({ about }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const value = max <= 0 ? 0 : window.scrollY / max;
      setProgress(value);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentPhoto = useMemo(() => {
    if (!about.photos.length) {
      return publicUrl("/placeholder.svg");
    }
    const idx = Math.min(
      about.photos.length - 1,
      Math.floor(progress * about.photos.length)
    );
    return about.photos[idx];
  }, [about.photos, progress]);

  return (
    <main className="aboutWrap">
      <section className="aboutInner">
        <img className="aboutPhoto" src={currentPhoto} alt="Фото автора" />
        <h1>{about.title}</h1>
        <p>{about.text}</p>
      </section>
    </main>
  );
}
