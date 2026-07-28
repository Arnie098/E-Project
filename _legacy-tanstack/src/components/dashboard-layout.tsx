import { type ReactNode, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut, Menu, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  { label: "Home", to: "/" as const },
  { label: "About", to: "/" as const },
  { label: "Learn", to: "/user" as const, caret: true },
  { label: "Repository", to: "/user/cultural-repository" as const, caret: true },
  { label: "About Us", to: "/" as const },
  { label: "Contact", to: "/" as const },
];

export function DashboardLayout({
  title: _title,
  nav,
  user,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Top header — shared across public + dashboard */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            className="rounded-md p-2 text-foreground hover:bg-accent md:hidden"
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
                to={n.to}
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
                  {initials}
                </div>
                <div className="hidden text-left leading-tight sm:block">
                  <div className="text-sm font-semibold text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch view (demo)</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link to="/user">User Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin">Admin Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/super">Super Admin Dashboard</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/">Log out</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Light sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background pt-20 transition-transform md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:translate-x-0 md:pt-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {nav.map((item) => {
              const active = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/75 hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0")} />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-foreground/75 hover:bg-accent hover:text-foreground"
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
            EPANAW BAGOBO © 2026. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ---- Building blocks used inside every dashboard ---- */

export function WelcomeHero({
  greeting,
  subtitle,
  image,
}: {
  greeting: string;
  subtitle: string;
  image: string;
}) {
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
  tone: "blue" | "green" | "purple" | "amber" | "rose";
  href: string;
};

const toneClass: Record<SummaryTile["tone"], string> = {
  blue: "bg-tile-blue",
  green: "bg-tile-green",
  purple: "bg-tile-purple",
  amber: "bg-tile-amber",
  rose: "bg-tile-rose",
};

export function SummaryTiles({ tiles }: { tiles: SummaryTile[] }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {tiles.map((t) => (
        <Link
          key={t.label}
          to={t.href}
          className={cn(
            "group rounded-2xl border border-border p-5 transition-shadow hover:shadow-md",
            toneClass[t.tone],
          )}
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/80 text-foreground shadow-sm">
            <t.icon className="h-5 w-5" />
          </div>
          <div className="mt-4 text-xs font-medium text-muted-foreground">{t.label}</div>
          <div className="mt-1 text-2xl font-bold leading-tight text-foreground">{t.value}</div>
          <div className="mt-4 flex items-center justify-between border-t border-white/60 pt-3 text-xs font-semibold text-foreground/80">
            <span>{t.cta}</span>
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
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
    <section className={cn("rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}
