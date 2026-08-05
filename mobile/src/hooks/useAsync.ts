import { useCallback, useEffect, useState } from 'react';

/**
 * Standard data-loading hook.
 *
 * Exposes `loading` (first load / explicit reload) separately from `refreshing`
 * (pull-to-refresh) so a screen does not show a full-screen spinner and the
 * pull-to-refresh spinner at the same time.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run('initial');
  }, [run]);

  const reload = useCallback(() => run('initial'), [run]);
  const refresh = useCallback(() => run('refresh'), [run]);

  return { data, error, loading, refreshing, reload, refresh, setData };
}
