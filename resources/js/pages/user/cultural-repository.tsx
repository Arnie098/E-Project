import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AudioLines, Calendar, FileText, Image as ImageIcon, LayoutGrid, Search, Video } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import heroImg from '@/assets/heritage-hero.jpg';

interface Item {
    id: number;
    title: string;
    category: string | null;
    type: string;
    description: string | null;
    media: string | null;
    date: string;
}

const typeMeta: Record<string, { icon: typeof FileText; tone: string }> = {
    Text: { icon: FileText, tone: 'bg-tile-blue text-blue-700' },
    Image: { icon: ImageIcon, tone: 'bg-tile-purple text-purple-700' },
    Audio: { icon: AudioLines, tone: 'bg-tile-amber text-amber-700' },
    Video: { icon: Video, tone: 'bg-tile-rose text-rose-700' },
};

export default function CulturalRepository({
    items,
    categories,
    types,
}: {
    items: Item[];
    categories: string[];
    types: string[];
}) {
    const [query, setQuery] = useState('');
    const [type, setType] = useState<string | null>(null);
    const [category, setCategory] = useState('all');

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter(
            (i) =>
                (type === null || i.type === type) &&
                (category === 'all' || i.category === category) &&
                (q === '' || i.title.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)),
        );
    }, [items, query, type, category]);

    return (
        <UserShell>
            <Head title="Cultural Repository — EPANAW BAGOBO" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Cultural Repository</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    A centralized archive of Bagobo Tagabawa documents, images, audio, and video.
                </p>
            </div>

            {/* Search + category */}
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the repository…" className="h-11 pl-10" />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 rounded-md border border-input bg-transparent px-3 text-sm focus:border-primary focus:outline-none lg:w-56"
                >
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/* Type pills */}
            <div className="mb-6 flex flex-wrap gap-2">
                <TypePill active={type === null} onClick={() => setType(null)} icon={LayoutGrid} label="All types" />
                {types.map((t) => (
                    <TypePill key={t} active={type === t} onClick={() => setType(t)} icon={typeMeta[t]?.icon ?? FileText} label={t} />
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shown.map((i) => {
                    const meta = typeMeta[i.type] ?? { icon: FileText, tone: 'bg-secondary text-foreground' };
                    const hasVisual = (i.type === 'Image' || i.type === 'Video') && i.media;
                    return (
                        <article key={i.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                            <div className="relative h-40 w-full">
                                {hasVisual ? (
                                    <img src={i.media ?? heroImg} alt={i.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className={cn('grid h-full w-full place-items-center', meta.tone)}>
                                        <meta.icon className="h-10 w-10 opacity-70" />
                                    </div>
                                )}
                                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                                    <meta.icon className="h-3.5 w-3.5" />
                                    {i.type}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="text-sm font-semibold text-foreground">{i.title}</h3>
                                {i.category && <div className="mt-0.5 text-xs font-medium text-primary">{i.category}</div>}
                                {i.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{i.description}</p>}
                                <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {i.date}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {shown.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No resources found.</p>}
        </UserShell>
    );
}

function TypePill({
    active,
    onClick,
    icon: Icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: typeof FileText;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}
