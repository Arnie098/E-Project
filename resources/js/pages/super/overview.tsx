import { Head } from '@inertiajs/react';
import {
    Activity,
    Book,
    BookOpen,
    Calendar,
    Image as ImageIcon,
    Landmark,
    ListChecks,
    MessageCircle,
    MessageSquare,
    ScrollText,
    ShieldCheck,
    UserCog,
    Users,
    type LucideIcon,
} from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard } from '@/components/dashboard-layout';

const icons: Record<string, LucideIcon> = {
    'book-open': BookOpen,
    landmark: Landmark,
    image: ImageIcon,
    'scroll-text': ScrollText,
    book: Book,
    calendar: Calendar,
    'list-checks': ListChecks,
    'message-square': MessageSquare,
    users: Users,
    'message-circle': MessageCircle,
    'shield-check': ShieldCheck,
    'user-cog': UserCog,
};

interface Metric {
    label: string;
    value: number;
    icon: string;
}

interface Props {
    users: { total: number; super: number; admin: number; learner: number; inactive: number };
    content: Metric[];
    engagement: Metric[];
    recentActivity: { id: number; actor: string; action: string; icon: string; when: string }[];
}

export default function SystemOverview({ users, content, engagement, recentActivity }: Props) {
    const userTiles = [
        { label: 'Total Users', value: users.total, tone: 'bg-tile-blue' },
        { label: 'Super Admins', value: users.super, tone: 'bg-tile-purple' },
        { label: 'Admins', value: users.admin, tone: 'bg-tile-green' },
        { label: 'Learners', value: users.learner, tone: 'bg-tile-amber' },
        { label: 'Inactive', value: users.inactive, tone: 'bg-tile-rose' },
    ];

    return (
        <SuperShell>
            <Head title="System Overview — EPANAW BAGOBO" />

            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Activity className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">System Overview</h1>
                    <p className="text-sm text-muted-foreground">A live snapshot of platform accounts, content, and engagement.</p>
                </div>
            </div>

            {/* User distribution */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {userTiles.map((t) => (
                    <div key={t.label} className={`rounded-2xl border border-black/5 p-5 ${t.tone}`}>
                        <div className="text-xs font-medium text-muted-foreground">{t.label}</div>
                        <div className="mt-1 text-3xl font-bold text-foreground">{t.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PanelCard title="Content Inventory">
                    <MetricGrid metrics={content} />
                </PanelCard>
                <PanelCard title="Engagement">
                    <MetricGrid metrics={engagement} />
                </PanelCard>
            </div>

            <PanelCard title="Recent System Activity" className="mt-6">
                {recentActivity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
                ) : (
                    <ul className="space-y-3.5">
                        {recentActivity.map((a) => {
                            const Icon = icons[a.icon] ?? ShieldCheck;
                            return (
                                <li key={a.id} className="flex items-start gap-3">
                                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm text-foreground">{a.action}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {a.actor} · {a.when}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </PanelCard>
        </SuperShell>
    );
}

function MetricGrid({ metrics }: { metrics: Metric[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => {
                const Icon = icons[m.icon] ?? BookOpen;
                return (
                    <div key={m.label} className="rounded-xl border border-border bg-secondary/30 p-4">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="mt-2 text-2xl font-bold text-foreground">{m.value}</div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                    </div>
                );
            })}
        </div>
    );
}
