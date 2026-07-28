import { Head, Link } from '@inertiajs/react';
import { BarChart3, BookOpen, CheckCircle2, ListChecks } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { cn } from '@/lib/utils';

interface Row {
    id: number;
    title: string;
    module: string;
    difficulty: string;
    progress: number;
    status: 'Completed' | 'In Progress' | 'Not Started';
    score: string | null;
    completedAt: string | null;
}

interface Stats {
    completed: number;
    inProgress: number;
    total: number;
    quizzesTaken: number;
}

const statusCls: Record<Row['status'], string> = {
    Completed: 'bg-tile-green text-emerald-800',
    'In Progress': 'bg-tile-amber text-amber-800',
    'Not Started': 'bg-secondary text-muted-foreground',
};

export default function Progress({ rows, stats }: { rows: Row[]; stats: Stats }) {
    const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

    const tiles = [
        { label: 'Lessons completed', value: `${stats.completed}/${stats.total}`, icon: CheckCircle2 },
        { label: 'In progress', value: String(stats.inProgress), icon: BookOpen },
        { label: 'Quizzes taken', value: String(stats.quizzesTaken), icon: ListChecks },
        { label: 'Overall progress', value: `${pct}%`, icon: BarChart3 },
    ];

    return (
        <UserShell>
            <Head title="My Progress — EPANAW BAGOBO" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Progress</h1>
                <p className="mt-1 text-sm text-muted-foreground">Track your learning journey through the Bagobo Tagabawa modules.</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {tiles.map((t) => (
                    <div key={t.label} className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <t.icon className="h-4 w-4" />
                            <span className="text-xs">{t.label}</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-foreground">{t.value}</div>
                    </div>
                ))}
            </div>

            {/* Overall bar */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">Course completion</span>
                    <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
            </div>

            {/* Per-lesson table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="px-5 py-3 font-medium">Lesson</th>
                                <th className="px-5 py-3 font-medium">Module</th>
                                <th className="px-5 py-3 font-medium">Progress</th>
                                <th className="px-5 py-3 font-medium">Best score</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id} className="border-b border-border last:border-0">
                                    <td className="px-5 py-3">
                                        <Link href={`/user/learning-modules/${r.id}`} className="font-medium text-foreground hover:underline">
                                            {r.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">{r.module}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${r.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{r.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">{r.score ?? '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', statusCls[r.status])}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">{r.completedAt ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UserShell>
    );
}
