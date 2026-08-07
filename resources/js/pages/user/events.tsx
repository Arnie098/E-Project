import { Head } from '@inertiajs/react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import UserShell from '@/layouts/user-shell';

interface EventItem {
    id: number;
    title: string;
    weekday: string;
    date: string;
    time: string;
    month: string;
    day: string;
    location: string | null;
}

export default function Events({ upcoming, past }: { upcoming: EventItem[]; past: EventItem[] }) {
    return (
        <UserShell>
            <Head title="Events — MANAYUN BAGOBO" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Cultural Events</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Festivals, workshops, and gatherings that celebrate Bagobo Tagabawa heritage.
                </p>
            </div>

            <section className="mb-10">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming</h2>
                {upcoming.length === 0 ? (
                    <div className="grid place-items-center rounded-2xl border border-dashed border-border py-14 text-center">
                        <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-3 text-sm text-muted-foreground">No upcoming events scheduled.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {upcoming.map((e) => (
                            <article key={e.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                                    <div className="text-center leading-none">
                                        <div className="text-[11px] font-semibold uppercase">{e.month}</div>
                                        <div className="text-2xl font-bold">{e.day}</div>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-foreground">{e.title}</h3>
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        <div className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-4 w-4" />
                                            {e.weekday}, {e.date}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                {e.time}
                                            </span>
                                            {e.location && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {e.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {past.length > 0 && (
                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Past events</h2>
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        {past.map((e, i) => (
                            <div
                                key={e.id}
                                className={i > 0 ? 'flex items-center justify-between gap-4 border-t border-border px-5 py-4' : 'flex items-center justify-between gap-4 px-5 py-4'}
                            >
                                <div className="min-w-0">
                                    <div className="font-medium text-foreground">{e.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {e.date}
                                        {e.location ? ` · ${e.location}` : ''}
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Concluded</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </UserShell>
    );
}
