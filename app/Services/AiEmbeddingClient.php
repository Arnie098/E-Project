<?php

namespace App\Services;

use App\Models\KnowledgeEmbedding;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Optional embedding client. When AI_EMBEDDINGS_ENABLED is false or the provider
 * cannot be reached, callers gracefully fall back to lexical scoring. Vectors are
 * cached per record so we only pay the embedding cost when content changes.
 */
class AiEmbeddingClient
{
    public function enabled(): bool
    {
        return filter_var(config('services.ai.embeddings.enabled'), FILTER_VALIDATE_BOOLEAN)
            && filled(config('services.ai.embeddings.model'))
            && filled(config('services.ai.key'));
    }

    /**
     * Embed arbitrary text. Returns null on any failure so callers can fall back.
     */
    public function embed(string $text): ?array
    {
        if (! $this->enabled() || blank(trim($text))) {
            return null;
        }

        try {
            $response = Http::withHeaders($this->headers())
                ->timeout(30)
                ->post($this->endpoint(), [
                    'model' => config('services.ai.embeddings.model'),
                    'input' => $text,
                ]);
        } catch (\Throwable $e) {
            Log::warning('AI embeddings request failed', ['message' => $e->getMessage()]);

            return null;
        }

        if ($response->failed()) {
            Log::warning('AI embeddings error', ['status' => $response->status()]);

            return null;
        }

        $data = $response->json();
        $vector = data_get($data, 'data.0.embedding', data_get($data, 'embedding'));

        return is_array($vector) ? array_map('floatval', $vector) : null;
    }

    /**
     * Embed a stored record, reusing the cached vector while its content is unchanged.
     */
    public function embedCached(string $source, int $id, string $text): ?array
    {
        $hash = hash('sha256', $text);
        $record = KnowledgeEmbedding::query()->where('source', $source)->where('source_id', $id)->first();

        if ($record && $record->content_hash === $hash && is_array($record->vector)) {
            return $record->vector;
        }

        $vector = $this->embed($text);
        if ($vector === null) {
            return null;
        }

        KnowledgeEmbedding::query()->updateOrCreate(
            ['source' => $source, 'source_id' => $id],
            ['content_hash' => $hash, 'vector' => $vector],
        );

        return $vector;
    }

    public static function cosine(array $a, array $b): float
    {
        $length = min(count($a), count($b));
        if ($length === 0) {
            return 0.0;
        }

        $dot = 0.0;
        $magA = 0.0;
        $magB = 0.0;

        for ($i = 0; $i < $length; $i++) {
            $dot += $a[$i] * $b[$i];
            $magA += $a[$i] * $a[$i];
            $magB += $b[$i] * $b[$i];
        }

        if ($magA <= 0.0 || $magB <= 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($magA) * sqrt($magB));
    }

    private function endpoint(): string
    {
        $base = rtrim((string) (config('services.ai.embeddings.base_url') ?: config('services.ai.base_url')), '/');

        return $base.'/v1/embeddings';
    }

    private function headers(): array
    {
        $key = (string) config('services.ai.key');
        $authMethod = strtolower((string) config('services.ai.auth_method', 'x-api-key'));

        $headers = ['content-type' => 'application/json'];

        if ($authMethod === 'apikey' || $authMethod === 'api-key') {
            $headers['Authorization'] = 'Bearer '.$key;
            $headers['api-key'] = $key;
        } elseif ($authMethod === 'bearer') {
            $headers['Authorization'] = 'Bearer '.$key;
        } else {
            $headers['x-api-key'] = $key;
            $headers['anthropic-version'] = '2023-06-01';
        }

        return $headers;
    }
}
