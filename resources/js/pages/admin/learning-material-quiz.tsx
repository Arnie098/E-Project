import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminShell from '@/layouts/admin-shell';
import { PanelCard } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Module {
    id: number;
    title: string;
    module: string | null;
    difficulty: string | null;
}

interface Question {
    id: number;
    question: string;
    options: string[];
    answer: number;
}

export default function LessonQuiz({ module, questions }: { module: Module; questions: Question[] }) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;

    const [text, setText] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [answer, setAnswer] = useState(0);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);

    function reset() {
        setText('');
        setOptions(['', '']);
        setAnswer(0);
        setEditingId(null);
    }

    function startEdit(q: Question) {
        setText(q.question);
        setOptions([...q.options]);
        setAnswer(q.answer);
        setEditingId(q.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    function setOpt(i: number, v: string) {
        setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));
    }
    function addOpt() {
        if (options.length < 6) setOptions((o) => [...o, '']);
    }
    function removeOpt(i: number) {
        if (options.length <= 2) return;
        setOptions((o) => o.filter((_, idx) => idx !== i));
        setAnswer((a) => (a === i ? 0 : a > i ? a - 1 : a));
    }

    const valid = text.trim() !== '' && options.length >= 2 && options.every((o) => o.trim() !== '') && answer < options.length;

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!valid) return;
        const payload = { question: text, options, answer };
        const opts = {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onSuccess: () => reset(),
        };
        if (editingId) router.patch(`/admin/questions/${editingId}`, payload, opts);
        else router.post(`/admin/learning-materials/${module.id}/questions`, payload, opts);
    }

    function remove(q: Question) {
        if (confirm('Delete this question?')) router.delete(`/admin/questions/${q.id}`, { preserveScroll: true });
    }

    return (
        <AdminShell>
            <Head title={`Quiz — ${module.title}`} />

            <Link href="/admin/learning-materials" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Learning Materials
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Quiz Editor</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {module.title}
                    {module.module ? ` · ${module.module}` : ''}
                    {module.difficulty ? ` · ${module.difficulty}` : ''}
                </p>
            </div>

            {flash?.status && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.status}</div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,1fr)]">
                {/* Existing questions */}
                <PanelCard title={`Questions (${questions.length})`}>
                    {questions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No questions yet. Add the first one on the right.</p>
                    ) : (
                        <ol className="space-y-4">
                            {questions.map((q, i) => (
                                <li key={q.id} className="rounded-xl border border-border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="font-medium text-foreground">
                                            {i + 1}. {q.question}
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(q)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => remove(q)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {q.options.map((opt, oi) => (
                                            <li
                                                key={oi}
                                                className={cn(
                                                    'flex items-center gap-2 text-sm',
                                                    oi === q.answer ? 'font-medium text-emerald-700' : 'text-muted-foreground',
                                                )}
                                            >
                                                {oi === q.answer ? <Check className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ol>
                    )}
                </PanelCard>

                {/* Add / edit form */}
                <PanelCard title={editingId ? 'Edit Question' : 'Add Question'}>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Question</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={2}
                                placeholder="What does 'Salamat' mean?"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Options — select the correct one</label>
                            {options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={answer === i}
                                        onChange={() => setAnswer(i)}
                                        className="h-4 w-4 shrink-0 accent-emerald-600"
                                        aria-label={`Mark option ${i + 1} correct`}
                                    />
                                    <Input value={opt} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeOpt(i)}
                                        disabled={options.length <= 2}
                                        className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Remove option"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {options.length < 6 && (
                                <button type="button" onClick={addOpt} className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline">
                                    <Plus className="h-4 w-4" />
                                    Add option
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <Button type="submit" disabled={!valid || busy}>
                                {editingId ? 'Save Changes' : 'Add Question'}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="outline" onClick={reset}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </PanelCard>
            </div>
        </AdminShell>
    );
}
