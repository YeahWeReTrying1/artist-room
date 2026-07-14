"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { ArtistProjectOverlay } from "@/components/ArtistProjectOverlay";
import { CardReveal } from "@/components/CardReveal";
import { SiteNav } from "@/components/SiteNav";
import {
  buildStackedPlacements,
  getGridRowCount,
  gridStyle,
  INTRO_COL_SPAN,
  INTRO_COL,
  INTRO_ROW_SPAN,
  resolveProjectGrid
} from "@/lib/grid";
import { canOpenProject } from "@/lib/projectAccess";
import { ROOM_ZONE_META, type AboutData, type Project } from "@/lib/types";

function isVideoPreview(src: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

function isGifPreview(src: string) {
  return /\.gif$/i.test(src);
}

type Props = {
  projects: Project[];
  about: AboutData;
};

type Rect = { top: number; left: number; width: number; height: number };
type ZoomState = {
  open: boolean;
  index: number;
  sourceId: string;
  rect: Rect;
  opacity: number;
  closing: boolean;
};

const FALLBACK_TEXT =
  "рисую, коллекционирую странные штуки и живу среди собственных картин, скетчей и случайных находок. это не витрина — это комната.";

const FALLBACK_LINKS = [
  { label: "bobkov.web", href: "https://bobkov.web" },
  { label: "Telegram", href: "https://t.me/DeMaXiTo" }
];

const LIGHTBOX_SWIPE_PX = 56;

function getLightboxPadding() {
  if (typeof window === "undefined") return { x: 24, top: 24, bottom: 24 };
  const mobile = window.matchMedia("(max-width: 640px)").matches;
  return mobile ? { x: 18, top: 24, bottom: 88 } : { x: 24, top: 24, bottom: 24 };
}

function fitIntoViewport(width: number, height: number, pad = getLightboxPadding()): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.max(100, vw - pad.x * 2);
  const maxH = Math.max(100, vh - pad.top - pad.bottom);
  const ratio = Math.min(maxW / width, maxH / height, 1);
  const w = Math.round(width * ratio);
  const h = Math.round(height * ratio);
  return {
    left: Math.round((vw - w) / 2),
    top: Math.round(pad.top + (vh - pad.top - pad.bottom - h) / 2),
    width: w,
    height: h
  };
}

