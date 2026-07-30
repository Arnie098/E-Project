<?php

namespace App\Services;

use App\Models\Event;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\RepositoryItem;
use App\Models\Story;
use App\Models\VocabularyWord;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Builds a verified, relevance-ranked context block from platform data for the
 * AI chatbot. Retrieval combines lexical full-text scoring, tag/category
 * boosting, and an optional embeddings layer (when configured).
 */
class PlatformKnowledgeBase
{
    private const CANDIDATES_PER_SOURCE = 40;

    private const EMBED_CANDIDATES = 24;

    private const TITLE_WEIGHT = 5.0;

    private const BODY_WEIGHT = 1.0;

    private const TAG_WEIGHT = 3.0;

    private const PHRASE_WEIGHT = 8.0;

    private const EMBED_WEIGHT = 12.0;

    private const STOPWORDS = [
        'the', 'and', 'for', 'are', 'you', 'your', 'with', 'what', 'when', 'where',
        'which', 'about', 'tell', 'give', 'show', 'can', 'how', 'does', 'did', 'has',
        'have', 'from', 'this', 'that', 'these', 'those', 'into', 'was', 'were',
        'will', 'would', 'could', 'should', 'please', 'there', 'their', 'they',
    ];

    public function context(string $message, int $limit = 12): string
    {
        $terms = $this->terms($message);
        $documents = $this->candidates($terms);

        if ($documents->isEmpty()) {
            return 'No matching verified platform records were found for this question.';
        }

        $ranked = $documents->map(function (array $doc) use ($message, $terms) {
            $doc['score'] = $this->lexicalScore($doc, $message, $terms);

            return $doc;
        });

        $ranked = $this->applyEmbeddings($ranked, $message);

        $top = $ranked->sortByDesc('score')->values()->take($limit);

        return $this->format($top);
    }

    /**
     * @return array<int, string>
     */
    private function terms(string $message): array
    {
        $terms = collect(preg_split('/[^\pL\pN-]+/u', mb_strtolower($message), -1, PREG_SPLIT_NO_EMPTY))
            ->map(fn ($term) => trim($term))
            ->filter(fn ($term) => mb_strlen($term) >= 3)
            ->reject(fn ($term) => in_array($term, self::STOPWORDS, true))
            ->unique()
            ->take(10)
            ->values()
            ->all();

        return empty($terms) ? ['bagobo', 'tagabawa'] : $terms;
    }

