import { Head } from '@inertiajs/react';
import { Database } from 'lucide-react';
import SuperShell from '@/layouts/super-shell';
import { PanelCard } from '@/components/dashboard-layout';

export default function DatabaseManagement({ connection, database, tables }: { connection: string; database: string; tables: { name: string; rows: number }[] }) {
    return <SuperShell><Head title="Database Management — MANAYUN BAGOBO" /><div className="mb-6 flex items-center gap-3"><Database className="h-8 w-8" /><div><h1 className="text-2xl font-bold">Database Management</h1><p className="text-sm text-muted-foreground">Live database health and content counts.</p></div></div><div className="grid gap-4 md:grid-cols-2"><PanelCard title="Connection"><p className="text-sm">Driver: <b>{connection}</b></p><p className="mt-2 text-sm">Database: <b>{database}</b></p></PanelCard><PanelCard title="Tracked Tables"><div className="space-y-2">{tables.map((table) => <div key={table.name} className="flex justify-between text-sm"><span>{table.name}</span><b>{table.rows.toLocaleString()} rows</b></div>)}</div></PanelCard></div></SuperShell>;
}
