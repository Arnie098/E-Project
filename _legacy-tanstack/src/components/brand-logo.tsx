import { cn } from "@/lib/utils";

export function BrandMark({ className, invert = false }: { className?: string; invert?: boolean }) {
  const stroke = invert ? "white" : "currentColor";
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 2 L38 20 L20 38 L2 20 Z" />
      <path d="M20 8 L32 20 L20 32 L8 20 Z" />
      <path d="M20 14 L26 20 L20 26 L14 20 Z" fill={stroke} />
    </svg>
  );
}

export function BrandLogo({
  className,
  invert = false,
  tagline = true,
}: {
  className?: string;
  invert?: boolean;
  tagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark invert={invert} />
      <div className="leading-tight">
        <div className={cn("text-sm font-black tracking-tight", invert ? "text-white" : "text-foreground")}>
          EPANAW
        </div>
        <div className={cn("text-xs font-medium tracking-[0.2em]", invert ? "text-white/60" : "text-muted-foreground")}>
          BAGOBO
        </div>
        {tagline && (
          <div className={cn("mt-0.5 text-[10px] font-medium", invert ? "text-white/50" : "text-muted-foreground")}>
            Preserve. Revitalize. Inspire.
          </div>
        )}
      </div>
    </div>
  );
}

