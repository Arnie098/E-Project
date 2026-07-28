import { Calendar } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Page({ items, stats }: Props) {
    return (
        <EntityManager
            title="Events Management"
            description="Schedule cultural sessions, workshops, and community events from one place."
            icon={Calendar}
            pageTitle="Events Management - EPANAW BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.events.store"
            updateRoute="admin.events.update"
            deleteRoute="admin.events.destroy"
            createLabel="Add Event"
            emptyMessage="No events have been scheduled yet."
            fields={[
                { name: 'title', label: 'Event Title', placeholder: 'Cultural Storytelling Session' },
                { name: 'starts_at', label: 'Starts At', type: 'datetime-local' },
                { name: 'location', label: 'Location', placeholder: 'Community Hall' },
            ]}
            columns={[
                { key: 'title', label: 'Title' },
                { key: 'startsAtLabel', label: 'Starts' },
                { key: 'location', label: 'Location' },
                { key: 'updatedAt', label: 'Updated' },
            ]}
        />
    );
}
