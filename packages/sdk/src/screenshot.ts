import { toCanvas } from "html-to-image";

// Leaves headroom under Vercel's 4.5 MB body limit after base64 expansion.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

function downscale(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  out.getContext("2d")?.drawImage(source, 0, 0, out.width, out.height);
  return out;
}

/** Excludes FEEDBOX UI and returns null when cross-origin content blocks capture. */
export async function captureScreenshot(): Promise<string | null> {
  try {
    const canvas = await toCanvas(document.body, {
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-feedbox")),
      backgroundColor: "#ffffff",
      pixelRatio: 1,
      cacheBust: true,
    });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(canvas.width, canvas.height));
    const target = scale < 1 ? downscale(canvas, scale) : canvas;
    return target.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return null;
  }
}
