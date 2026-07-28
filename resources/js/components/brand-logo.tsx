import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function BrandMark({ className, invert = false }: { className?: string; invert?: boolean }) {
    const stroke = invert ? 'white' : 'currentColor';
    return (
        <svg
            viewBox="0 0 40 40"
            className={cn('h-9 w-9', className)}
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
    const settings = (usePage().props as { settings?: { siteName?: string; tagline?: string } }).settings;
    const name = settings?.siteName ?? 'EPANAW BAGOBO';
    const tag = settings?.tagline ?? 'Preserve. Revitalize. Inspire.';

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <BrandMark invert={invert} className="h-11 w-11 shrink-0" />
            <div className="leading-none">
                <div className={cn('text-xl font-black tracking-tight sm:text-[22px]', invert ? 'text-white' : 'text-foreground')}>
                    {name}
                </div>
                {tagline && tag && (
                    <div className={cn('mt-1 text-[11px] font-medium', invert ? 'text-white/60' : 'text-muted-foreground')}>
                        {tag}
                    </div>
                )}
            </div>
        </div>
    );
}
