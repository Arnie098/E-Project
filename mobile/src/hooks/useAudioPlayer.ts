import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer as useExpoAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

/** Shared single-track audio controller backed by Expo Audio. */
export function useAudioPlayer() {
  const player = useExpoAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(async () => {
    player.pause();
    try {
      await player.seekTo(0);
    } catch {
      // The source can be replaced while buffering.
    }
    setActiveKey(null);
  }, [player]);

  const play = useCallback(
    async (key: string, url: string | null) => {
      setError(null);
      if (!url) {
        setError('No audio recording is available for this item yet.');
        return;
      }
      if (activeKey === key && status.playing) {
        await stop();
        return;
      }
      try {
        player.pause();
        player.replace(url);
        setActiveKey(key);
        player.play();
      } catch {
        setActiveKey(null);
        setError('Could not play this audio. Check your connection and try again.');
      }
    },
    [activeKey, player, status.playing, stop],
  );

  useEffect(() => {
    if (status.didJustFinish) setActiveKey(null);
  }, [status.didJustFinish]);

  useFocusEffect(
    useCallback(
      () => () => {
        void stop();
      },
      [stop],
    ),
  );

  return {
    play,
    stop,
    playingKey: status.playing ? activeKey : null,
    loadingKey: activeKey && !status.isLoaded ? activeKey : null,
    error,
    clearError: () => setError(null),
  };
}
