import fs from "node:fs/promises";
import path from "node:path";
import type { AboutData, Project } from "@/lib/types";

const STATIC_ASSETS = new Set(["/placeholder.svg", "/logo.svg"]);

type ProjectWithLegacy = Project & {
  mediaAppend?: { src?: string };
};

export function isManagedUpload(src: string | undefined | null): src is string {
  if (!src || typeof src !== "string") return false;
  if (STATIC_ASSETS.has(src)) return false;
  return src.startsWith("/uploads/");
}

export function uploadUrlToFilePath(src: string): string | null {
  if (!isManagedUpload(src)) return null;
  const filename = path.basename(src);
  if (!filename || filename.includes("..")) return null;
  return path.join(process.cwd(), "public", "uploads", filename);
}

export function collectProjectUploadUrls(project: ProjectWithLegacy): string[] {
  const urls: string[] = [];
  if (isManagedUpload(project.preview)) urls.push(project.preview);
  for (const item of project.media || []) {
    if (isManagedUpload(item.src)) urls.push(item.src);
  }
  if (isManagedUpload(project.mediaAppend?.src)) urls.push(project.mediaAppend!.src!);
  return [...new Set(urls)];
}

export function collectAllReferencedUploads(projects: Project[], about?: AboutData): Set<string> {
  const refs = new Set<string>();
  for (const project of projects) {
    for (const url of collectProjectUploadUrls(project)) refs.add(url);
  }
  if (about) {
    for (const photo of about.photos || []) {
      if (isManagedUpload(photo)) refs.add(photo);
    }
    if (isManagedUpload(about.logo)) refs.add(about.logo);
  }
  return refs;
}

export async function deleteUploadFile(src: string): Promise<boolean> {
  const filepath = uploadUrlToFilePath(src);
  if (!filepath) return false;
  try {
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return false;
    throw error;
  }
}

export async function deleteOrphanedUploads(
  urls: string[],
  projects: Project[],
  about: AboutData
): Promise<string[]> {
  const referenced = collectAllReferencedUploads(projects, about);
  const deleted: string[] = [];
  for (const url of urls) {
    if (referenced.has(url)) continue;
    if (await deleteUploadFile(url)) deleted.push(url);
  }
  return deleted;
}
