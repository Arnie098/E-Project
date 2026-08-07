import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowRight, BookOpen, Building2, CalendarDays, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import AdminShell from '@/layouts/admin-shell';
import { PanelCard, SummaryTiles, WelcomeHero, type SummaryTile } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import heroImg from '@/assets/heritage-hero.jpg';

interface Props {
    stats: { activeLearners: number; learningMaterials: number; repositoryItems: number; pendingReviews: number; feedback: number };
    contributions: { id: number; user: string; item: string; type: string; status: string }[];
    events: { title: string; when: string }[];
    activity: { text: string; actor: string; when: string }[];
}

export default function AdminDashboard({ stats, contributions, events, activity }: Props) {
    const tiles: SummaryTile[] = [
        { label: 'Active Learners', value: String(stats.activeLearners), cta: 'Manage Users', tone: 'blue', icon: Users, href: '/admin/users' },
        { label: 'Learning Materials', value: String(stats.learningMaterials), cta: 'Manage Materials', tone: 'green', icon: BookOpen, href: '/admin/learning-materials' },
        { label: 'Repository Items', value: String(stats.repositoryItems), cta: 'Manage Repository', tone: 'purple', icon: Building2, href: '/admin/cultural-repository' },
        { label: 'Pending Reviews', value: String(stats.pendingReviews), cta: 'Review Now', tone: 'amber', icon: ShieldCheck, href: '/admin/contributions' },
        { label: 'Feedback', value: String(stats.feedback), cta: 'View Feedback', tone: 'rose', icon: MessageCircle, href: '/admin/feedback' },
    ];

    return (
        <AdminShell>
            <Head title="Admin Dashboard — MANAYUN BAGOBO" />
            <WelcomeHero
                greeting="Welcome back, Maria!"
                subtitle="Curate learning materials, moderate contributions, and support the community."
                image={heroImg}
            />
            <SummaryTiles tiles={tiles} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <PanelCard
                    title="Pending Contributions"
                    className="xl:col-span-2"
                    action={<Link href="/admin/contributions" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                                    <th className="py-2 font-medium">Contributor</th>
                                    <th className="py-2 font-medium">Item</th>
                                    <th className="py-2 font-medium">Type</th>
                                    <th className="py-2 font-medium">Status</th>
                                    <th className="py-2 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contributions.map((c, i) => (
                                    <tr key={i} className="border-b border-border last:border-0">
                                        <td className="py-3 font-medium text-foreground">{c.user}</td>
                                        <td className="py-3 text-muted-foreground">{c.item}</td>
                                        <td className="py-3 text-muted-foreground">{c.type}</td>
                                        <td className="py-3">
                                            <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ' + (c.status === 'Approved' ? 'bg-tile-green text-foreground' : 'bg-tile-amber text-foreground')}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="/admin/contributions">Review</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </PanelCard>

                <div className="space-y-6">
                    <PanelCard title="Recent Activity">
                        <ul className="space-y-3 text-sm">
                            {activity.map((entry, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-foreground">{entry.text}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {entry.actor} • {entry.when}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </PanelCard>

                    <PanelCard title="Upcoming Events" action={<Link href="/admin/events" className="text-xs font-semibold text-foreground hover:underline">Manage</Link>}>
                        <ul className="space-y-3">
                            {events.map((e) => (
                                <li key={e.title} className="flex items-start gap-3 rounded-lg border border-border p-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold">{e.title}</div>
                                        <div className="text-xs text-muted-foreground">{e.when}</div>
                                    </div>
                                    <Link href="/admin/events" className="text-muted-foreground">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </PanelCard>
                </div>
            </div>
        </AdminShell>
    );
}
