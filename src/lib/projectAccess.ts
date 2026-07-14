import type { Project } from "@/lib/types";

/** Сколько картинок/видео в галерее проекта (медиа + превью, без дублей). */
export function getProjectGallery(project: Project) {
  const items: Array<{ id: string; kind: string; src: string; caption?: string }> = [];
  const seen = new Set<string>();

  for (const item of project.media || []) {
    if (!item?.src || seen.has(item.src)) continue;
    seen.add(item.src);
    items.push({
      id: item.id,
      kind: item.kind,
      src: item.src,
      caption: item.caption || ""
    });
  }

  const previewIsGif = project.preview ? /\.gif$/i.test(project.preview) : false;

  if (project.preview && !seen.has(project.preview) && (items.length === 0 || !previewIsGif)) {
    items.push({
      id: `preview-${project.id}`,
      kind: /\.(mp4|webm|ogg|mov)$/i.test(project.preview) ? "video" : "image",
      src: project.preview,
      caption: ""
    });
  }

  return items;
}

/**
 * Открывается поверх главной, если:
 * — больше одного фото в галерее, или
 * — есть описание / подписи (есть что показать внутри проекта).
 * Одно фото без текста — только на сетке (lightbox).
 */
export function canOpenProject(project: Project): boolean {
  if (!project.slug?.trim()) return false;
  const gallery = getProjectGallery(project);
  if (gallery.length > 1) return true;
  if (project.description?.trim()) return true;
  if (gallery.some((item) => item.caption?.trim())) return true;
  return false;
}
