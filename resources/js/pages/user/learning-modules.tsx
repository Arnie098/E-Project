import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle2, CircleDashed, PlayCircle } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { cn } from '@/lib/utils';

interface Module {
    id: number;
    title: string;
    description: string;
    module: string;
    difficulty: string;
    image: string | null;
    questions: number;
    progress: number;
    status: 'Completed' | 'In Progress' | 'Not Started';
}

interface Stats {
    total: number;
    completed: number;
    inProgress: number;
}

const statusMeta: Record<Module['status'], { label: string; cls: string; icon: typeof CheckCircle2; cta: string }> = {
    Completed: { label: 'Completed', cls: 'bg-tile-green text-emerald-800', icon: CheckCircle2, cta: 'Review' },
    'In Progress': { label: 'In Progress', cls: 'bg-tile-amber text-amber-800', icon: PlayCircle, cta: 'Continue' },
    'Not Started': { label: 'Not Started', cls: 'bg-secondary text-muted-foreground', icon: CircleDashed, cta: 'Start' },
};

const difficultyCls: Record<string, string> = {
    Beginner: 'text-emerald-600',
    Intermediate: 'text-amber-600',
    Advanced: 'text-rose-600',
};

export default function LearningModules({ modules, stats }: { modules: Module[]; stats: Stats }) {
    return (
        <UserShell>
            <Head title="Learning Modules — EPANAW BAGOBO" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Learning Modules</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Structured lessons on the Bagobo Tagabawa language and culture — each ends with a short quiz.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Stat label="Lessons" value={stats.total} />
                    <Stat label="Completed" value={stats.completed} />
                    <Stat label="In progress" value={stats.inProgress} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {modules.map((m) => {
                    const meta = statusMeta[m.status];
                    return (
                        <article key={m.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                            <div className="relative h-32 w-full bg-muted">
                                <img src={m.image ?? '/heritage-hero.jpg'} alt={m.title} className="h-full w-full object-cover" />
                                <span className={cn('absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold', meta.cls)}>
                                    <meta.icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                </span>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-foreground">{m.module}</span>
                                    <span className={difficultyCls[m.difficulty] ?? 'text-muted-foreground'}>{m.difficulty}</span>
                                </div>
                                <h3 className="text-base font-bold text-foreground">{m.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>

                                <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{m.progress}% complete</span>
                                        <span className="inline-flex items-center gap-1">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {m.questions} {m.questions === 1 ? 'question' : 'questions'}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.progress}%` }} />
                                    </div>
                                </div>

                                <Link
                                    href={`/user/learning-modules/${m.id}`}
                                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    {meta.cta} lesson
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </UserShell>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-border bg-card px-3 py-2 text-center">
            <div className="text-lg font-bold leading-none text-foreground">{value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}
