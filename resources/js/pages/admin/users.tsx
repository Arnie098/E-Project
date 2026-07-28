import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CheckCircle2, Search, UserCog } from 'lucide-react';
import AdminShell from '@/layouts/admin-shell';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UserRow {
    id: number;
    name: string;
    username: string | null;
    email: string;
    role: 'learner' | 'admin' | 'super';
    status: 'Active' | 'Inactive';
    joined: string;
}

interface Props {
    users: UserRow[];
    stats: { total: number; staff: number; learners: number };
}

const roleLabel: Record<UserRow['role'], string> = { super: 'Super Admin', admin: 'Admin', learner: 'Learner' };
const roleCls: Record<UserRow['role'], string> = {
    super: 'bg-tile-purple text-purple-800',
    admin: 'bg-tile-blue text-blue-800',
    learner: 'bg-tile-green text-emerald-800',
};

export default function Users({ users, stats }: Props) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('all');

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(
            (u) =>
                (role === 'all' || u.role === role) &&
                (q === '' || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.username ?? '').toLowerCase().includes(q)),
        );
    }, [users, query, role]);

    function toggleStatus(u: UserRow) {
        router.patch(`/admin/users/${u.id}/status`, {}, { preserveScroll: true });
    }

    return (
        <AdminShell>
            <Head title="User Management — EPANAW BAGOBO" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <UserCog className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">User Management</h1>
                        <p className="text-sm text-muted-foreground">Browse accounts and manage learner access.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Stat label="Total" value={stats.total} />
                    <Stat label="Staff" value={stats.staff} />
                    <Stat label="Learners" value={stats.learners} />
                </div>
            </div>

            {flash?.status && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-tile-green px-4 py-3 text-sm font-medium text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    {flash.status}
                </div>
            )}

            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, or username…" className="h-11 pl-10" />
                </div>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-11 rounded-md border border-input bg-transparent px-3 text-sm focus:border-primary focus:outline-none sm:w-48"
                >
                    <option value="all">All roles</option>
                    <option value="learner">Learners</option>
                    <option value="admin">Admins</option>
                    <option value="super">Super Admins</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map((u) => (
                                <tr key={u.id} className="border-b border-border last:border-0">
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-foreground">{u.name}</div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', roleCls[u.role])}>{roleLabel[u.role]}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {u.role === 'learner' ? (
                                            <button
                                                onClick={() => toggleStatus(u)}
                                                title="Toggle learner access"
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                                                    u.status === 'Active' ? 'bg-tile-green text-emerald-800' : 'bg-tile-rose text-rose-800',
                                                )}
                                            >
                                                <span className={cn('h-1.5 w-1.5 rounded-full', u.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600')} />
                                                {u.status}
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                                {u.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
                Admins can activate or deactivate learner access. Role changes and staff accounts are managed by a Super Admin.
            </p>
        </AdminShell>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-border bg-card px-3 py-2 text-center">
            <div className="text-lg font-bold leading-none text-foreground">{value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}
