import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Book,
    BookOpen,
    Calendar,
    FolderKanban,
    Image as ImageIcon,
    Landmark,
    ScrollText,
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
    users: Users,
};

interface InventoryItem {
    label: string;
    value: number;
    icon: string;
    href: string;
}

interface Props {
    inventory: InventoryItem[];
    contributionStatus: { pending: number; approved: number; rejected: number };
    recent: { id: number; title: string; type: string; category: string | null; date: string }[];
}

export default function Content({ inventory, contributionStatus, recent }: Props) {
    const cTotal = contributionStatus.pending + contributionStatus.approved + contributionStatus.rejected || 1;
    const bars = [
        { label: 'Approved', value: contributionStatus.approved, cls: 'bg-emerald-500' },
        { label: 'Pending', value: contributionStatus.pending, cls: 'bg-amber-500' },
        { label: 'Rejected', value: contributionStatus.rejected, cls: 'bg-rose-500' },
    ];

    return (
        <SuperShell>
            <Head title="Content Management — EPANAW BAGOBO" />

            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">Content Management</h1>
                    <p className="text-sm text-muted-foreground">Every content store in the system, with quick access to manage it.</p>
                </div>
            </div>

            {/* Inventory */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inventory.map((i) => {
                    const Icon = icons[i.icon] ?? BookOpen;
                    return (
                        <Link
                            key={i.label}
                            href={i.href}
                            className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-foreground">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <div className="mt-3 text-2xl font-bold text-foreground">{i.value}</div>
                            <div className="text-sm text-muted-foreground">{i.label}</div>
                        </Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PanelCard title="Contribution Review Queue">
                    <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-secondary">
                        {bars.map((b) => (
                            <div key={b.label} className={b.cls} style={{ width: `${(b.value / cTotal) * 100}%` }} />
                        ))}
                    </div>
                    <ul className="space-y-2 text-sm">
                        {bars.map((b) => (
                            <li key={b.label} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <span className={`h-2.5 w-2.5 rounded-sm ${b.cls}`} />
                                    {b.label}
                                </span>
                                <span className="font-semibold text-foreground">{b.value}</span>
                            </li>
                        ))}
                    </ul>
                    <Link href="/admin/contributions" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:underline">
                        Review contributions
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </PanelCard>

                <PanelCard title="Recent Repository Additions">
                    {recent.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">No content yet.</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {recent.map((r) => (
                                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <div className="truncate font-medium text-foreground">{r.title}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {r.type}
                                            {r.category ? ` · ${r.category}` : ''}
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">{r.date}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </PanelCard>
            </div>
        </SuperShell>
    );
}
