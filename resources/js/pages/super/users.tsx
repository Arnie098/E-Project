import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Trash2, UserCog } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

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
    roleCounts: { super: number; admin: number; learner: number };
}

const roleLabel: Record<UserRow['role'], string> = { super: 'Super Admin', admin: 'Admin', learner: 'Learner' };

const roleCls: Record<UserRow['role'], string> = {
    super: 'bg-tile-purple text-purple-800',
    admin: 'bg-tile-blue text-blue-800',
    learner: 'bg-tile-green text-emerald-800',
};

export default function Users({ users, roleCounts }: Props) {
    const page = usePage<SharedData>();
    const flash = (page.props as unknown as { flash?: { status?: string } }).flash;
    const me = page.props.auth.user;

    function changeRole(u: UserRow, role: string) {
        router.patch(`/super/users/${u.id}`, { role, status: u.status }, { preserveScroll: true });
    }

    function toggleStatus(u: UserRow) {
        router.patch(
            `/super/users/${u.id}`,
            { role: u.role, status: u.status === 'Active' ? 'Inactive' : 'Active' },
            { preserveScroll: true },
        );
    }

    function remove(u: UserRow) {
        if (confirm(`Delete ${u.name}'s account? This cannot be undone.`)) {
            router.delete(`/super/users/${u.id}`, { preserveScroll: true });
        }
    }

    return (
        <SuperShell>
            <Head title="User Management — MANAYUN BAGOBO" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <UserCog className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">User Management</h1>
                        <p className="text-sm text-muted-foreground">Manage accounts, roles, and access across the platform.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Stat label="Super" value={roleCounts.super} />
                    <Stat label="Admins" value={roleCounts.admin} />
                    <Stat label="Learners" value={roleCounts.learner} />
                </div>
            </div>

            {flash?.status && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-tile-green px-4 py-3 text-sm font-medium text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    {flash.status}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Joined</th>
                                <th className="px-5 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const isMe = u.id === me.id;
                                return (
                                    <tr key={u.id} className="border-b border-border last:border-0">
                                        <td className="px-5 py-3">
                                            <div className="font-medium text-foreground">
                                                {u.name}
                                                {isMe && <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">You</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <select
                                                value={u.role}
                                                disabled={isMe}
                                                onChange={(e) => changeRole(u, e.target.value)}
                                                className={cn(
                                                    'rounded-lg border-0 px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60',
                                                    roleCls[u.role],
                                                )}
                                            >
                                                <option value="learner">Learner</option>
                                                <option value="admin">Admin</option>
                                                <option value="super">Super Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => toggleStatus(u)}
                                                disabled={isMe}
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-60',
                                                    u.status === 'Active' ? 'bg-tile-green text-emerald-800' : 'bg-tile-rose text-rose-800',
                                                )}
                                            >
                                                <span className={cn('h-1.5 w-1.5 rounded-full', u.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600')} />
                                                {u.status}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={() => remove(u)}
                                                disabled={isMe}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label={`Delete ${u.name}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
                {roleLabel.super}s cannot change their own role or delete their own account, and the last Super Admin is protected.
            </p>
        </SuperShell>
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
