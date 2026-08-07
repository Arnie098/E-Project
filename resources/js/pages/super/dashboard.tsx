import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Database,
    FilePen,
    Landmark,
    Megaphone,
    MessageSquare,
    Settings,
    Shield,
    ShieldCheck,
    UploadCloud,
    UserCog,
    UserPlus,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard, SummaryTiles, WelcomeHero, type SummaryTile } from '@/components/dashboard-layout';
import heroImg from '@/assets/heritage-hero.jpg';

interface Role {
    label: string;
    value: number;
    percent: string;
    tone: string;
}

interface Log {
    text: string;
    icon: string;
    tone: string;
    when: string;
}

interface Props {
    stats: { totalUsers: number; learningMaterials: number; repositoryItems: number; contributions: number };
    roleDistribution: Role[];
    totalUsers: number;
    logs: Log[];
    announcement: { title: string; body: string; when: string; author: string };
}

const toneHex: Record<string, string> = {
    blue: 'oklch(0.55 0.18 250)',
    green: 'oklch(0.62 0.15 155)',
    amber: 'oklch(0.78 0.15 80)',
    purple: 'oklch(0.55 0.18 300)',
    blue2: 'oklch(0.62 0.19 255)',
};

const logIcons: Record<string, LucideIcon> = {
    'file-pen': FilePen,
    'user-plus': UserPlus,
    database: Database,
    'shield-check': ShieldCheck,
    'user-cog': UserCog,
};

const logTint: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
};

