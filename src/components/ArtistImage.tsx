"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { mediaAsset } from "@/lib/mediaAssets";
import { publicUrl } from "@/lib/siteAssets";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; variant?: "preview" | "full" };
export function ArtistImage({ src, variant = "preview", sizes, loading = "lazy", decoding = "async", ...props }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [enabled, setEnabled] = useState(loading === "eager");
  const asset = mediaAsset(src);
  const variants = asset?.variants || [];
  const candidates = variant === "full" && asset ? [...variants.filter(item => item.width < (asset.fullWidth || asset.width)), { src: asset.full, width: asset.fullWidth || asset.width }] : variants;
  const fallback = variant === "full" ? asset?.full : variants[1]?.src || variants[0]?.src;
  const shouldLoad = enabled || !asset;
  useEffect(() => {
    if (enabled || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setEnabled(true); observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled]);
  return <img {...props} ref={ref} width={asset?.width} height={asset?.height} src={shouldLoad ? fallback ? publicUrl(fallback) : src : undefined}
    srcSet={shouldLoad && candidates.length ? candidates.map(item => `${publicUrl(item.src)} ${item.width}w`).join(", ") : undefined}
    sizes={sizes || (variant === "preview" ? "(max-width: 900px) calc(100vw - 24px), 35vw" : "(max-width: 900px) calc(100vw - 24px), 1160px")}
    loading={enabled ? "eager" : loading} decoding={decoding}
    onError={(event) => { if (event.currentTarget.src !== new URL(src, window.location.href).href) { event.currentTarget.removeAttribute("srcset"); event.currentTarget.src = src; } props.onError?.(event); }}
  />;
}
