import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <SuperShell>
            <Head title="Security Management — EPANAW BAGOBO" />
            <PageStub title="Security Management" description="Security controls and monitoring." icon={ShieldCheck} />
        </SuperShell>
    );
}
