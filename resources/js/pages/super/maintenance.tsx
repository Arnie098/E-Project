import { Head } from '@inertiajs/react';
import { Wrench } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <SuperShell>
            <Head title="Maintenance — EPANAW BAGOBO" />
            <PageStub title="Maintenance" description="Maintenance mode and tools." icon={Wrench} />
        </SuperShell>
    );
}
