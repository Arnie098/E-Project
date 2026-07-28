import { Head } from '@inertiajs/react';
import { HardDriveDownload } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <SuperShell>
            <Head title="Backup and Restore — EPANAW BAGOBO" />
            <PageStub title="Backup and Restore" description="Manage backups and restore points." icon={HardDriveDownload} />
        </SuperShell>
    );
}
