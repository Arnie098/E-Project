import { Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PageStub } from '@/components/page-stub';

export default function Page() {
    return (
        <SuperShell>
            <Head title="Subscription Management — EPANAW BAGOBO" />
            <PageStub title="Subscription Management" description="Manage subscriptions and billing." icon={CreditCard} />
        </SuperShell>
    );
}
