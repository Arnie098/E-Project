import { type ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';
import type { DashboardUser, NavItem } from '@/components/dashboard-layout';

interface Props {
    title: string;
    nav: NavItem[];
    user: DashboardUser;
    notifications?: number;
    children: ReactNode;
}

export function SidebarDashboardLayout({ title, nav, user, notifications, children }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePage().url.split('?')[0];
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Light sidebar (matches reference) */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="px-6 py-5">
                    <BrandLogo />
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
                    {nav.map((item) => {
                        const active = pathname === item.url;
                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium transition-colors',
                                    active
                                        ? 'bg-foreground text-background'
                                        : 'text-foreground/75 hover:bg-accent hover:text-foreground',
                                )}
                            >
                                <item.icon className="h-[18px] w-[18px] shrink-0" />
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
                        className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium text-foreground/75 hover:bg-accent hover:text-foreground"
                    >
                        <LogOut className="h-[18px] w-[18px]" />
                        <span>Log Out</span>
                    </Link>
                </div>
            </aside>

            {mobileOpen && (
                <button
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                />
            )}

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 border-b border-border bg-background">
                    <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                        <button
                            className="rounded-md p-2 text-foreground hover:bg-accent"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                        <div className="ml-auto flex items-center gap-4">
                            <button className="relative rounded-full p-2 text-foreground hover:bg-accent" aria-label="Notifications">
                                <Bell className="h-5 w-5" />
                                {notifications ? (
                                    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                                        {notifications}
                                    </span>
                                ) : null}
                            </button>
                            <div className="flex items-center gap-2.5">
                                <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground">
                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : initials}
                                </div>
                                <div className="hidden text-left leading-tight sm:block">
                                    <div className="text-sm font-semibold text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.role}</div>
                                </div>
                                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                <footer className="px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
                    EPANAW BAGOBO © 2025. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
