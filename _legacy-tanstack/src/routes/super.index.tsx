import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, BookOpen, Building2, MessageSquare, ShieldCheck, Database, HardDriveDownload, BarChart3, Megaphone } from "lucide-react";
import { PanelCard, SummaryTiles, WelcomeHero, type SummaryTile } from "@/components/dashboard-layout";
import heroImg from "@/assets/heritage-hero.jpg";

export const Route = createFileRoute("/super/")({
  head: () => ({
    meta: [
      { title: "Super Admin — EPANAW BAGOBO" },
      { name: "description", content: "Monitor and maintain the entire system, manage administrators, and ensure system security." },
      { property: "og:title", content: "EPANAW BAGOBO Super Admin" },
      { property: "og:description", content: "System overview, roles, database, security, and site configuration." },
    ],
  }),
  component: SuperDashboard,
});

const tiles: SummaryTile[] = [
  { label: "Total Users", value: "1,245", cta: "View All Users", tone: "blue", icon: Users, href: "/super/users" },
  { label: "Total Learning Materials", value: "325", cta: "View All Materials", tone: "green", icon: BookOpen, href: "/super/content" },
  { label: "Repository Items", value: "892", cta: "View Repository", tone: "purple", icon: Building2, href: "/super/content" },
  { label: "Total Contributions", value: "278", cta: "View Contributions", tone: "amber", icon: MessageSquare, href: "/super/content" },
  { label: "System Status", value: "Healthy", cta: "View System Health", tone: "rose", icon: ShieldCheck, href: "/super/overview" },
];

function SuperDashboard() {
  return (
    <>
      <WelcomeHero
        greeting="Welcome back, Super Admin!"
        subtitle="Monitor and maintain the entire system, manage administrators, and ensure system security."
        image={heroImg}
      />
      <SummaryTiles tiles={tiles} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PanelCard title="User Role Distribution">
          <div className="flex items-center gap-6">
            <Donut />
            <ul className="flex-1 space-y-2 text-sm">
              <RoleRow color="oklch(0.55 0.18 250)" label="Administrators" value="15 (1.2%)" />
              <RoleRow color="oklch(0.65 0.15 160)" label="Content Managers" value="25 (2.0%)" />
              <RoleRow color="oklch(0.75 0.15 80)" label="Editors" value="45 (3.6%)" />
              <RoleRow color="oklch(0.5 0.02 260)" label="Learners" value="1,160 (93.3%)" />
            </ul>
          </div>
          <div className="mt-4 border-t border-border pt-3 text-sm font-semibold text-foreground">Total: 1,245 Users</div>
        </PanelCard>

        <PanelCard title="System Activity (Last 7 Days)" className="xl:col-span-1">
          <MiniLineChart />
        </PanelCard>

        <PanelCard title="Recent System Logs" action={<Link to="/super/logs" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}>
          <ul className="space-y-3 text-sm">
            {[
              { icon: BookOpen, text: "User admin.maria updated learning material", when: "May 20, 2025 · 10:45 AM" },
              { icon: Users, text: "New user registered: juandelacruz@example.com", when: "May 20, 2025 · 09:30 AM" },
              { icon: Database, text: "Database backup completed successfully", when: "May 20, 2025 · 02:00 AM" },
              { icon: ShieldCheck, text: "System login: Super Admin", when: "May 19, 2025 · 11:15 PM" },
            ].map((l, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary">
                  <l.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-foreground">{l.text}</div>
                  <div className="text-xs text-muted-foreground">{l.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Storage Usage">
          <div className="space-y-4">
            <StorageBar label="Storage Usage" hint="256 GB / 1 TB Used" pct={25.6} />
            <StorageBar label="Database Size" hint="240 GB" pct={24} tone="green" />
          </div>
        </PanelCard>

        <PanelCard title="Quick Actions" className="xl:col-span-1">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: "Add Administrator", icon: Users, href: "/super/users" },
              { label: "Manage Roles", icon: ShieldCheck, href: "/super/roles" },
              { label: "System Settings", icon: Building2, href: "/super/settings" },
              { label: "Backup Now", icon: HardDriveDownload, href: "/super/backup" },
              { label: "View Reports", icon: BarChart3, href: "/super/reports" },
              { label: "Security Scan", icon: ShieldCheck, href: "/super/security" },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.href}
                className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary">
                  <a.icon className="h-4 w-4" />
                </div>
                <span className="leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="System Announcements" action={<span className="text-xs font-semibold text-foreground">View All</span>}>
          <div className="rounded-lg bg-tile-blue p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Scheduled Maintenance</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  The system will undergo maintenance on May 25, 2025 from 12:00 AM to 3:00 AM.
                </p>
                <div className="mt-2 text-[11px] text-muted-foreground">May 20, 2025 · By Super Admin</div>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
    </>
  );
}

function RoleRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </li>
  );
}

function Donut() {
  const blue = "oklch(0.6 0.2 250)";
  const green = "oklch(0.65 0.15 160)";
  const amber = "oklch(0.78 0.15 80)";
  const purple = "oklch(0.6 0.18 300)";
  // Learners 93.3% blue is dominant, matching the mockup
  const bg = `conic-gradient(${blue} 0 335.9deg, ${green} 335.9deg 343.1deg, ${amber} 343.1deg 356.1deg, ${purple} 356.1deg 360deg)`;
  return (
    <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: bg }}>
      <div className="absolute inset-4 rounded-full bg-card" />
    </div>
  );
}

function MiniLineChart() {
  const values = [120, 150, 180, 210, 175, 160, 200];
  const labels = ["May 14", "May 15", "May 16", "May 17", "May 18", "May 19", "May 20"];
  const yTicks = [250, 200, 150, 100, 50, 0];
  const max = 250;
  const w = 100;
  const h = 100;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  return (
    <div className="flex gap-2">
      <div className="flex h-40 flex-col justify-between pr-1 text-[10px] text-muted-foreground">
        {yTicks.map((t) => <span key={t}>{t}</span>)}
      </div>
      <div className="min-w-0 flex-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" preserveAspectRatio="none">
          {yTicks.map((t) => (
            <line key={t} x1="0" x2={w} y1={h - (t / max) * h} y2={h - (t / max) * h} stroke="oklch(0.92 0.006 260)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          ))}
          <polyline points={points} fill="none" stroke="oklch(0.55 0.18 250)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {values.map((v, i) => (
            <circle key={i} cx={i * step} cy={h - (v / max) * h} r="1.5" fill="oklch(0.55 0.18 250)" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

function StorageBar({ label, hint, pct, tone = "blue" }: { label: string; hint: string; pct: number; tone?: "blue" | "green" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="text-xs text-muted-foreground">{hint}</div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={"h-full rounded-full " + (tone === "green" ? "bg-[oklch(0.6_0.15_155)]" : "bg-[oklch(0.55_0.18_250)]")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
