import { Head, Link, router, usePage } from '@inertiajs/react';
import { HardDriveDownload } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';

export default function Backup({ backups }: { backups: string[] }) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;

    return (
        <SuperShell>
            <Head title="System Backups — MANAYUN BAGOBO" />
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HardDriveDownload className="h-8 w-8" />
                    <div>
                        <h1 className="text-2xl font-bold">System Backups</h1>
                        <p className="text-sm text-muted-foreground">
                            Encrypted content and configuration snapshots. User accounts, credentials, sessions, tokens,
                            and chat history are excluded. The 10 newest backups are kept. Restore is not available
                            from the web interface.
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.post('/super/backup')}>Create Backup</Button>
            </div>

            {flash?.status && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{flash.status}</p>}

            <PanelCard title="Available Backups">
                {backups.length ? (
                    <ul className="space-y-3">
                        {backups.map((file) => {
                            const name = file.replace('backups/', '');

                            return (
                                <li key={file} className="flex items-center justify-between text-sm">
                                    <span>{name}</span>
                                    <Link href={`/super/backup/${name}`} className="font-medium underline">
                                        Download encrypted file
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No backups created yet.</p>
                )}
            </PanelCard>
        </SuperShell>
    );
}
