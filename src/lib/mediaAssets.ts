import manifest from "../../data/media-assets.json";
import { getSiteBasePath, publicUrl } from "@/lib/siteAssets";

type Asset = { width: number; height: number; animated: boolean; full: string; fullWidth?: number; variants: Array<{ src: string; width: number }> };
const assets = manifest as Record<string, Asset>;
export function mediaAsset(src: string) {
  const base = getSiteBasePath();
  return assets[base && src.startsWith(`${base}/`) ? src.slice(base.length) : src];
}
export function fullMediaUrl(src: string) {
  const asset = mediaAsset(src);
  return asset ? publicUrl(asset.full) : src;
}

const warmed = new Map<string, HTMLImageElement>();
export function warmMedia(src: string) {
  const asset = mediaAsset(src);
  const target = typeof window === "undefined" ? 1280 : Math.min(window.innerWidth - 24, 1160) * Math.min(window.devicePixelRatio || 1, 2);
  const candidates = asset ? [...asset.variants, { src: asset.full, width: asset.fullWidth || asset.width }].sort((a, b) => a.width - b.width) : [];
  const selected = candidates.find(item => item.width >= target) || candidates[candidates.length - 1];
  const url = selected ? publicUrl(selected.src) : src;
  if (typeof Image === "undefined" || warmed.has(url) || !/\.(gif|webp|png|jpe?g)(?:\?|$)/i.test(url)) return;
  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = "low";
  image.src = url;
  warmed.set(url, image);
  // Keep a small cache for pointer intent and adjacent gallery frames.
  if (warmed.size > 8) warmed.delete(warmed.keys().next().value!);
}
