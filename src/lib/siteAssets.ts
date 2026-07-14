import type { AboutData, Project } from "@/lib/types";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** Абсолютный URL статики с учётом basePath (GitHub Pages project site). */
export function publicUrl(src: string | undefined | null): string {
  if (!src) return "";
  if (/^https?:\/\//.test(src) || src.startsWith("data:")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${basePath}${path}`;
}

export function mapProjectForSite(project: Project): Project {
  return {
    ...project,
    preview: publicUrl(project.preview),
    media: (project.media || []).map((item) => ({
      ...item,
      src: publicUrl(item.src)
    }))
  };
}

export function mapAboutForSite(about: AboutData): AboutData {
  return {
    ...about,
    logo: about.logo ? publicUrl(about.logo) : about.logo,
    photos: (about.photos || []).map((src) => publicUrl(src)),
    roomZones: (about.roomZones || []).map((zone) => ({
      ...zone,
      src: publicUrl(zone.src)
    }))
  };
}

export function getSiteBasePath(): string {
  return basePath;
}
