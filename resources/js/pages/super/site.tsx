import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <SuperShell>
            <Head title="Site Configuration — EPANAW BAGOBO" />
            <PageStub title="Site Configuration" description="Configure the public-facing site." icon={Globe} />
        </SuperShell>
    );
}
