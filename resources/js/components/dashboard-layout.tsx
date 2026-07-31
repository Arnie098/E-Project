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
                            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl