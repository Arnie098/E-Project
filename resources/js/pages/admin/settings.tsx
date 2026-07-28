import { Head } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import AdminShell from '@/layouts/admin-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <AdminShell>
            <Head title="System Settings — EPANAW BAGOBO" />
            <PageStub title="System Settings" description="Configure the platform." icon={Settings} />
        </AdminShell>
    );
}
