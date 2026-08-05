import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';

/**
 * Shared single-track audio controller.
 *
 * - Only one clip plays at a time; starting a new one stops the previous.
 * - Tapping the currently playing item toggles it off.
 * - Playback stops when the screen loses focus or unmounts, so audio never
 *   keeps playing after the learner navigates away.
 *
 * `key` is any stable identifier for the item being played (e.g. `word-12`),
 * used to drive per-row play/pause/spinner state.
 */
export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const activeKeyRef = useRef<string | null>(null);

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    activeKeyRef.current = null;
    setPlayingKey(null);
    setLoadingKey(null);

    if (!sound) return;
    try {
      sound.setOnPlaybackStatusUpdate(null);
    } catch {}
    try {
      await sound.stopAsync();
    } catch {}
    try {
      await sound.unloadAsync();
    } catch {}
  }, []);

  const play = useCallback(
    async (key: string, url: string | null) => {
      setError(null);

      if (!url) {
        setError('No audio recording is available for this item yet.');
        return;
      }

      // Tapping the active row stops it.
      if (activeKeyRef.current === key) {
        await stop();
        return;
      }

      await stop();

      activeKeyRef.current = key;
      setLoadingKey(key);

      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });

        // The user may have tapped something else while this was loading.
        if (activeKeyRef.current !== key) {
          sound.unloadAsync().catch(() => {});
          return;
        }

        soundRef.current = sound;
        setLoadingKey(null);
        setPlayingKey(key);

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            if (soundRef.current === sound) {
              soundRef.current = null;
              activeKeyRef.current = null;
            }
            setPlayingKey(null);
            sound.unloadAsync().catch(() => {});
          }
        });
      } catch {
        activeKeyRef.current = null;
        setLoadingKey(null);
        setPlayingKey(null);
        setError('Could not play this audio. Check your connection and try again.');
      }
    },
    [stop],
  );

  const clearError = useCallback(() => setError(null), []);

  // Stop when the screen loses focus (tabs stay mounted, so this matters).
  useFocusEffect(
    useCallback(
      () => () => {
        void stop();
      },
      [stop],
    ),
  );

  // Final safety net on unmount.
  useEffect(
    () => () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    },
    [],
  );

  return { play, stop, playingKey, loadingKey, error, clearError };
}
