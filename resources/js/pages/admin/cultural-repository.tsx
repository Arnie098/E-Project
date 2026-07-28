import { Building2 } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Page({ items, stats }: Props) {
    return (
        <EntityManager
            title="Cultural Repository"
            description="Maintain the archive of documents, images, and cultural references used across the platform."
            icon={Building2}
            pageTitle="Cultural Repository - EPANAW BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.cultural-repository.store"
            updateRoute="admin.cultural-repository.update"
            deleteRoute="admin.cultural-repository.destroy"
            createLabel="Add Repository Item"
            emptyMessage="No repository items are available yet."
            fields={[
                { name: 'title', label: 'Title', placeholder: 'Traditional Attire Photo' },
                { name: 'category', label: 'Category', placeholder: 'Images' },
                {
                    name: 'type',
                    label: 'Type',
                    type: 'select',
                    options: [
                        { label: 'Text', value: 'Text' },
                        { label: 'Image', value: 'Image' },
                        { label: 'Audio', value: 'Audio' },
                        { label: 'Video', value: 'Video' },
                        { label: 'Document', value: 'Document' },
                    ],
                },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the cultural reference.' },
                { name: 'media', label: 'Media Path', placeholder: '/heritage-hero.jpg' },
            ]}
            columns={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                {
                    key: 'type',
                    label: 'Type',
                    type: 'badge',
                    tones: {
                        Image: 'bg-tile-blue text-foreground',
                        Text: 'bg-tile-green text-foreground',
                        Audio: 'bg-tile-purple text-foreground',
                        Video: 'bg-tile-amber text-foreground',
                        Document: 'bg-tile-rose text-foreground',
                    },
                },
                { key: 'updatedAt', label: 'Updated' },
            ]}
        />
    );
}
