import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { cn } from '@/lib/utils';

interface Module {
    id: number;
    title: string;
    description: string;
    module: string;
    difficulty: string;
    content: string | null;
    progress: number;
    status: string;
}

interface Question {
    id: number;
    question: string;
    options: string[];
}

interface Result {
    score: number;
    total: number;
    remarks: 'Passed' | 'Failed';
    takenAt: string;
}

export default function LearningModulePage({
    module,
    questions,
    result,
}: {
    module: Module;
    questions: Question[];
    result: Result | null;
}) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;
    const [retaking, setRetaking] = useState(false);

    const { data, setData, post, processing } = useForm<{ answers: Record<number, number> }>({ answers: {} });

    const answered = questions.every((q) => data.answers[q.id] !== undefined);

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/user/learning-modules/${module.id}/quiz`, {
            preserveScroll: true,
            onSuccess: () => setRetaking(false),
        });
    }

    const showResult = result && !retaking;

    return (
        <UserShell>
            <Head title={`${module.title} — MANAYUN BAGOBO`} />

            <Link href="/user/learning-modules" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Learning Modules
            </Link>

            <div className="mx-auto max-w-3xl">
                {/* Lesson header */}
                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-foreground">{module.module}</span>
                    <span className="text-muted-foreground">{module.difficulty}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{module.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>

                {flash?.status && (
                    <div className="mt-5 rounded-xl border border-emerald-300 bg-tile-green px-4 py-3 text-sm font-medium text-emerald-900">
                        {flash.status}
                    </div>
                )}

                {/* Lesson content */}
                <section className="mt-5 rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lesson</h2>
                    <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                        {module.content ?? 'Lesson content is being prepared.'}
                    </div>
                </section>

                {/* Quiz */}
                {questions.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Quiz</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Answer all questions to complete this lesson. Passing mark is 60%.</p>

                        {showResult ? (
                            <ResultPanel result={result} onRetake={() => setRetaking(true)} />
                        ) : (
                            <form onSubmit={submit} className="mt-5 space-y-6">
                                {questions.map((q, qi) => (
                                    <fieldset key={q.id}>
                                        <legend className="text-sm font-semibold text-foreground">
                                            {qi + 1}. {q.question}
                                        </legend>
                                        <div className="mt-3 space-y-2">
                                            {q.options.map((opt, oi) => {
                                                const selected = data.answers[q.id] === oi;
                                                return (
                                                    <label
                                                        key={oi}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors',
                                                            selected ? 'border-primary bg-primary/5 text-foreground' : 'border-border hover:bg-secondary/50',
                                                        )}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`q-${q.id}`}
                                                            checked={selected}
                                                            onChange={() => setData('answers', { ...data.answers, [q.id]: oi })}
                                                            className="h-4 w-4 accent-primary"
                                                        />
                                                        {opt}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                ))}

                                <button
                                    type="submit"
                                    disabled={!answered || processing}
                                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Submitting…' : 'Submit quiz'}
                                </button>
                                {!answered && <span className="ml-3 text-xs text-muted-foreground">Answer every question to submit.</span>}
                            </form>
                        )}
                    </section>
                )}
            </div>
        </UserShell>
    );
}

function ResultPanel({ result, onRetake }: { result: Result; onRetake: () => void }) {
    const passed = result.remarks === 'Passed';
    return (
        <div className="mt-5">
            <div
                className={cn(
                    'flex items-center gap-4 rounded-2xl border p-5',
                    passed ? 'border-emerald-300 bg-tile-green' : 'border-rose-300 bg-tile-rose',
                )}
            >
                <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl', passed ? 'bg-emerald-600' : 'bg-rose-600')}>
                    {passed ? <Trophy className="h-6 w-6 text-white" /> : <XCircle className="h-6 w-6 text-white" />}
                </div>
                <div>
                    <div className="text-lg font-bold text-foreground">
                        {result.score} / {result.total} — {result.remarks}
                    </div>
                    <div className="text-sm text-muted-foreground">Last attempt: {result.takenAt}</div>
                </div>
            </div>
            <button
                onClick={onRetake}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/50"
            >
                <RotateCcw className="h-4 w-4" />
                Retake quiz
            </button>
            {passed && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Lesson completed.
                </p>
            )}
        </div>
    );
}
