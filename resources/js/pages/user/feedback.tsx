import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { CheckCircle2, MessageCircle, Send, Star } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FeedbackItem {
    id: number;
    subject: string;
    body: string;
    rating: number | null;
    status: string;
    submittedAt: string;
}

interface Stats {
    total: number;
    averageRating: number | null;
}

export default function Feedback({ feedback, stats }: { feedback: FeedbackItem[]; stats: Stats }) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;
    const [hover, setHover] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        body: '',
        rating: 0,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/user/feedback', { preserveScroll: true, onSuccess: () => reset() });
    }

    return (
        <UserShell>
            <Head title="Feedback — EPANAW BAGOBO" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Feedback</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Tell us what&rsquo;s working and what could be better on the platform.</p>
                </div>
                <div className="flex gap-2">
                    <Stat label="Submitted" value={String(stats.total)} />
                    <Stat label="Avg. rating" value={stats.averageRating ? `${stats.averageRating}★` : '—'} />
                </div>
            </div>

            {flash?.status && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-tile-green px-4 py-3 text-sm font-medium text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    {flash.status}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Feedback form */}
                <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 lg:col-span-1">
                    <h2 className="text-base font-semibold text-foreground">Share feedback</h2>

                    <label className="mt-4 block text-sm font-medium text-foreground">Your rating</label>
                    <div className="mt-1 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setData('rating', n)}
                                onMouseEnter={() => setHover(n)}
                                onMouseLeave={() => setHover(0)}
                                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                                className="p-0.5"
                            >
                                <Star
                                    className={cn(
                                        'h-7 w-7 transition-colors',
                                        (hover || data.rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}

                    <label className="mt-4 block text-sm font-medium text-foreground">Subject</label>
                    <Input
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        placeholder="e.g. Loved the storytelling archive"
                        className="mt-1"
                    />
                    {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}

                    <label className="mt-4 block text-sm font-medium text-foreground">Comments</label>
                    <textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={4}
                        placeholder="Share your thoughts, suggestions, or issues…"
                        className="mt-1 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}

                    <button
                        type="submit"
                        disabled={processing || data.rating === 0 || data.subject.trim() === '' || data.body.trim() === ''}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {processing ? 'Sending…' : 'Send feedback'}
                    </button>
                </form>

                {/* My feedback */}
                <div className="lg:col-span-2">
                    <h2 className="mb-3 text-base font-semibold text-foreground">My feedback</h2>
                    {feedback.length === 0 ? (
                        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-16 text-center">
                            <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                            <p className="mt-3 text-sm text-muted-foreground">You haven&rsquo;t sent any feedback yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {feedback.map((f) => (
                                <article key={f.id} className="rounded-2xl border border-border bg-card p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-foreground">{f.subject}</h3>
                                            <div className="mt-1 flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        className={cn('h-3.5 w-3.5', (f.rating ?? 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                            {f.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                                    <div className="mt-2 text-xs text-muted-foreground">{f.submittedAt}</div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </UserShell>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-card px-3 py-2 text-center">
            <div className="text-lg font-bold leading-none text-foreground">{value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}
