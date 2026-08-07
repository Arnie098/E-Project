import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { BookOpen, Calendar, Camera, Clock, Eye, GraduationCap, Mail, MessageSquare, Star, Trophy, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { PanelCard } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Activity {
    icon: string;
    text: string;
    when: string;
}

interface Props {
    profile: { name: string; email: string; username: string | null; role: string; bio: string | null; location: string | null; avatar: string | null; memberSince: string };
    accountSummary: { role: string; memberSince: string; modulesCompleted: number; certificatesEarned: number };
    achievements: { name: string; description: string | null; icon: string | null; earnedAt: string | null }[];
    recentActivity: Activity[];
}

const iconMap: Record<string, LucideIcon> = {
    'book-open': BookOpen,
    'message-square': MessageSquare,
    star: Star,
    eye: Eye,
    trophy: Trophy,
    users: Users,
};

// Tinted icon backgrounds per achievement, matching the mockup hexagons.
const achievementTint: Record<string, string> = {
    'book-open': 'bg-emerald-100 text-emerald-700',
    'message-square': 'bg-blue-100 text-blue-700',
    star: 'bg-purple-100 text-purple-700',
};

const tabs = ['Profile Information', 'Preferences', 'Privacy & Security', 'Notifications'];

export default function Settings({ profile, accountSummary, achievements, recentActivity }: Props) {
    const [tab, setTab] = useState(tabs[0]);
    const avatarInput = useRef<HTMLInputElement>(null);
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        name: profile.name,
        email: profile.email,
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        avatar: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('user.settings.update'), { preserveScroll: true, forceFormData: true });
    };

    const initials = profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('');

    return (
        <UserShell>
            <Head title="Profile Settings — MANAYUN BAGOBO" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Profile Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage your account information, preferences, and privacy settings.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <PanelCard title="">
                        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                            <div className="relative">
                                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-muted text-2xl font-bold text-foreground">
                                    {data.avatar ? <img src={URL.createObjectURL(data.avatar)} alt="Profile preview" className="h-full w-full object-cover" /> : profile.avatar ? <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" /> : initials}
                                </div>
                                <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(event) => setData('avatar', event.target.files?.[0] ?? null)} />
                                <button type="button" onClick={() => avatarInput.current?.click()} className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground" aria-label="Choose profile photo">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="min-w-0 text-center sm:text-left">
                                <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                                <div className="text-sm text-muted-foreground">{profile.role}</div>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{profile.email}</div>
                                    <div className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />Member since {profile.memberSince}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-6 border-b border-border text-sm">
                            {tabs.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={cn(
                                        '-mb-px border-b-2 pb-3 font-medium transition-colors',
                                        tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {tab === 'Profile Information' ? (
                            <form onSubmit={submit} className="mt-6 space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Learning Role</Label>
                                    <Input id="role" value={profile.role} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>Save Changes</Button>
                                    <Button type="button" variant="outline" onClick={() => setData({ name: profile.name, email: profile.email, bio: profile.bio ?? '', location: profile.location ?? '', avatar: null })}>Cancel</Button>
                                    {recentlySuccessful && <span className="text-sm text-green-600">Saved.</span>}
                                </div>
                            </form>
                        ) : (
                            <p className="mt-6 text-sm text-muted-foreground">This section is coming soon.</p>
                        )}
                    </PanelCard>
                </div>

                <div className="space-y-6">
                    <PanelCard title="Account Summary">
                        <ul className="space-y-3 text-sm">
                            <SummaryRow icon={GraduationCap} label="Learning Role" value={accountSummary.role} />
                            <SummaryRow icon={Calendar} label="Member Since" value={accountSummary.memberSince} />
                            <SummaryRow icon={Clock} label="Last Active" value="Today" />
                            <SummaryRow icon={BookOpen} label="Modules Completed" value={String(accountSummary.modulesCompleted)} />
                            <SummaryRow icon={Trophy} label="Certificates Earned" value={String(accountSummary.certificatesEarned)} />
                        </ul>
                    </PanelCard>

                    <PanelCard
                        title="Achievements"
                        action={<span className="text-xs font-semibold text-foreground hover:underline">View All</span>}
                    >
                        <ul className="space-y-4">
                            {achievements.map((a) => {
                                const Icon = iconMap[a.icon ?? ''] ?? Star;
                                return (
                                    <li key={a.name} className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                                                achievementTint[a.icon ?? ''] ?? 'bg-secondary text-foreground',
                                            )}
                                            style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-foreground">{a.name}</div>
                                            <div className="text-xs text-muted-foreground">{a.description}</div>
                                            {a.earnedAt && <div className="mt-0.5 text-[11px] text-muted-foreground">Earned on {a.earnedAt}</div>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </PanelCard>

                    <PanelCard
                        title="Recent Activity"
                        action={<span className="text-xs font-semibold text-foreground hover:underline">View All</span>}
                    >
                        <ul className="space-y-3">
                            {recentActivity.map((a, i) => {
                                const Icon = iconMap[a.icon] ?? BookOpen;
                                return (
                                    <li key={i} className="flex items-center gap-3 text-sm">
                                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="min-w-0 flex-1 truncate text-foreground">{a.text}</span>
                                        <span className="shrink-0 text-xs text-muted-foreground">{a.when}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </PanelCard>
                </div>
            </div>
        </UserShell>
    );
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <li className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" />{label}</span>
            <span className="font-semibold text-foreground">{value}</span>
        </li>
    );
}
