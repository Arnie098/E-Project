import { Head } from '@inertiajs/react';
import { Database } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <SuperShell>
            <Head title="Database Management — EPANAW BAGOBO" />
            <PageStub title="Database Management" description="Inspect and manage the database." icon={Database} />
        </SuperShell>
    );
}
