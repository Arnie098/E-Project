import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { CheckCircle2, Settings as SettingsIcon, TriangleAlert } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard } from '@/components/dashboard-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    settings: { siteName: string; tagline: string; maintenance: boolean };
}

export default function SystemSettings({ settings }: Props) {
    const flash = (usePage().props as { flash?: { status?: string } }).flash;
    const { data, setData, patch, processing } = useForm({
        siteName: settings.siteName,
        tagline: settings.tagline,
        maintenance: settings.maintenance,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        patch('/super/settings', { preserveScroll: true });
    }

    return (
        <SuperShell>
            <Head title="System Settings — MANAYUN BAGOBO" />

            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <SettingsIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">System Settings</h1>
                    <p className="text-sm text-muted-foreground">Configure the platform. Changes take effect immediately.</p>
                </div>
            </div>

            {flash?.status && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-tile-green px-4 py-3 text-sm font-medium text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    {flash.status}
                </div>
            )}

            <form onSubmit={submit} className="max-w-2xl space-y-6">
                <PanelCard title="Site Identity">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Site name</label>
                            <Input value={data.siteName} onChange={(e) => setData('siteName', e.target.value)} placeholder="MANAYUN BAGOBO" />
                            <p className="text-xs text-muted-foreground">Shown in the header brand and footer across the platform.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Tagline</label>
                            <Input value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} placeholder="Preserve. Revitalize. Inspire." />
                        </div>
                    </div>
                </PanelCard>

                <PanelCard title="Maintenance Mode">
                    <button
                        type="button"
                        onClick={() => setData('maintenance', !data.maintenance)}
                        className={cn(
                            'flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors',
                            data.maintenance ? 'border-amber-300 bg-tile-amber' : 'border-border bg-secondary/30',
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <TriangleAlert className={cn('mt-0.5 h-5 w-5 shrink-0', data.maintenance ? 'text-amber-700' : 'text-muted-foreground')} />
                            <div>
                                <div className="text-sm font-semibold text-foreground">Learner maintenance mode</div>
                                <p className="text-xs text-muted-foreground">
                                    When on, learners see a maintenance notice. Admins and Super Admins keep full access.
                                </p>
                            </div>
                        </div>
                        <span
                            className={cn(
                                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                                data.maintenance ? 'bg-amber-500' : 'bg-muted-foreground/30',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                                    data.maintenance ? 'translate-x-[22px]' : 'translate-x-0.5',
                                )}
                            />
                        </span>
                    </button>
                </PanelCard>

                <Button type="submit" size="lg" disabled={processing}>
                    {processing ? 'Saving…' : 'Save Settings'}
                </Button>
            </form>
        </SuperShell>
    );
}