export default function SuperDashboard({ stats, roleDistribution, totalUsers, logs, announcement }: Props) {
    const tiles: SummaryTile[] = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), cta: 'View All Users', tone: 'blue', icon: Users, href: '/super/users' },
        { label: 'Total Learning Materials', value: String(stats.learningMaterials), cta: 'View All Materials', tone: 'green', icon: BookOpen, href: '/super/content' },
        { label: 'Repository Items', value: String(stats.repositoryItems), cta: 'View Repository', tone: 'purple', icon: Landmark, href: '/super/content' },
        { label: 'Total Contributions', value: String(stats.contributions), cta: 'View Contributions', tone: 'amber', icon: MessageSquare, href: '/super/content' },
        { label: 'System Status', value: 'Healthy', cta: 'View System Health', tone: 'rose', icon: ShieldCheck, href: '/super/overview', accent: 'text-emerald-600' },
    ];

    return (
        <SuperShell>
            <Head title="Super Admin — MANAYUN BAGOBO" />
            <WelcomeHero
                greeting="Welcome back, Super Admin! 👋"
                subtitle="Monitor and maintain the entire system, manage administrators, and ensure system security."
                image={heroImg}
            />
            <SummaryTiles tiles={tiles} />

            {/* Masonry: three columns, two stacked cards each */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Column 1 */}
                <div className="space-y-6">
                    <PanelCard title="User Role Distribution">
                        <div className="flex items-center gap-6">
                            <Donut data={roleDistribution} />
                            <ul className="flex-1 space-y-2.5 text-sm">
                                {roleDistribution.map((r) => (
                                    <li key={r.label} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: toneHex[r.tone] }} />
                                            {r.label}
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {r.value.toLocaleString()} ({r.percent})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-5 text-sm font-semibold text-foreground">Total: {totalUsers.toLocaleString()} Users</div>
                    </PanelCard>

                    <PanelCard title="Storage Usage">
                        <div className="space-y-5">
                            <StorageBar label="Storage Usage" hint="256 GB / 1 TB Used" pct={25.6} />
                            <StorageBar label="Database Size" pct={24} tone="green" />
                        </div>
                    </PanelCard>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <PanelCard title="System Activity (Last 7 Days)">
                        <MiniLineChart />
                    </PanelCard>

                    <PanelCard title="Quick Actions">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Add Administrator', icon: UserPlus, href: '/super/users' },
                                { label: 'Manage Roles', icon: Shield, href: '/super/roles' },
                                { label: 'System Settings', icon: Settings, href: '/super/settings' },
                                { label: 'Backup Now', icon: UploadCloud, href: '/super/backup' },
                                { label: 'View Reports', icon: BarChart3, href: '/super/reports' },
                                { label: 'Security Scan', icon: ShieldCheck, href: '/super/security' },
                            ].map((a) => (
                                <Link
                                    key={a.label}
                                    href={a.href}
                                    className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center text-[11px] font-medium text-foreground hover:bg-accent"
                                >
                                    <a.icon className="h-5 w-5" />
                                    <span className="leading-tight">{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </PanelCard>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                    <PanelCard
                        title="Recent System Logs"
                        action={<Link href="/super/logs" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}
                    >
                        <ul className="space-y-3.5 text-sm">
                            {logs.map((l, i) => {
                                const Icon = logIcons[l.icon] ?? ShieldCheck;
                                return (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ' + (logTint[l.tone] ?? 'bg-secondary text-foreground')}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[13px] text-foreground">{l.text}</div>
                                            <div className="text-xs text-muted-foreground">{l.when}</div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </PanelCard>

                    <PanelCard
                        title="System Announcements"
                        action={<span className="text-xs font-semibold text-foreground hover:underline">View All</span>}
                    >
                        <div className="rounded-xl bg-tile-blue p-4">
                            <div className="flex items-start gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
                                    <Megaphone className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{announcement.title}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{announcement.body}</p>
                                    <div className="mt-2 text-[11px] text-muted-foreground">
                                        {announcement.when} · By {announcement.author}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PanelCard>
                </div>
            </div>
        </SuperShell>
    );
}

function Donut({ data }: { data: Role[] }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let acc = 0;
    const stops = data
        .map((d) => {
            const start = (acc / total) * 360;
            acc += d.value;
            const end = (acc / total) * 360;
            return `${toneHex[d.tone]} ${start}deg ${end}deg`;
        })
        .join(', ');
    return (
        <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
            <div className="absolute inset-5 rounded-full bg-card" />
        </div>
    );
}

function MiniLineChart() {
    const values = [120, 150, 180, 210, 175, 160, 200];
    const labels = ['May 14', 'May 15', 'May 16', 'May 17', 'May 18', 'May 19', 'May 20'];
    const yTicks = [250, 200, 150, 100, 50, 0];
    const max = 250;
    const w = 100;
    const h = 100;
    const step = w / (values.length - 1);
    const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
    return (
        <div className="flex gap-2">
            <div className="flex h-44 flex-col justify-between pr-1 text-[10px] text-muted-foreground">
                {yTicks.map((t) => (
                    <span key={t}>{t}</span>
                ))}
            </div>
            <div className="min-w-0 flex-1">
                <svg
                    viewBox={`0 0 ${w} ${h}`}
                    className="h-44 w-full"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="System activity over the last seven days"
                >
                    {yTicks.map((t) => (
                        <line key={t} x1="0" x2={w} y1={h - (t / max) * h} y2={h - (t / max) * h} stroke="oklch(0.92 0.006 260)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    ))}
                    <polyline points={points} fill="none" stroke="oklch(0.55 0.18 250)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    {values.map((v, i) => (
                        <g key={i}>
                            <title>{`${labels[i]}: ${v} activities`}</title>
                            <circle cx={i * step} cy={h - (v / max) * h} r="1.6" fill="oklch(0.55 0.18 250)" vectorEffect="non-scaling-stroke" />
                        </g>
                    ))}
                </svg>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    {labels.map((l) => (
                        <span key={l}>{l}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StorageBar({ label, hint, pct, tone = 'blue' }: { label: string; hint?: string; pct: number; tone?: 'blue' | 'green' }) {
    return (
        <div>
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{label}</span>
                {!hint && <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>}
            </div>
            {hint && (
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{hint}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                </div>
            )}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className={'h-full rounded-full ' + (tone === 'green' ? 'bg-[oklch(0.6_0.15_155)]' : 'bg-[oklch(0.55_0.18_250)]')} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
