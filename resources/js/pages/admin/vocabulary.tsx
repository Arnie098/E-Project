import { Languages } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Vocabulary({ items, stats }: Props) {
    return (
        <EntityManager
            title="Vocabulary & Pronunciation"
            description="Add verified Bagobo Tagabawa words, meanings, usage notes, and optional native-speaker recordings."
            icon={Languages}
            pageTitle="Vocabulary & Pronunciation - MANAYUN BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.vocabulary.store"
            updateRoute="admin.vocabulary.update"
            deleteRoute="admin.vocabulary.destroy"
            createLabel="Add Vocabulary Word"
            emptyMessage="No vocabulary words have been added yet."
            rowMutation={{ label: 'Verify', route: 'admin.vocabulary.verify', isVisible: (item) => item.verified !== 'Verified' }}
            fields={[
                { name: 'word', label: 'Bagobo Tagabawa Word', placeholder: 'Salamat' },
                { name: 'meaning', label: 'Meaning', placeholder: 'Thank you' },
                { name: 'pronunciation', label: 'Pronunciation Guide', placeholder: 'sa-la-mat' },
                { name: 'category', label: 'Category', placeholder: 'Expression' },
                { name: 'example', label: 'Usage Note / Example', type: 'textarea', placeholder: 'Explain how the word is used.' },
                { name: 'native_speaker', label: 'Native Speaker', placeholder: 'Elder Juan' },
                { name: 'audio_file', label: 'Pronunciation Audio', type: 'file', accept: 'audio/mpeg,audio/wav,audio/x-m4a,audio/ogg,.mp3,.wav,.m4a,.ogg' },
            ]}
            columns={[
                { key: 'word', label: 'Word' },
                { key: 'meaning', label: 'Meaning' },
                { key: 'category', label: 'Category' },
                { key: 'native_speaker', label: 'Speaker' },
                { key: 'verified', label: 'Verified' },
            ]}
        />
    );
}
