/**
 * 공개 보드는 크롤러가 자주 방문하므로 page_view 계열 지표가 오염된다.
 * 인터랙션 이벤트는 봇이 발생시키지 않아 이 검사가 사실상 필요 없지만,
 * 같은 엔드포인트를 쓰므로 입구에서 한 번에 거른다.
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|preview|monitor|scrape|fetch|curl|wget|python-requests|axios|postman|lighthouse|pingdom|gpt|claude|anthropic|perplexity/i;

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}
