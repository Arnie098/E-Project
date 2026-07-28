import { Head, Link } from '@inertiajs/react';
import { Hammer } from 'lucide-react';

export default function Maintenance({ siteName }: { siteName: string }) {
    return (
        <div className="grid min-h-screen place-items-center bg-background px-4">
            <Head title="Under Maintenance" />
            <div className="max-w-md text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-tile-amber text-amber-700">
                    <Hammer className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-2xl font-bold text-foreground">We&rsquo;ll be right back</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {siteName} is undergoing scheduled maintenance to improve your experience. Please check back shortly — your
                    progress is safe.
                </p>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="mt-6 inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                    Log out
                </Link>
            </div>
        </div>
    );
}
