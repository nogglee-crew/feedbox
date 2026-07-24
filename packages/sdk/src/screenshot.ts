import { toPng } from "html-to-image";

/**
 * 현재 화면을 PNG data URL로 캡처한다.
 * SDK 오버레이(data-feedbox 속성)는 캡처에서 제외한다.
 * 외부 이미지 CORS 등으로 실패할 수 있으므로 실패 시 null을 반환한다.
 */
export async function captureScreenshot(): Promise<string | null> {
  try {
    return await toPng(document.body, {
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-feedbox")),
      backgroundColor: "#ffffff",
      pixelRatio: 1,
      cacheBust: true,
    });
  } catch {
    return null;
  }
}
