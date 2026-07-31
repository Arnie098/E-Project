import { type ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronDown, LogOut, Menu, type LucideIcon } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type NavItem = { title: string; url: string; icon: LucideIcon };

export interface DashboardUser {
    name: string;
    role: string;
    avatar?: string;
}

interface Props {
    title: string;
    nav: NavItem[];
    user: DashboardUser;
    notifications?: number;
    showSearch?: boolean;
    children: ReactNode;
}

const topNav = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/' },
    { label: 'Learn', to: '/user', caret: true },
    { label: 'Repository', to: '/user/cultural-repository', caret: true },
    { label: 'About Us', to: '/' },
    { label: 'Contact', to: '/' },
];

export function DashboardLayout({ nav, user, children }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePage().url.split('?')[0];
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            {/* Top header — shared across public + dashboard */}
            <header className="sticky top-0 z-30 border-b border-border bg-background">
                <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
                    <button
                        className="rounded-md p-2 text-foreground hover:bg-accent"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <BrandLogo />
                    <nav className="mx-auto hidden items-center gap-7 lg:flex">
                        {topNav.map((n) => (
                            <Link
                                key={n.label}
                                href={n.to}
                                className="inline-flex items-center gap-1 text-[15px] font-medium text-foreground/85 hover:text-foreground"
                            >
                                {n.label}
                                {n.caret && <ChevronDown className="h-4 w-4 opacity-60" />}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-accent">
                                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="hidden text-left leading-tight sm:block">
                                    <div className="text-sm font-semibold text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.role}</div>
                                </div>
                                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/user/settings">Profile Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="w-full text-left">
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Light sidebar */}
                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background pt-20 transition-transform md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:translate-x-0 md:pt-0',
                        mobileOpen ? 'translate-x-0' : '-translate-x-full',
                    )}
                >
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {nav.map((item) => {
                            const active = pathname === item.url;
                            return (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors',
                                        active
                                            ? 'bg-foreground text-background'
                                            : 'text-foreground/75 hover:bg-accent hover:text-foreground',
                                    )}
                                >
                                    <item.icon className={cn('h-[18px] w-[18px] shrink-0')} />
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-t border-border p-3">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-foreground/75 hover:bg-accent hover:text-foreground"
                        >
                            <LogOut className="h-[18px] w-[18px]" />
                            <span>Log Out</span>
                        </Link>
                    </div>
                </aside>

                {/* Overlay mobile */}
                {mobileOpen && (
                    <button
                        className="fixed inset-0 z-30 bg-black/40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                    />
                )}

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                    <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
                        MANAYUN BAGOBO © 2026. All rights reserved.
                    </footer>
                </div>
            </div>
        </div>
    );
}

/* ---- Building blocks used inside every dashboard ---- */

export function WelcomeHero({ greeting, subtitle, image }: { greeting: string; subtitle: string; image: string }) {
    return (
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{greeting}</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">{subtitle}</p>
                </div>
                <div className="relative h-40 md:h-56">
                    <img
                        src={image}
                        alt="Bagobo cultural heritage"
                        className="absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_30%)]"
                    />
                </div>
            </div>
        </section>
    );
}

export type SummaryTile = {
    label: string;
    value: string;
    cta: string;
    icon: LucideIcon;
    tone: 'blue' | 'green' | 'purple' | 'amber' | 'rose';
    href: string;
    accent?: string;
};

const toneClass: Record<SummaryTile['tone'], string> = {
    blue: 'bg-tile-blue',
    green: 'bg-tile-green',
    purple: 'bg-tile-purple',
    amber: 'bg-tile-amber',
    rose: 'bg-tile-rose',
};

export function SummaryTiles({ tiles }: { tiles: SummaryTile[] }) {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tiles.map((t) => (
                <Link
                    key={t.label}
                    href={t.href}
                    className={cn('group rounded-2xl border border-black/5 p-5 transition-shadow hover:shadow-md', toneClass[t.tone])}
                >
                    <div className="flex items-start gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-foreground shadow-sm">
                            <t.icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-medium text-muted-foreground">{t.label}</div>
                            <div className={cn('mt-0.5 text-[26px] font-bold leading-tight', t.accent ?? 'text-foreground')}>{t.value}</div>
                        </div>
                    </div>
                    <div className="mt-4 border-t border-black/5 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                            {t.cta}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function PanelCard({
    title,
    action,
    className,
    children,
}: {
    title: string;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section className={cn('rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>
            <header className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                {action}
            </header>
            {children}
        </section>
    );
}
