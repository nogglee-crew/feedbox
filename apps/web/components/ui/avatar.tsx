import { cn } from "./cn";

/**
 * 프로필 사진. 이미지가 없으면 이니셜로 대체한다.
 * 겹쳐 놓을 때 서로 분리돼 보이도록 표면색 링을 두른다.
 */
export function Avatar({
  name,
  src,
  ring = false,
  className,
}: {
  /** 접근성 이름 겸 이니셜 소스 */
  name: string;
  src?: string | null;
  ring?: boolean;
  className?: string;
}) {
  const shape = cn("size-7 shrink-0 rounded-full", ring && "ring-2 ring-surface", className);

  if (src) {
    return (
      // Google 프로필 이미지는 referrer 정책 때문에 no-referrer가 필요하다
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} title={name} referrerPolicy="no-referrer" className={shape} />
    );
  }

  return (
    <span
      title={name}
      className={cn(
        shape,
        "flex items-center justify-center bg-surface-muted text-xs font-bold text-muted",
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
