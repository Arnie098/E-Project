import { Users } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Page({ items, stats }: Props) {
    return (
        <EntityManager
            title="Community Contributions"
            description="Moderate submitted stories and assets, then move them through the review workflow."
            icon={Users}
            pageTitle="Community Contributions - MANAYUN BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.contributions.store"
            updateRoute="admin.contributions.update"
            deleteRoute="admin.contributions.destroy"
            createLabel="Add Submission"
            emptyMessage="No contributions have been submitted yet."
            fields={[
                { name: 'contributor_name', label: 'Contributor Name', placeholder: 'Ana Reyes' },
                { name: 'item', label: 'Submission Title', placeholder: 'Bagobo weaving story' },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the submitted story or asset.' },
                {
                    name: 'type',
                    label: 'Type',
                    type: 'select',
                    options: [
                        { label: 'Story', value: 'Story' },
                        { label: 'Audio', value: 'Audio' },
                        { label: 'Image', value: 'Image' },
                        { label: 'Text', value: 'Text' },
                    ],
                },
                { name: 'remarks', label: 'Review Remarks', type: 'textarea', placeholder: 'Explain the approval or rejection decision.' },
                {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { label: 'Pending', value: 'Pending' },
                        { label: 'Approved', value: 'Approved' },
                        { label: 'Rejected', value: 'Rejected' },
                    ],
                },
            ]}
            columns={[
                { key: 'contributor_name', label: 'Contributor' },
                { key: 'item', label: 'Item' },
                { key: 'type', label: 'Type' },
                {
                    key: 'status',
                    label: 'Status',
                    type: 'badge',
                    tones: {
                        Pending: 'bg-tile-amber text-foreground',
                        Approved: 'bg-tile-green text-foreground',
                        Rejected: 'bg-tile-rose text-foreground',
                    },
                },
            ]}
        />
    );
}
