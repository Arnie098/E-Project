import { Head } from '@inertiajs/react';
import { BarChart3, MessageSquare, ShieldCheck, Star, Users } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard } from '@/components/dashboard-layout';

interface Props {
    users: { total: number; super: number; admin: number; learner: number };
    content: { label: string; value: number }[];
    engagement: {
        quizzesTaken: number;
        passRate: number;
        chatMessages: number;
        contributions: number;
        pendingContributions: number;
        feedbackCount: number;
        averageRating: number | null;
        verifications: number;
    };
    topModules: { title: string; completed: number; pct: number }[];
}

export default function SuperReports({ users, content, engagement, topModules }: Props) {
    const contentMax = Math.max(...content.map((c) => c.value), 1);

    const kpis = [
        { label: 'Total Users', value: String(users.total), icon: Users },
        { label: 'Quiz Pass Rate', value: `${engagement.passRate}%`, icon: BarChart3 },
        { label: 'Chatbot Messages', value: String(engagement.chatMessages), icon: MessageSquare },
        { label: 'Avg. Rating', value: engagement.averageRating ? `${engagement.averageRating}★` : '—', icon: Star },
    ];

    return (
        <SuperShell>
            <Head title="Reports and Analytics — EPANAW BAGOBO" />

            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">Reports &amp; Analytics</h1>
                    <p className="text-sm text-muted-foreground">System-wide metrics across users, content, and engagement.</p>
                </div>
            </div>

            {/* KPI row */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((k) => (
                    <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
                        <k.icon className="h-5 w-5 text-primary" />
                        <div className="mt-2 text-2xl font-bold text-foreground">{k.value}</div>
                        <div className="text-xs text-muted-foreground">{k.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Content distribution bar chart */}
                <PanelCard title="Content by Type">
                    <ul className="space-y-3">
                        {content.map((c) => (
                            <li key={c.label}>
                                <div className="mb-1 flex items-center justify-between text-xs">
                                    <span className="text-foreground">{c.label}</span>
                                    <span className="text-muted-foreground">{c.value}</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / contentMax) * 100}%` }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </PanelCard>

                {/* Engagement summary */}
                <PanelCard title="Engagement">
                    <dl className="grid grid-cols-2 gap-4">
                        <Metric label="Quizzes Taken" value={engagement.quizzesTaken} />
                        <Metric label="Pass Rate" value={`${engagement.passRate}%`} />
                        <Metric label="Contributions" value={engagement.contributions} />
                        <Metric label="Pending Review" value={engagement.pendingContributions} />
                        <Metric label="Feedback Entries" value={engagement.feedbackCount} />
                        <Metric label="Verifications" value={engagement.verifications} />
                    </dl>
                </PanelCard>
            </div>

            {/* Role split + top modules */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PanelCard title="Accounts by Role">
                    <dl className="grid grid-cols-3 gap-4 text-center">
                        <RoleStat label="Super Admins" value={users.super} tone="bg-tile-purple" />
                        <RoleStat label="Admins" value={users.admin} tone="bg-tile-blue" />
                        <RoleStat label="Learners" value={users.learner} tone="bg-tile-green" />
                    </dl>
                </PanelCard>

                <PanelCard title="Top Lessons by Completion">
                    {topModules.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No lessons yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {topModules.map((m) => (
                                <li key={m.title}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="truncate pr-2 text-foreground">{m.title}</span>
                                        <span className="shrink-0 text-muted-foreground">{m.completed}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(m.pct, 100)}%` }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </PanelCard>
            </div>
        </SuperShell>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

function RoleStat({ label, value, tone }: { label: string; value: number; tone: string }) {
    return (
        <div className={`rounded-xl border border-black/5 p-4 ${tone}`}>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}
