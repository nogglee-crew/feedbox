import { toCanvas } from "html-to-image";

/**
 * Vercel 서버리스 요청 본문 한도(4.5MB, base64 +33% 고려 시 원본 ~3MB)에 맞추기 위해
 * 긴 변 기준으로 다운스케일하고 JPEG로 압축한다.
 */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

function downscale(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  out.getContext("2d")?.drawImage(source, 0, 0, out.width, out.height);
  return out;
}

/**
 * 현재 화면을 JPEG data URL로 캡처한다.
 * SDK 오버레이(data-feedbox 속성)는 캡처에서 제외한다.
 * 외부 이미지 CORS 등으로 실패할 수 있으므로 실패 시 null을 반환한다.
 */
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
