import { Film } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Page({ items, stats }: Props) {
    return (
        <EntityManager
            title="Multimedia Management"
            description="Manage the images, audio, and video that appear in the multimedia gallery."
            icon={Film}
            pageTitle="Multimedia Management - MANAYUN BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.multimedia.store"
            updateRoute="admin.multimedia.update"
            deleteRoute="admin.multimedia.destroy"
            createLabel="Add Media"
            emptyMessage="No media has been added yet."
            fields={[
                { name: 'title', label: 'Title', placeholder: 'Traditional Dance Performance' },
                { name: 'category', label: 'Category', placeholder: 'Cultural Practice' },
                {
                    name: 'media_type',
                    label: 'Type',
                    type: 'select',
                    options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Video', value: 'video' },
                        { label: 'Audio', value: 'audio' },
                    ],
                },
                { name: 'duration', label: 'Duration', placeholder: '04:35 (video/audio only)' },
                { name: 'thumbnail', label: 'Thumbnail Image', type: 'file', accept: 'image/*' },
                { name: 'source_file', label: 'Media Source File', type: 'file', accept: 'image/*,audio/*,video/*' },
            ]}
            columns={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                {
                    key: 'media_type',
                    label: 'Type',
                    type: 'badge',
                    tones: {
                        image: 'bg-tile-blue text-foreground',
                        video: 'bg-tile-amber text-foreground',
                        audio: 'bg-tile-purple text-foreground',
                    },
                },
                { key: 'duration', label: 'Duration' },
                { key: 'updatedAt', label: 'Updated' },
            ]}
        />
    );
}
