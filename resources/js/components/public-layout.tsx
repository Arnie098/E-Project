import { type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';

const nav = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/' },
    { label: 'Learn', to: '/login' },
    { label: 'Repository', to: '/login' },
    { label: 'Dictionary', to: '/login' },
    { label: 'Events', to: '/login' },
    { label: 'About Us', to: '/' },
    { label: 'Contact', to: '/' },
];

export function PublicLayout({ children, showAuthButtons = true }: { children: ReactNode; showAuthButtons?: boolean }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                    <Link href="/">
                        <BrandLogo />
                    </Link>
                    <nav className="ml-6 hidden items-center gap-6 lg:flex">
                        {nav.map((n) => (
                            <Link
                                key={n.label}
                                href={n.to}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    {showAuthButtons && (
                        <div className="ml-auto flex items-center gap-2">
                            <Button asChild variant="outline" className="rounded-lg">
                                <Link href="/login">Log In</Link>
                            </Button>
                            <Button asChild className="rounded-lg">
                                <Link href="/register">Register</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1">{children}</div>

            <footer className="border-t border-border">
                <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
                    <p className="text-sm font-medium text-foreground/80">
                        Together, let's preserve our heritage and inspire future generations.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">© 2026 EPANAW BAGOBO. All rights reserved.</p>
                </div>
                {/* Tribal pattern band */}
                <div
                    className="h-8 w-full bg-primary"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.15) 6px 12px), repeating-linear-gradient(-45deg, transparent 0 6px, rgba(255,255,255,0.1) 6px 12px)',
                    }}
                    aria-hidden
                />
            </footer>
        </div>
    );
}