export function HomeContent({ projects, about }: Props) {
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  const lightboxTouchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressBackdropClickRef = useRef(false);
  const lightboxSkipNextRefitRef = useRef(true);

  const stacked = buildStackedPlacements(projects);
  const rowCount = getGridRowCount(projects);
  const links = about.links?.length ? about.links : FALLBACK_LINKS;
  const introText = about.text?.trim() || FALLBACK_TEXT;
  const roomZones = about.roomZones?.filter((zone) => zone.src) || [];
  const openProject = projects.find((project) => project.id === openProjectId) || null;

  const lightboxItems = useMemo(() => {
    const zones = roomZones.map((zone) => {
      const meta = ROOM_ZONE_META.find((item) => item.key === zone.key);
      return {
        id: zone.id,
        src: zone.src,
        title: zone.label || meta?.label || zone.key,
        caption: ""
      };
    });
    const singles = projects
      .filter((project) => !canOpenProject(project))
      .filter((project) => project.preview && !isVideoPreview(project.preview))
      .map((project) => ({
        id: project.id,
        src: project.preview,
        title: project.title || "",
        caption: ""
      }));
    return [...zones, ...singles];
  }, [projects, roomZones]);

  const getThumbRect = (id: string): Rect | null => {
    const el = document.querySelector(`[data-zoom-id="${id}"] img`) as HTMLImageElement | null;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  };

  const openZoom = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    const img = event.currentTarget.querySelector("img");
    if (!img) return;
    const startRect = img.getBoundingClientRect();
    const openIndex = lightboxItems.findIndex((item) => item.id === id);
    if (openIndex < 0) return;
    const naturalWidth = img.naturalWidth || startRect.width;
    const naturalHeight = img.naturalHeight || startRect.height;
    const targetRect = fitIntoViewport(naturalWidth, naturalHeight);

    setZoom({
      open: true,
      index: openIndex,
      sourceId: id,
      rect: {
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height
      },
      opacity: 1,
      closing: false
    });

    requestAnimationFrame(() => {
      setZoom((prev) => (prev ? { ...prev, rect: targetRect } : prev));
    });
  };

  const goPrev = useCallback(() => {
    setZoom((prev) => {
      if (!prev || lightboxItems.length === 0) return prev;
      const nextIndex = prev.index === 0 ? lightboxItems.length - 1 : prev.index - 1;
      return { ...prev, index: nextIndex, sourceId: lightboxItems[nextIndex].id };
    });
  }, [lightboxItems]);

  const goNext = useCallback(() => {
    setZoom((prev) => {
      if (!prev || lightboxItems.length === 0) return prev;
      const nextIndex = prev.index === lightboxItems.length - 1 ? 0 : prev.index + 1;
      return { ...prev, index: nextIndex, sourceId: lightboxItems[nextIndex].id };
    });
  }, [lightboxItems]);

  const closeZoom = useCallback(() => {
    setZoom((prev) => {
      if (!prev) return prev;
      const endRect = getThumbRect(prev.sourceId);
      if (!endRect) return { ...prev, opacity: 0, closing: true };
      return { ...prev, rect: endRect, closing: true };
    });
    window.setTimeout(() => setZoom(null), 260);
  }, []);

  useEffect(() => {
    if (!zoom?.open || openProject) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
      else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoom?.open, openProject, closeZoom, goPrev, goNext]);

  useEffect(() => {
    if (!zoom) lightboxSkipNextRefitRef.current = true;
  }, [zoom]);

  useEffect(() => {
    if (!zoom?.open || zoom.closing || lightboxItems.length === 0 || openProject) return;
    const item = lightboxItems[zoom.index];
    if (!item) return;
    if (lightboxSkipNextRefitRef.current) {
      lightboxSkipNextRefitRef.current = false;
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const targetRect = fitIntoViewport(img.naturalWidth, img.naturalHeight);
      setZoom((prev) => {
        if (!prev || prev.closing || prev.index !== zoom.index) return prev;
        return { ...prev, rect: targetRect };
      });
    };
    img.src = item.src;
  }, [zoom?.index, zoom?.open, zoom?.closing, lightboxItems, openProject]);

  const onLightboxTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return;
    lightboxTouchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const onLightboxTouchEnd = (event: TouchEvent) => {
    const start = lightboxTouchStart.current;
    lightboxTouchStart.current = null;
    if (!start || lightboxItems.length < 2) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    if (Math.abs(dx) < LIGHTBOX_SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) return;
    suppressBackdropClickRef.current = true;
    window.setTimeout(() => {
      suppressBackdropClickRef.current = false;
    }, 350);
    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div className="siteShell siteShell--artist">
      <SiteNav />

      {roomZones.length > 0 ? (
        <section className="roomZones" aria-label="Зоны комнаты">
          {roomZones.map((zone) => {
            const meta = ROOM_ZONE_META.find((item) => item.key === zone.key);
            const label = zone.label || meta?.label || zone.key;
            return (
              <figure key={zone.id} className="roomZoneCard">
                <button
                  type="button"
                  className="roomZoneZoomButton"
                  data-zoom-id={zone.id}
                  onClick={(event) => openZoom(zone.id, event)}
                  aria-label={`Открыть крупнее: ${label}`}
                >
                  <img src={zone.src} alt={label} loading="lazy" />
                </button>
                <figcaption className="handCaption">{label}</figcaption>
              </figure>
            );
          })}
        </section>
      ) : null}

      <main
        className="editorialGrid"
        style={{ "--grid-rows": String(Math.max(rowCount, 4)) } as CSSProperties}
      >
        <section
          className="introBlock"
          style={{
            gridColumn: `${INTRO_COL} / span ${INTRO_COL_SPAN}`,
            gridRow: `1 / span ${INTRO_ROW_SPAN}`
          }}
        >
          <p className="introText">{introText}</p>
          <div className="introLinks">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {projects.map((project) => {
          const grid = resolveProjectGrid(project, stacked.get(project.id)!);
          const openable = canOpenProject(project);
          const canZoom = !openable && Boolean(project.preview) && !isVideoPreview(project.preview);

          return (
            <CardReveal key={project.id} className="gridProject" style={gridStyle(grid)}>
              <div className={`gridProjectMedia${isGifPreview(project.preview) ? " isGifPreview" : ""}`}>
                {openable ? (
                  <button
                    type="button"
                    className="gridProjectZoomButton"
                    onClick={() => setOpenProjectId(project.id)}
                    aria-label={`Открыть проект: ${project.title || "работа"}`}
                  >
                    {isVideoPreview(project.preview) ? (
                      <video src={project.preview} autoPlay loop muted playsInline preload="metadata" />
                    ) : (
                      <img src={project.preview} alt={project.title || "работа"} />
                    )}
                  </button>
                ) : canZoom ? (
                  <button
                    type="button"
                    className="gridProjectZoomButton isLightbox"
                    data-zoom-id={project.id}
                    onClick={(event) => openZoom(project.id, event)}
                    aria-label={`Открыть крупнее: ${project.title || "работа"}`}
                  >
                    <img src={project.preview} alt={project.title || "работа"} />
                  </button>
                ) : isVideoPreview(project.preview) ? (
                  <video src={project.preview} autoPlay loop muted playsInline preload="metadata" />
                ) : (
                  <img src={project.preview} alt={project.title || "работа"} />
                )}
              </div>
              {project.title ? (
                openable ? (
                  <button
                    type="button"
                    className="gridProjectTitle gridProjectTitleBtn"
                    onClick={() => setOpenProjectId(project.id)}
                  >
                    {project.title}
                  </button>
                ) : (
                  <p className="gridProjectTitle">{project.title}</p>
                )
              ) : null}
            </CardReveal>
          );
        })}
      </main>

      {openProject ? (
        <ArtistProjectOverlay project={openProject} onClose={() => setOpenProjectId(null)} />
      ) : null}

      {zoom && !openProject ? (
        <div
          className="projectLightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (suppressBackdropClickRef.current) return;
            closeZoom();
          }}
          onTouchStart={onLightboxTouchStart}
          onTouchEnd={onLightboxTouchEnd}
          onTouchCancel={() => {
            lightboxTouchStart.current = null;
          }}
        >
          <button
            type="button"
            className="projectLightboxNav projectLightboxNavPrev"
            aria-label="Предыдущее изображение"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
          >
            ←
          </button>
          <img
            className={`projectLightboxImage ${zoom.closing ? "isClosing" : ""}`}
            src={lightboxItems[zoom.index]?.src}
            alt={lightboxItems[zoom.index]?.title}
            style={{
              top: zoom.rect.top,
              left: zoom.rect.left,
              width: zoom.rect.width,
              height: zoom.rect.height,
              opacity: zoom.opacity
            }}
          />
          <button
            type="button"
            className="projectLightboxNav projectLightboxNavNext"
            aria-label="Следующее изображение"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
          >
            →
          </button>
          {lightboxItems[zoom.index]?.title ? (
            <p className="artistLightboxCaption handCaption">{lightboxItems[zoom.index].title}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
