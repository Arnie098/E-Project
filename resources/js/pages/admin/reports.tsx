import { Head } from '@inertiajs/react';
import { BarChart3, BookOpen, Image as ImageIcon, Landmark, Star, Users, type LucideIcon } from 'lucide-react';
import AdminShell from '@/layouts/admin-shell';
import { PanelCard } from '@/components/dashboard-layout';

const icons: Record<string, LucideIcon> = {
    users: Users,
    'book-open': BookOpen,
    landmark: Landmark,
    image: ImageIcon,
};

interface Props {
    summary: { label: string; value: number; icon: string }[];
    contributions: { pending: number; approved: number; rejected: number; total: number };
    quiz: { taken: number; passRate: number };
    feedback: { count: number; average: number | null };
    moduleCompletion: { title: string; completed: number; pct: number }[];
}

export default function Reports({ summary, contributions, quiz, feedback, moduleCompletion }: Props) {
    const cTotal = contributions.total || 1;
    const cBars = [
        { label: 'Approved', value: contributions.approved, cls: 'bg-emerald-500' },
        { label: 'Pending', value: contributions.pending, cls: 'bg-amber-500' },
        { label: 'Rejected', value: contributions.rejected, cls: 'bg-rose-500' },
    ];

    return (
        <AdminShell>
            <Head title="Reports and Analytics — MANAYUN BAGOBO" />

            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">Reports &amp; Analytics</h1>
                    <p className="text-sm text-muted-foreground">Platform activity and content insights at a glance.</p>
                </div>
            </div>

            {/* Summary tiles */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {summary.map((s) => {
                    const Icon = icons[s.icon] ?? BookOpen;
                    return (
                        <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                            <Icon className="h-5 w-5 text-primary" />
                            <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
                            <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Quiz + feedback KPIs */}
                <div className="space-y-6">
                    <PanelCard title="Quiz Performance">
                        <div className="flex items-center gap-5">
                            <Gauge pct={quiz.passRate} />
                            <div>
                                <div className="text-3xl font-bold text-foreground">{quiz.passRate}%</div>
                                <div className="text-sm text-muted-foreground">pass rate</div>
                                <div className="mt-1 text-xs text-muted-foreground">{quiz.taken} quizzes taken</div>
                            </div>
                        </div>
                    </PanelCard>

                    <PanelCard title="Feedback">
                        <div className="flex items-end gap-2">
                            <div className="text-3xl font-bold text-foreground">{feedback.average ?? '—'}</div>
                            {feedback.average !== null && <Star className="mb-1 h-5 w-5 fill-amber-400 text-amber-400" />}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            average rating · {feedback.count} {feedback.count === 1 ? 'entry' : 'entries'}
                        </div>
                    </PanelCard>
                </div>

                {/* Contributions breakdown */}
                <PanelCard title="Contributions by Status">
                    <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-secondary">
                        {cBars.map((b) => (
                            <div key={b.label} className={b.cls} style={{ width: `${(b.value / cTotal) * 100}%` }} />
                        ))}
                    </div>
                    <ul className="space-y-2 text-sm">
                        {cBars.map((b) => (
                            <li key={b.label} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <span className={`h-2.5 w-2.5 rounded-sm ${b.cls}`} />
                                    {b.label}
                                </span>
                                <span className="font-semibold text-foreground">{b.value}</span>
                            </li>
                        ))}
                        <li className="flex items-center justify-between border-t border-border pt-2 font-semibold text-foreground">
                            <span>Total</span>
                            <span>{contributions.total}</span>
                        </li>
                    </ul>
                </PanelCard>

                {/* Module completion */}
                <PanelCard title="Lesson Completion">
                    {moduleCompletion.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">No lessons yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {moduleCompletion.map((m) => (
                                <li key={m.title}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="truncate pr-2 text-foreground">{m.title}</span>
                                        <span className="shrink-0 text-muted-foreground">{m.completed} learner{m.completed === 1 ? '' : 's'}</span>
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
        </AdminShell>
    );
}

function Gauge({ pct }: { pct: number }) {
    const angle = (Math.min(pct, 100) / 100) * 360;
    return (
        <div
            className="relative h-24 w-24 shrink-0 rounded-full"
            style={{ background: `conic-gradient(oklch(0.62 0.15 155) ${angle}deg, oklch(0.92 0.006 260) ${angle}deg)` }}
        >
            <div className="absolute inset-3 grid place-items-center rounded-full bg-card text-sm font-bold text-foreground">{pct}%</div>
        </div>
    );
}
