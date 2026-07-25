// This helper joins classes but does not resolve conflicting utilities.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
