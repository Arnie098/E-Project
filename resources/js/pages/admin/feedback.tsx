import { MessageCircle } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Page({ items, stats }: Props) {
    return (
        <EntityManager
            title="Feedback Management"
            description="Track incoming learner feedback, update case status, and keep support conversations organized."
            icon={MessageCircle}
            pageTitle="Feedback Management - EPANAW BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.feedback.store"
            updateRoute="admin.feedback.update"
            deleteRoute="admin.feedback.destroy"
            createLabel="Add Feedback Entry"
            emptyMessage="No feedback has been logged yet."
            fields={[
                { name: 'subject', label: 'Subject', placeholder: 'Great platform' },
                { name: 'body', label: 'Details', type: 'textarea', placeholder: 'Capture the learner comment or support note.' },
                {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { label: 'Open', value: 'Open' },
                        { label: 'In Review', value: 'In Review' },
                        { label: 'Closed', value: 'Closed' },
                    ],
                },
            ]}
            columns={[
                { key: 'subject', label: 'Subject' },
                { key: 'user', label: 'Learner' },
                {
                    key: 'status',
                    label: 'Status',
                    type: 'badge',
                    tones: {
                        Open: 'bg-tile-amber text-foreground',
                        'In Review': 'bg-tile-blue text-foreground',
                        Closed: 'bg-tile-green text-foreground',
                    },
                },
                { key: 'updatedAt', label: 'Updated' },
            ]}
        />
    );
}
