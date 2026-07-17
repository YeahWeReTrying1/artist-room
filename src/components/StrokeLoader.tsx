"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number; t?: number };
type Stroke = { id?: string; color?: string; width?: number; points: Point[] };
export type LoaderData = {
  version?: number;
  size?: number;
  background?: string;
  strokes?: Stroke[];
};

function strokeLength(stroke: Stroke) {
  const pts = stroke?.points || [];
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

function totalInkLength(strokes: Stroke[]) {
  return strokes.reduce((sum, s) => sum + strokeLength(s), 0);
}

function paintStrokesProgressive(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  size: number,
  progress: number,
  background?: string
) {
  const p = Math.max(0, Math.min(1, progress));
  if (background && background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  const total = totalInkLength(strokes) || 1;
  let budget = total * p;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of strokes) {
    const pts = stroke.points || [];
    if (pts.length < 2) continue;
    const sLen = strokeLength(stroke);
    if (budget <= 0) break;

    ctx.strokeStyle = stroke.color || "#111";
    ctx.lineWidth = Math.max(1, ((stroke.width || 3) / 400) * size);
    ctx.beginPath();
    ctx.moveTo(pts[0].x * size, pts[0].y * size);

    if (budget >= sLen) {
      for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x * size, pts[i].y * size);
      ctx.stroke();
      budget -= sLen;
      continue;
    }

    let walked = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const x0 = pts[i - 1].x * size;
      const y0 = pts[i - 1].y * size;
      const x1 = pts[i].x * size;
      const y1 = pts[i].y * size;
      const seg = Math.hypot(x1 - x0, y1 - y0);
      if (walked + seg >= budget) {
        const t = seg > 0 ? (budget - walked) / seg : 0;
        ctx.lineTo(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
        ctx.stroke();
        budget = 0;
        break;
      }
      ctx.lineTo(x1, y1);
      walked += seg;
    }
  }
}

const STORAGE_KEY = "bobkov-stroke-loader-seen";

type Props = {
  loader: LoaderData | null | undefined;
  storageKey?: string;
};

export function StrokeLoader({ loader, storageKey = STORAGE_KEY }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const displayRef = useRef(0);
  const targetRef = useRef(0);
  const doneRef = useRef(false);

  const strokes = loader?.strokes || [];
  const background = loader?.background || "#ffffff";

  useEffect(() => {
    if (!strokes.length) return;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [strokes.length, storageKey]);

  useEffect(() => {
    if (!visible) return;

    const onLoad = () => {
      targetRef.current = 1;
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      if (doneRef.current) return;
      const elapsed = now - start;
      // медленный «ползунок» до 85%, пока страница не готова
      const timeCreep = Math.min(0.85, elapsed / 5000);
      if (document.readyState === "complete") targetRef.current = 1;
      targetRef.current = Math.max(targetRef.current, timeCreep);

      displayRef.current += (targetRef.current - displayRef.current) * 0.08;
      if (targetRef.current >= 1 && displayRef.current > 0.992) {
        displayRef.current = 1;
      }
      setProgress(displayRef.current);

      const canvas = canvasRef.current;
      if (canvas) {
        const css = Math.min(320, Math.floor(window.innerWidth * 0.56), Math.floor(window.innerHeight * 0.48));
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== css * dpr) {
          canvas.width = css * dpr;
          canvas.height = css * dpr;
          canvas.style.width = `${css}px`;
          canvas.style.height = `${css}px`;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          paintStrokesProgressive(ctx, strokes, css, displayRef.current, background);
        }
      }

      if (displayRef.current >= 1 && document.readyState === "complete") {
        doneRef.current = true;
        setFading(true);
        try {
          sessionStorage.setItem(storageKey, "1");
        } catch {
          /* ignore */
        }
        window.setTimeout(() => setVisible(false), 420);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, [visible, strokes, background, storageKey]);

  if (!visible || !strokes.length) return null;

  const overlayBg =
    background && background !== "transparent" ? background : "#ffffff";

  return (
    <div
      className={`strokeLoader${fading ? " isDone" : ""}`}
      style={{ background: overlayBg }}
      aria-hidden="true"
    >
      <div className="strokeLoaderInner">
        <canvas ref={canvasRef} className="strokeLoaderCanvas" />
        <p className="strokeLoaderPercent">{Math.round(progress * 100)}%</p>
      </div>
    </div>
  );
}
