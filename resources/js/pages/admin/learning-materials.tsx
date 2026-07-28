import { BookOpen } from 'lucide-react';
import { EntityManager } from '@/components/admin/entity-manager';

interface Props {
    items: ({ id: number } & Record<string, string | number | null>)[];
    stats: { label: string; value: string }[];
}

export default function Page({ items, stats }: Props) {
    return (
        <EntityManager
            title="Learning Materials"
            description="Author lessons, set module and difficulty, write lesson content, and manage each lesson's quiz."
            icon={BookOpen}
            pageTitle="Learning Materials - EPANAW BAGOBO"
            items={items}
            stats={stats}
            createRoute="admin.learning-materials.store"
            updateRoute="admin.learning-materials.update"
            deleteRoute="admin.learning-materials.destroy"
            createLabel="Add Lesson"
            emptyMessage="No lessons have been created yet."
            rowAction={{ label: 'Quiz', href: (item) => `/admin/learning-materials/${item.id}/quiz` }}
            fields={[
                { name: 'title', label: 'Title', placeholder: 'Introduction to Bagobo Tagabawa Culture' },
                {
                    name: 'module',
                    label: 'Module',
                    type: 'select',
                    options: [
                        { label: 'Language', value: 'Language' },
                        { label: 'Culture', value: 'Culture' },
                    ],
                },
                {
                    name: 'difficulty',
                    label: 'Difficulty',
                    type: 'select',
                    options: [
                        { label: 'Beginner', value: 'Beginner' },
                        { label: 'Intermediate', value: 'Intermediate' },
                        { label: 'Advanced', value: 'Advanced' },
                    ],
                },
                { name: 'category', label: 'Category', placeholder: 'Culture' },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'A short summary shown in the catalog.' },
                { name: 'content', label: 'Lesson Content', type: 'textarea', placeholder: 'The full lesson the learner reads before the quiz.' },
                { name: 'image', label: 'Image Path', placeholder: '/heritage-hero.jpg' },
            ]}
            columns={[
                { key: 'title', label: 'Title' },
                {
                    key: 'module',
                    label: 'Module',
                    type: 'badge',
                    tones: { Language: 'bg-tile-blue text-foreground', Culture: 'bg-tile-green text-foreground' },
                },
                { key: 'difficulty', label: 'Difficulty' },
                { key: 'questions', label: 'Questions' },
                { key: 'updatedAt', label: 'Updated' },
            ]}
        />
    );
}
