import { toCanvas } from "html-to-image";

// Leaves headroom under Vercel's 4.5 MB body limit after base64 expansion.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;
const DANGER_BORDER = "#dc2626";
const DANGER_FILL = "rgba(220, 38, 38, 0.12)";

export interface ScreenshotHighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function downscale(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  out.getContext("2d")?.drawImage(source, 0, 0, out.width, out.height);
  return out;
}

function drawHighlight(canvas: HTMLCanvasElement, rect: ScreenshotHighlightRect): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const x = Math.max(0, rect.left + window.scrollX);
  const y = Math.max(0, rect.top + window.scrollY);
  const width = Math.min(rect.width, canvas.width - x);
  const height = Math.min(rect.height, canvas.height - y);
  if (width <= 0 || height <= 0) return;

  ctx.save();
  ctx.fillStyle = DANGER_FILL;
  ctx.strokeStyle = DANGER_BORDER;
  ctx.lineWidth = 4;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
  ctx.restore();
}

/** Excludes FEEDBOX UI and returns null when cross-origin content blocks capture. */
export async function captureScreenshot(highlightRect?: ScreenshotHighlightRect): Promise<string | null> {
  try {
    const canvas = await toCanvas(document.body, {
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-feedbox")),
      backgroundColor: "#ffffff",
      pixelRatio: 1,
      cacheBust: true,
    });
    if (highlightRect) drawHighlight(canvas, highlightRect);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(canvas.width, canvas.height));
    const target = scale < 1 ? downscale(canvas, scale) : canvas;
    return target.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return null;
  }
}
