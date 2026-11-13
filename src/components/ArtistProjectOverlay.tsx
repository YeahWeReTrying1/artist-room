"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (gallery[1]) warmMedia(gallery[1].src);
  }, [project.id]);

  useEffect(() => {
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
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={onClose}
    >
      <button
        type="button"
        className="artistProjectClose"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <span className="artistProjectCloseIcon" aria-hidden="true" style={{ maskImage: `url("${publicUrl("/cross.svg")}")`, WebkitMaskImage: `url("${publicUrl("/cross.svg")}")` }} />
      </button>
      <div className="artistProjectScroll">
        <header className="artistProjectHeader">
          {project.title ? <h1 className="artistProjectTitle handCaption">{project.title}</h1> : null}
          {project.description?.trim() ? (
            <p className="artistProjectDescription">{project.description.trim()}</p>
          ) : null}
        </header>
        <div className="artistProjectStack">
          {gallery.map((item, index) => (
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
                /\.gif$/i.test(item.src) ? <ScrollGif src={item.src} alt={item.caption || project.title || ""}/> : <ArtistImage src={item.src} variant="full" alt={item.caption || project.title || ""} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
              )}
              {item.caption?.trim() ? (
                <figcaption className="artistProjectCaption handCaption">{item.caption.trim()}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
