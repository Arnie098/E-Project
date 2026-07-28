import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Bookmark, Calendar, ChevronRight, Clock, Download, Eye, Search, Share2, User } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import heroImg from '@/assets/heritage-hero.jpg';

interface Story {
    id: number;
    title: string;
    type: string;
    author: string | null;
    date: string | null;
    views: number;
    readTime: string | null;
    summary: string | null;
    categories: string[];
    image: string | null;
}

export default function StorytellingArchive({ stories, featured }: { stories: Story[]; featured: Story }) {
    const [selected, setSelected] = useState<Story>(featured);
    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('newest');

    const types = useMemo(() => Array.from(new Set(stories.map((s) => s.type))), [stories]);
    const categories = useMemo(() => Array.from(new Set(stories.flatMap((s) => s.categories))), [stories]);

    const shown = useMemo(() => {
        const list = stories.filter(
            (s) =>
                (type === 'all' || s.type === type) &&
                (category === 'all' || s.categories.includes(category)) &&
                (query === '' || s.title.toLowerCase().includes(query.toLowerCase())),
        );
        return sort === 'oldest' ? [...list].reverse() : list;
    }, [stories, type, category, query, sort]);

    const related = stories.filter((s) => s.id !== selected.id).slice(0, 3);

    return (
        <UserShell>
            <Head title="Storytelling Archive — EPANAW BAGOBO" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Storytelling Archive</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Discover and explore the timeless stories and legends of the Bagobo Tagabawa people.
                </p>
            </div>

            {/* Search + filters */}
            <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search stories, legends, or keywords..."
                        className="h-11 pl-10 pr-11"
                    />
                    <button className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md bg-primary text-primary-foreground" aria-label="Search">
                        <Search className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-11 w-[160px]"><SelectValue placeholder="All Story Types" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Story Types</SelectItem>
                            {types.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11 w-[160px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* List */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Featured Stories</h2>
                    <div className="space-y-3">
                        {shown.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelected(s)}
                                className={
                                    'flex w-full gap-4 rounded-2xl border bg-card p-3 text-left transition-colors ' +
                                    (selected.id === s.id ? 'border-primary' : 'border-border hover:border-foreground/30')
                                }
                            >
                                <img src={s.image ?? heroImg} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">{s.type}</span>
                                        <Bookmark className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </div>
                                    <h3 className="mt-1 truncate text-sm font-semibold text-foreground">{s.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.summary}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{s.date}</span>
                                        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{s.author}</span>
                                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{s.views} views</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <Pagination />
                </div>

                {/* Detail */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <div className="relative h-56 w-full">
                            <img src={selected.image ?? heroImg} alt={selected.title} className="h-full w-full object-cover" />
                            <div className="absolute right-3 top-3 flex gap-2">
                                {[Bookmark, Share2, Download].map((Icon, i) => (
                                    <button key={i} className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground hover:bg-white">
                                        <Icon className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 sm:p-6">
                            <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">{selected.type}</span>
                            <h2 className="mt-2 text-2xl font-bold text-foreground">{selected.title}</h2>
                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{selected.date}</span>
                                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />{selected.author}</span>
                                <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{selected.views} views</span>
                                {selected.readTime && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{selected.readTime}</span>}
                            </div>

                            <h3 className="mt-5 text-sm font-semibold text-foreground">Story Summary</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.summary}</p>

                            {selected.categories.length > 0 && (
                                <>
                                    <h3 className="mt-5 text-sm font-semibold text-foreground">Categories</h3>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selected.categories.map((c) => (
                                            <span key={c} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{c}</span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {related.length > 0 && (
                                <>
                                    <div className="mt-6 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">Related Stories</h3>
                                        <span className="text-xs font-semibold text-foreground hover:underline">View All</span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        {related.map((r) => (
                                            <button key={r.id} onClick={() => setSelected(r)} className="text-left">
                                                <img src={r.image ?? heroImg} alt="" className="h-20 w-full rounded-lg object-cover" />
                                                <div className="mt-1.5 line-clamp-2 text-xs font-medium text-foreground">{r.title}</div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserShell>
    );
}

function Pagination() {
    const [page, setPage] = useState(1);
    return (
        <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((p) => (
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
            <button onClick={() => setPage((p) => Math.min(10, p + 1))} className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground hover:bg-accent" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
