import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { CheckCircle2, Send, Users } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Contribution {
    id: number;
    item: string;
    description: string | null;
    type: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedAt: string;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
}

const statusCls: Record<Contribution['status'], string> = {
    Pending: 'bg-tile-amber text-amber-800',
    Approved: 'bg-tile-green text-emerald-800',
    Rejected: 'bg-tile-rose text-rose-800',
};

export default function CommunityContributions({
    contributions,
    types,
    stats,
}: {
    contributions: Contribution[];
    types: string[];
    stats: Stats;
}) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;
    const { data, setData, post, processing, errors, reset } = useForm({
        item: '',
        type: types[0] ?? 'Story',
        description: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/user/community-contributions', { preserveScroll: true, onSuccess: () => reset() });
    }

    return (
        <UserShell>
            <Head title="Community Contributions — EPANAW BAGOBO" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Community Contributions</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Share a story, recording, image, or note. Submissions are reviewed by an admin before publishing.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Stat label="Submitted" value={stats.total} />
                    <Stat label="Pending" value={stats.pending} />
                    <Stat label="Approved" value={stats.approved} />
                </div>
            </div>

            {flash?.status && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-tile-green px-4 py-3 text-sm font-medium text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    {flash.status}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Submission form */}
                <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 lg:col-span-1">
                    <h2 className="text-base font-semibold text-foreground">Submit a contribution</h2>

                    <label className="mt-4 block text-sm font-medium text-foreground">Title</label>
                    <Input
                        value={data.item}
                        onChange={(e) => setData('item', e.target.value)}
                        placeholder="e.g. Bagobo harvest song"
                        className="mt-1"
                    />
                    {errors.item && <p className="mt-1 text-xs text-red-600">{errors.item}</p>}

                    <label className="mt-4 block text-sm font-medium text-foreground">Type</label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:border-primary focus:outline-none"
                    >
                        {types.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>

                    <label className="mt-4 block text-sm font-medium text-foreground">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={4}
                        placeholder="Describe the cultural material you're sharing…"
                        className="mt-1 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}

                    <button
                        type="submit"
                        disabled={processing || data.item.trim() === ''}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {processing ? 'Submitting…' : 'Submit for review'}
                    </button>
                </form>

                {/* My submissions */}
                <div className="lg:col-span-2">
                    <h2 className="mb-3 text-base font-semibold text-foreground">My submissions</h2>
                    {contributions.length === 0 ? (
                        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-16 text-center">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                            <p className="mt-3 text-sm text-muted-foreground">You haven&rsquo;t submitted anything yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {contributions.map((c) => (
                                <article key={c.id} className="rounded-2xl border border-border bg-card p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-foreground">{c.item}</h3>
                                            <div className="mt-0.5 text-xs text-muted-foreground">
                                                {c.type} · {c.submittedAt}
                                            </div>
                                        </div>
                                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', statusCls[c.status])}>
                                            {c.status}
                                        </span>
                                    </div>
                                    {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
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
