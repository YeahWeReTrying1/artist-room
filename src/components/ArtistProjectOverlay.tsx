"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { useArtistLanguage } from "@/components/ArtistLanguage";
import { artistText } from "@/lib/artistTranslations";
import { scrollFrames } from "@/lib/scrollFrames";
import { ScrollGif } from "@/components/ScrollGif";
import { ArtistImage } from "@/components/ArtistImage";
import { publicUrl } from "@/lib/siteAssets";
import { warmMedia } from "@/lib/mediaAssets";
import type { Project } from "@/lib/types";
import { getProjectGallery } from "@/lib/projectAccess";

function isVideoSrc(src: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

type Props = {
  project: Project;
  onClose: () => void;
};

export function ArtistProjectOverlay({ project, onClose }: Props) {
  const gallery = getProjectGallery(project);
  const { language } = useArtistLanguage();
  const english = language === "en";
  const title = artistText(project.title, language);
  const [zoom, setZoom] = useState(85);

  useEffect(() => {
    if (gallery[1]) warmMedia(gallery[1].src);
  }, [project.id]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = meta?.content;
    const previousBody = document.body.style.backgroundColor;
    const previousRoot = root.style.backgroundColor;
    root.dataset.artistProjectOpen = "true";
    root.style.backgroundColor = "#000000";
    document.body.style.backgroundColor = "#000000";
    if (meta) meta.content = "#000000";
    return () => {
      delete root.dataset.artistProjectOpen;
      root.style.backgroundColor = previousRoot;
      const background = root.style.getPropertyValue("--artist-page-bg").trim();
      document.body.style.backgroundColor = background || previousBody;
      if (meta) meta.content = background || previousTheme || "#c5c7d5";
    };
  }, []);


  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="artistProjectOverlay"
      style={{ "--artwork-width": `${zoom}%`, "--artwork-height": `${zoom * 1.6}svh` } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={title || (english ? "Artwork gallery" : "Галерея работ")}
      onClick={onClose}
    >
      <button
        type="button"
        className="artistProjectClose"
        onClick={event => { event.stopPropagation(); onClose(); }}
        aria-label={english ? "Close" : "Закрыть"}
      >
        <span className="artistProjectCloseIcon" aria-hidden="true" style={{ maskImage: `url("${publicUrl("/cross.svg")}")`, WebkitMaskImage: `url("${publicUrl("/cross.svg")}")` }} />
      </button>
      <label className="artistProjectZoom" onClick={event => event.stopPropagation()}>
        <span aria-hidden="true">−</span>
        <input
          type="range"
          min={25}
          max={100}
          value={zoom}
          aria-label={english ? "Artwork size" : "Размер работ"}
          aria-valuetext={`${zoom}%`}
          onChange={event => setZoom(Number(event.currentTarget.value))}
        />
        <span aria-hidden="true">+</span>
      </label>
      <div className="artistProjectScroll">
        <header className="artistProjectHeader">
          {title ? <h1 className="artistProjectTitle handCaption">{title}</h1> : null}
          {project.description?.trim() ? (
            <p className="artistProjectDescription">{artistText(project.description, language)}</p>
          ) : null}
        </header>
        <div className="artistProjectStack">
          {gallery.map((item, index) => {
            const caption = artistText(item.caption, language);
            return (
            <figure key={item.id} className="artistProjectFigure">
              {item.kind === "video" || isVideoSrc(item.src) ? (
                <video
                  src={item.src}
                  controls
                  playsInline
                  preload="metadata"
                  onClick={(event) => event.stopPropagation()}
                />
              ) : (
                /\.gif$/i.test(item.src) && scrollFrames(item.src).length ? <ScrollGif src={item.src} alt={caption || title}/> : <ArtistImage src={item.src} variant="full" alt={caption || title} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
              )}
              {caption ? (
                <figcaption className="artistProjectCaption handCaption">{caption}</figcaption>
              ) : null}
            </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
