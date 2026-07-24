const escape = (value: string): string =>
  typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function segment(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const parent = el.parentElement;
  if (!parent) return tag;
  const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  if (siblings.length === 1) return tag;
  return `${tag}:nth-of-type(${siblings.indexOf(el) + 1})`;
}

/**
 * 요소를 다시 찾을 수 있는 CSS selector를 생성한다.
 * 우선순위: id → data-testid → 고유 attribute 조합 → DOM 경로
 */
export function buildSelector(el: Element): string {
  if (el.id) {
    const s = `#${escape(el.id)}`;
    if (isUnique(s)) return s;
  }

  const testId = el.getAttribute("data-testid");
  if (testId) {
    const s = `[data-testid="${testId}"]`;
    if (isUnique(s)) return s;
  }

  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.body && current !== document.documentElement) {
    if (current.id) {
      parts.unshift(`#${escape(current.id)}`);
      break;
    }
    parts.unshift(segment(current));
    current = current.parentElement;
  }
  const selector = parts.join(" > ");
  return selector || el.tagName.toLowerCase();
}

/** 이슈 목록에서 사람이 알아볼 수 있게 요소 텍스트를 요약한다. */
export function elementText(el: Element): string | null {
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
  if (!text) return null;
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}
