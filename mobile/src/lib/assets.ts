import { API_URL } from '../config';

// The API base URL points at `.../api`, but uploaded files are served from
// `.../storage`. Derive the bare origin once so every screen resolves asset
// paths the same way.
function deriveOrigin(base: string): string {
  let origin = base;
  if (origin.endsWith('/')) origin = origin.slice(0, -1);
  if (origin.endsWith('/api')) origin = origin.slice(0, -4);
  return origin;
}

export const ASSET_ORIGIN = deriveOrigin(API_URL);

/**
 * Resolve a storage path returned by the API into a fully-qualified URL.
 *
 * Accepts values the backend may return in different shapes:
 *   "pronunciations/a.mp3"          -> "<origin>/storage/pronunciations/a.mp3"
 *   "/storage/pronunciations/a.mp3" -> "<origin>/storage/pronunciations/a.mp3"
 *   "https://cdn.example/a.mp3"     -> returned unchanged
 *
 * Returns null when there is nothing playable/displayable, so callers can
 * simply hide the control.
 */
export function assetUrl(path?: string | null): string | null {
  if (!path) return null;

  const trimmed = path.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  if (!ASSET_ORIGIN) return null;

  let p = trimmed;
  if (p.startsWith('/')) p = p.slice(1);
  if (p.startsWith('storage/')) p = p.slice('storage/'.length);

  return `${ASSET_ORIGIN}/storage/${p}`;
}