    private function candidates(array $terms): Collection
    {
        $documents = collect();

        VocabularyWord::query()
            ->with('pronunciationRecord')
            ->where(fn (Builder $q) => $this->whereLikeAny($q, ['word', 'meaning', 'pronunciation', 'category', 'example'], $terms))
            ->limit(self::CANDIDATES_PER_SOURCE)
            ->get()
            ->each(function (VocabularyWord $word) use ($documents) {
                $record = $word->pronunciationRecord;
                $documents->push([
                    'source' => 'vocabulary',
                    'group' => 'Vocabulary Dictionary',
                    'id' => $word->id,
                    'title' => (string) $word->word,
                    'tags' => array_values(array_filter([$word->category])),
                    'searchable' => $this->joinFields([$word->word, $word->meaning, $word->pronunciation, $word->category, $word->example]),
                    'line' => $word->word.' | Meaning: '.($word->meaning ?: 'not listed').' | Pronunciation: '.($word->pronunciation ?: 'not listed').' | Category: '.($word->category ?: 'not listed').' | Example: '.($word->example ?: 'not listed').' | Native speaker: '.($record?->native_speaker ?: 'not listed').' | Verified: '.($record?->verified_at?->toDateString() ?: 'not verified'),
                ]);
            });

        RepositoryItem::query()
            ->where(fn (Builder $q) => $this->whereLikeAny($q, ['title', 'category', 'type', 'description'], $terms))
            ->limit(self::CANDIDATES_PER_SOURCE)
            ->get()
            ->each(function (RepositoryItem $item) use ($documents) {
                $documents->push([
                    'source' => 'repository',
                    'group' => 'Cultural Repository',
                    'id' => $item->id,
                    'title' => (string) $item->title,
                    'tags' => array_values(array_filter([$item->category, $item->type])),
                    'searchable' => $this->joinFields([$item->title, $item->category, $item->type, $item->description]),
                    'line' => $item->title.' | Category: '.($item->category ?: 'not listed').' | Type: '.($item->type ?: 'not listed').' | Description: '.($item->description ?: 'not listed'),
                ]);
            });

        Story::query()
            ->where(fn (Builder $q) => $this->whereLikeAny($q, ['title', 'story_type', 'author', 'summary'], $terms))
            ->limit(self::CANDIDATES_PER_SOURCE)
            ->get()
            ->each(function (Story $story) use ($documents) {
                $categories = is_array($story->categories) ? $story->categories : [];
                $documents->push([
                    'source' => 'story',
                    'group' => 'Storytelling Archive',
                    'id' => $story->id,
                    'title' => (string) $story->title,
                    'tags' => array_values(array_filter(array_merge([$story->story_type], $categories))),
                    'searchable' => $this->joinFields(array_merge([$story->title, $story->story_type, $story->author, $story->summary], $categories)),
                    'line' => $story->title.' | Type: '.($story->story_type ?: 'not listed').' | Author: '.($story->author ?: 'not listed').' | Summary: '.($story->summary ?: 'not listed').' | Categories: '.(empty($categories) ? 'not listed' : implode(', ', $categories)),
                ]);
            });

        LearningModule::query()
            ->where(fn (Builder $q) => $this->whereLikeAny($q, ['title', 'description', 'category', 'module', 'difficulty', 'content'], $terms))
            ->limit(self::CANDIDATES_PER_SOURCE)
            ->get()
            ->each(function (LearningModule $module) use ($documents) {
                $documents->push([
                    'source' => 'module',
                    'group' => 'Learning Modules',
                    'id' => $module->id,
                    'title' => (string) $module->title,
                    'tags' => array_values(array_filter([$module->category, $module->module, $module->difficulty])),
                    'searchable' => $this->joinFields([$module->title, $module->description, $module->category, $module->module, $module->difficulty, $module->content]),
                    'line' => $module->title.' | Category: '.($module->category ?: 'not listed').' | Module: '.($module->module ?: 'not listed').' | Difficulty: '.($module->difficulty ?: 'not listed').' | Description: '.($module->description ?: 'not listed'),
                ]);
            });

        MediaItem::query()
            ->where(fn (Builder $q) => $this->whereLikeAny($q, ['title', 'category', 'media_type', 'duration'], $terms))
            ->limit(self::CANDIDATES_PER_SOURCE)
            ->get()
            ->each(function (MediaItem $item) use ($documents) {
                $documents->push([
                    'source' => 'media',
                    'group' => 'Multimedia Gallery',
                    'id' => $item->id,
                    'title' => (string) $item->title,
                    'tags' => array_values(array_filter([$item->category, $item->media_type])),
                    'searchable' => $this->joinFields([$item->title, $item->category, $item->media_type, $item->duration]),
                    'line' => $item->title.' | Category: '.($item->category ?: 'not listed').' | Type: '.($item->media_type ?: 'not listed').' | Published: '.($item->published_at?->toDateString() ?: 'not listed').' | Duration: '.($item->duration ?: 'not listed'),
                ]);
            });

        Event::query()
            ->where(fn (Builder $q) => $this->whereLikeAny($q, ['title', 'location'], $terms))
            ->orWhere('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->limit(self::CANDIDATES_PER_SOURCE)
            ->get()
            ->each(function (Event $event) use ($documents) {
                $documents->push([
                    'source' => 'event',
                    'group' => 'Events',
                    'id' => $event->id,
                    'title' => (string) $event->title,
                    'tags' => array_values(array_filter([$event->location])),
                    'searchable' => $this->joinFields([$event->title, $event->location]),
                    'line' => $event->title.' | Starts: '.($event->starts_at?->toDayDateTimeString() ?: 'not listed').' | Location: '.($event->location ?: 'not listed'),
                ]);
            });

        return $documents;
    }

    private function lexicalScore(array $doc, string $message, array $terms): float
    {
        $title = mb_strtolower((string) ($doc['title'] ?? ''));
        $body = mb_strtolower((string) ($doc['searchable'] ?? ''));
        $tags = array_map('mb_strtolower', $doc['tags'] ?? []);
        $phrase = trim(mb_strtolower($message));

        $score = 0.0;

        foreach ($terms as $term) {
            $score += substr_count($title, $term) * self::TITLE_WEIGHT;
            $score += substr_count($body, $term) * self::BODY_WEIGHT;

            foreach ($tags as $tag) {
                if (str_contains($tag, $term)) {
                    $score += self::TAG_WEIGHT;
                }
            }
        }

        if ($phrase !== '' && str_contains($title.' '.$body, $phrase)) {
            $score += self::PHRASE_WEIGHT;
        }

        return $score;
    }

    private function applyEmbeddings(Collection $ranked, string $message): Collection
    {
        $embedder = app(AiEmbeddingClient::class);
        if (! $embedder->enabled()) {
            return $ranked;
        }

        $queryVector = $embedder->embed($message);
        if ($queryVector === null) {
            return $ranked;
        }

        $embedKeys = $ranked->sortByDesc('score')->take(self::EMBED_CANDIDATES)->keys();

        return $ranked->map(function (array $doc, $key) use ($embedder, $queryVector, $embedKeys) {
            if (! $embedKeys->contains($key)) {
                return $doc;
            }

            $vector = $embedder->embedCached($doc['source'], (int) $doc['id'], (string) $doc['searchable']);
            if ($vector !== null) {
                $doc['score'] += AiEmbeddingClient::cosine($queryVector, $vector) * self::EMBED_WEIGHT;
            }

            return $doc;
        });
    }

    private function format(Collection $docs): string
    {
        if ($docs->isEmpty()) {
            return 'No matching verified platform records were found for this question.';
        }

        return $docs->groupBy('group')->map(function (Collection $items, string $group) {
            return $group.":\n".$items->map(fn (array $doc) => '- '.$doc['line'])->implode("\n");
        })->implode("\n\n");
    }

    private function whereLikeAny(Builder $query, array $columns, array $terms): Builder
    {
        foreach ($terms as $term) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'like', '%'.$term.'%');
            }
        }

        return $query;
    }

    private function joinFields(array $fields): string
    {
        return trim(implode(' ', array_filter(array_map(fn ($value) => is_string($value) ? trim($value) : (string) $value, $fields))));
    }
}
