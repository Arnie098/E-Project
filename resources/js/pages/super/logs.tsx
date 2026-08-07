import { Head } from '@inertiajs/react';
import {
    BookOpen,
    Database,
    Eye,
    FileText,
    MessageSquare,
    ShieldCheck,
    Trophy,
    UserCog,
    UserPlus,
    Users,
    type LucideIcon,
} from 'lucide-react';
import SuperShell from '@/layouts/super-shell';

const icons: Record<string, LucideIcon> = {
    'book-open': BookOpen,
    'message-square': MessageSquare,
    'message-circle': MessageSquare,
    users: Users,
    'user-cog': UserCog,
    'user-plus': UserPlus,
    'shield-check': ShieldCheck,
    database: Database,
    trophy: Trophy,
    eye: Eye,
};

interface Log {
    id: number;
    actor: string;
    action: string;
    icon: string;
    when: string;
}

export default function ActivityLogs({ logs }: { logs: Log[] }) {
    return (
        <SuperShell>
            <Head title="Activity Logs — MANAYUN BAGOBO" />

            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">Activity Logs</h1>
                    <p className="text-sm text-muted-foreground">A chronological audit trail of actions across the system.</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {logs.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">No activity has been logged yet.</p>
                ) : (
                    <ul>
                        {logs.map((l, i) => {
                            const Icon = icons[l.icon] ?? ShieldCheck;
                            return (
                                <li
                                    key={l.id}
                                    className={i > 0 ? 'flex items-start gap-3 border-t border-border px-5 py-4' : 'flex items-start gap-3 px-5 py-4'}
                                >
                                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm text-foreground">{l.action}</div>
                                        <div className="text-xs text-muted-foreground">{l.actor}</div>
                                    </div>
                                    <div className="shrink-0 text-xs text-muted-foreground">{l.when}</div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </SuperShell>
    );
}
