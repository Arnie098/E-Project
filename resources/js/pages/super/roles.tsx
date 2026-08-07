import { Head, Link } from '@inertiajs/react';
import { Check, Minus, ShieldCheck, UserCog, Users } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard } from '@/components/dashboard-layout';
import { cn } from '@/lib/utils';

interface Role {
    key: 'super' | 'admin' | 'learner';
    label: string;
    count: number;
    summary: string;
    permissions: string[];
}

interface MatrixRow {
    area: string;
    super: boolean;
    admin: boolean;
    learner: boolean;
}

const roleMeta: Record<Role['key'], { icon: typeof ShieldCheck; tone: string }> = {
    super: { icon: ShieldCheck, tone: 'bg-tile-purple' },
    admin: { icon: UserCog, tone: 'bg-tile-blue' },
    learner: { icon: Users, tone: 'bg-tile-green' },
};

export default function Roles({ roles, matrix }: { roles: Role[]; matrix: MatrixRow[] }) {
    return (
        <SuperShell>
            <Head title="Role and Permission Management — MANAYUN BAGOBO" />

            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Role &amp; Permission Management</h1>
                        <p className="text-sm text-muted-foreground">The three access levels enforced across the platform.</p>
                    </div>
                </div>
                <Link href="/super/users" className="hidden rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:inline-flex">
                    Manage users
                </Link>
            </div>

            {/* Role cards */}
            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {roles.map((r) => {
                    const meta = roleMeta[r.key];
                    return (
                        <div key={r.key} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                            <div className="flex items-center gap-3">
                                <div className={cn('grid h-11 w-11 place-items-center rounded-xl', meta.tone)}>
                                    <meta.icon className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">{r.label}</div>
                                    <div className="text-xs text-muted-foreground">{r.count} {r.count === 1 ? 'account' : 'accounts'}</div>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{r.summary}</p>
                            <ul className="mt-4 space-y-2 text-sm">
                                {r.permissions.map((p) => (
                                    <li key={p} className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <span className="text-foreground">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Permission matrix */}
            <PanelCard title="Permission Matrix">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="py-3 pr-4 font-medium">Capability</th>
                                <th className="px-4 py-3 text-center font-medium">Super Admin</th>
                                <th className="px-4 py-3 text-center font-medium">Admin</th>
                                <th className="px-4 py-3 text-center font-medium">Learner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row) => (
                                <tr key={row.area} className="border-b border-border last:border-0">
                                    <td className="py-3 pr-4 font-medium text-foreground">{row.area}</td>
                                    <Cell on={row.super} />
                                    <Cell on={row.admin} />
                                    <Cell on={row.learner} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    Permissions are enforced in code via route middleware and are fixed per role. Assign a role to a user from{' '}
                    <Link href="/super/users" className="font-semibold text-foreground underline-offset-4 hover:underline">
                        User Management
                    </Link>
                    .
                </p>
            </PanelCard>
        </SuperShell>
    );
}

function Cell({ on }: { on: boolean }) {
    return (
        <td className="px-4 py-3">
            <div className="flex justify-center">
                {on ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-tile-green text-emerald-700">
                        <Check className="h-4 w-4" />
                    </span>
                ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-muted-foreground/50">
                        <Minus className="h-4 w-4" />
                    </span>
                )}
            </div>
        </td>
    );
}
