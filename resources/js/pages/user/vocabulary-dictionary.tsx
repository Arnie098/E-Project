import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { BadgeCheck, Book, Languages, Quote, Search, Tags, Volume2 } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Word {
    id: number;
    word: string;
    meaning: string;
    pronunciation: string | null;
    category: string | null;
    example: string | null;
    initial: string;
    audio: string | null;
    speaker: string | null;
    verifiedBy: string | null;
    verified: boolean;
}

interface Stats {
    total: number;
    categories: number;
    verified: number;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function VocabularyDictionary({
    words,
    categories,
    stats,
}: {
    words: Word[];
    categories: string[];
    stats: Stats;
}) {
    const [query, setQuery] = useState('');
    const [letter, setLetter] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    const activeLetters = useMemo(() => new Set(words.map((w) => w.initial)), [words]);

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return words.filter(
            (w) =>
                (letter === null || w.initial === letter) &&
                (category === null || w.category === category) &&
                (q === '' || w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q)),
        );
    }, [words, query, letter, category]);

    const groups = useMemo(() => {
        const map = new Map<string, Word[]>();
        for (const w of shown) {
            (map.get(w.initial) ?? map.set(w.initial, []).get(w.initial)!).push(w);
        }
        return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [shown]);

    const summary = [
        { label: 'Words', value: stats.total, icon: Book },
        { label: 'Categories', value: stats.categories, icon: Tags },
        { label: 'Verified', value: stats.verified, icon: BadgeCheck },
    ];

    return (
        <UserShell>
            <Head title="Vocabulary Dictionary — MANAYUN BAGOBO" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Vocabulary Dictionary</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Learn Bagobo Tagabawa words, their meanings, pronunciation, and how they are used.
                    </p>
                </div>
                <div className="flex gap-2">
                    {summary.map((s) => (
                        <div key={s.label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                            <s.icon className="h-4 w-4 text-primary" />
                            <div className="leading-tight">
                                <div className="text-sm font-bold text-foreground">{s.value}</div>
                                <div className="text-[11px] text-muted-foreground">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a word or its meaning…"
                    className="h-11 pl-10"
                />
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    <CategoryChip active={category === null} onClick={() => setCategory(null)}>
                        All categories
                    </CategoryChip>
                    {categories.map((c) => (
                        <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
                            {c}
                        </CategoryChip>
                    ))}
                </div>
            )}

            {/* A–Z jump strip */}
            <div className="mb-6 flex flex-wrap gap-1.5">
                <button
                    onClick={() => setLetter(null)}
                    className={cn(
                        'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-semibold transition-colors',
                        letter === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent',
                    )}
                >
                    All
                </button>
                {ALPHABET.map((l) => {
                    const has = activeLetters.has(l);
                    return (
                        <button
                            key={l}
                            disabled={!has}
                            onClick={() => setLetter(l)}
                            className={cn(
                                'grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition-colors',
                                letter === l
                                    ? 'bg-primary text-primary-foreground'
                                    : has
                                      ? 'bg-secondary text-foreground hover:bg-accent'
                                      : 'cursor-not-allowed text-muted-foreground/40',
                            )}
                        >
                            {l}
                        </button>
                    );
                })}
            </div>

            {/* Entries grouped by initial letter */}
            <div className="space-y-8">
                {groups.map(([initial, entries]) => (
                    <section key={initial}>
                        <div className="mb-3 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                                {initial}
                            </span>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                {entries.length} {entries.length === 1 ? 'word' : 'words'}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {entries.map((w) => (
                                <article key={w.id} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-foreground">{w.word}</h3>
                                            {w.pronunciation && (
                                                <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                                    <Volume2 className="h-3.5 w-3.5" />/{w.pronunciation}/
                                                </span>
                                            )}
                                        </div>
                                        {w.category && (
                                            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                                                {w.category}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                                        <Languages className="h-4 w-4" />
                                        {w.meaning}
                                    </p>

                                    {w.example && (
                                        <p className="mt-3 flex gap-2 border-t border-border pt-3 text-sm italic leading-relaxed text-muted-foreground">
                                            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>{w.example}</span>
                                        </p>
                                    )}

                                    {w.speaker && w.verified && (
                                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700">
                                            <BadgeCheck className="h-3.5 w-3.5" />
                                            Pronunciation verified — {w.speaker}
                                        </p>
                                    )}
                                    {w.audio && w.verified && (
                                        <audio controls preload="none" className="mt-3 w-full" src={w.audio}>
                                            Your browser does not support pronunciation audio playback.
                                        </audio>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {shown.length === 0 && (
                <div className="py-16 text-center">
                    <Book className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No words match your search yet.</p>
                </div>
            )}
        </UserShell>
    );
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
        >
            {children}
        </button>
    );
}
