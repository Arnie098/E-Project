import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AudioLines, Calendar, ChevronRight, Download, Eye, Image as ImageIcon, LayoutGrid, Play, Search, Video } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import heroImg from '@/assets/heritage-hero.jpg';

interface Media {
    id: number;
    title: string;
    category: string;
    type: 'image' | 'video' | 'audio';
    date: string | null;
    views: number;
    duration: string | null;
    thumbnail: string | null;
}

const filters = [
    { key: 'all', label: 'All Media', icon: LayoutGrid },
    { key: 'image', label: 'Images', icon: ImageIcon },
    { key: 'video', label: 'Videos', icon: Video },
    { key: 'audio', label: 'Audio', icon: AudioLines },
] as const;

const typeMeta: Record<Media['type'], { label: string; icon: typeof ImageIcon }> = {
    image: { label: 'Image', icon: ImageIcon },
    video: { label: 'Video', icon: Video },
    audio: { label: 'Audio', icon: AudioLines },
};

// Per-category accent color, matching the mockup.
const categoryColor: Record<string, string> = {
    'Cultural Practice': 'text-amber-600',
    Places: 'text-emerald-600',
    Crafts: 'text-purple-600',
    Rituals: 'text-red-600',
    'Traditional Music': 'text-blue-600',
    Weaving: 'text-purple-600',
    'Stories & Legends': 'text-emerald-600',
    'Nature Sounds': 'text-blue-600',
};

export default function MultimediaGallery({ media }: { media: Media[] }) {
    const [active, setActive] = useState<(typeof filters)[number]['key']>('all');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('newest');

    const categories = useMemo(() => Array.from(new Set(media.map((m) => m.category))), [media]);

    const shown = useMemo(() => {
        const list = media.filter(
            (m) =>
                (active === 'all' || m.type === active) &&
                (category === 'all' || m.category === category) &&
                (query === '' || m.title.toLowerCase().includes(query.toLowerCase())),
        );
        return sort === 'oldest' ? [...list].reverse() : list;
    }, [media, active, query, category, sort]);

    return (
        <UserShell>
            <Head title="Multimedia Gallery — EPANAW BAGOBO" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Multimedia Gallery</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Explore images, videos, and audio that showcase the beauty of Bagobo Tagabawa culture.
                </p>
            </div>

            {/* Search + dropdown filters */}
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media..." className="h-11 pl-10" />
                </div>
                <div className="flex flex-wrap gap-3">
                    <Select value={active} onValueChange={(v) => setActive(v as typeof active)}>
                        <SelectTrigger className="h-11 w-[170px]"><SelectValue placeholder="All Media Types" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Media Types</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="video">Videos</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11 w-[170px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="h-11 w-[150px]"><SelectValue placeholder="Newest First" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Type pills */}
            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setActive(f.key)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                            active === f.key
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <f.icon className="h-4 w-4" />
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shown.map((m) => {
                    const Meta = typeMeta[m.type];
                    return (
                        <article key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                            <div className="relative h-44 w-full bg-muted">
                                <img src={m.thumbnail ?? heroImg} alt={m.title} className="h-full w-full object-cover" />
                                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                                    <Meta.icon className="h-3.5 w-3.5" />
                                    {Meta.label}
                                </span>
                                {m.type === 'video' && (
                                    <div className="absolute inset-0 grid place-items-center">
                                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-foreground">
                                            <Play className="h-5 w-5 translate-x-0.5" />
                                        </div>
                                    </div>
                                )}
                                {m.type === 'audio' && (
                                    <div className="absolute inset-x-3 bottom-3 flex items-end gap-0.5">
                                        {Array.from({ length: 32 }).map((_, i) => (
                                            <span key={i} className="w-full rounded-full bg-white/80" style={{ height: `${4 + ((i * 37) % 20)}px` }} />
                                        ))}
                                    </div>
                                )}
                                {m.duration && (
                                    <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">{m.duration}</span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-foreground">{m.title}</h3>
                                <div className={cn('mt-1 text-xs font-medium', categoryColor[m.category] ?? 'text-amber-600')}>{m.category}</div>
                                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{m.date}</span>
                                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{m.views}</span>
                                    <button className="text-muted-foreground hover:text-foreground" aria-label="Download">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {shown.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No media found.</p>}

            <Pagination />
        </UserShell>
    );
}

function Pagination() {
    const [page, setPage] = useState(1);
    const pages = [1, 2, 3];
    return (
        <div className="mt-8 flex items-center justify-center gap-2">
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                        'grid h-9 w-9 place-items-center rounded-lg text-sm font-medium transition-colors',
                        page === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent',
                    )}
                >
                    {p}
                </button>
            ))}
            <span className="px-1 text-sm text-muted-foreground">…</span>
            <button
                onClick={() => setPage(10)}
                className={cn(
                    'grid h-9 w-9 place-items-center rounded-lg text-sm font-medium transition-colors',
                    page === 10 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent',
                )}
            >
                10
            </button>
            <button
                onClick={() => setPage((p) => Math.min(10, p + 1))}
                className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground hover:bg-accent"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
