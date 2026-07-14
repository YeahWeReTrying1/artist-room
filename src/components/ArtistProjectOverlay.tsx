"use client";

import { useEffect } from "react";
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
        ×
      </button>
      <div className="artistProjectScroll">
        <header className="artistProjectHeader">
          {project.title ? <h1 className="artistProjectTitle handCaption">{project.title}</h1> : null}
          {project.description?.trim() ? (
            <p className="artistProjectDescription">{project.description.trim()}</p>
          ) : null}
        </header>
        <div className="artistProjectStack">
          {gallery.map((item) => (
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
                <img src={item.src} alt={item.caption || project.title || ""} loading="lazy" />
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
