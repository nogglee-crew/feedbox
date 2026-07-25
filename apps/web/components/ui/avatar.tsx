import { cn } from "./cn";

export function Avatar({
  name,
  src,
  ring = false,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  ring?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-6";
  const shape = cn(sizeClass, "shrink-0 rounded-full", ring && "ring-2 ring-surface", className);

  if (src) {
    return (
      // Google avatars require a no-referrer policy.
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
