import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { api } from '../api/endpoints';
import type { TranslationMatch, TranslationResult } from '../api/types';
import { Card, EmptyState, Loading, PrimaryButton } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

// Optional on-device speech-to-text. Only available in a development or
// production build (NOT Expo Go). Loaded defensively so the screen still works
// as a text translator when the native module is unavailable.
let SpeechModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SpeechModule = require('expo-speech-recognition');
} catch {
  SpeechModule = null;
}

type Source = 'en' | 'tl';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
let ORIGIN = API_URL;
if (ORIGIN.endsWith('/')) ORIGIN = ORIGIN.slice(0, -1);
if (ORIGIN.endsWith('/api')) ORIGIN = ORIGIN.slice(0, -4);

function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  let p = path;
  if (p.startsWith('/')) p = p.slice(1);
  if (p.startsWith('storage/')) p = p.slice('storage/'.length);
  return `${ORIGIN}/storage/${p}`;
}

export function TranslateScreen() {
  const [source, setSource] = useState<Source>('en');
  const [text, setText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const mod = SpeechModule?.ExpoSpeechRecognitionModule;
    if (!mod?.addListener) return;
    const onResult = mod.addListener('result', (e: any) => {
      const transcript = e?.results?.[0]?.transcript;
      if (typeof transcript === 'string') setText(transcript);
    });
    const onEnd = mod.addListener('end', () => setListening(false));
    const onError = mod.addListener('error', () => setListening(false));
    return () => {
      onResult?.remove?.();
      onEnd?.remove?.();
      onError?.remove?.();
    };
  }, []);

  useEffect(
    () => () => {
      soundRef.current?.unloadAsync().catch(() => {});
    },
    [],
  );

  const toggleListening = async () => {
    const mod = SpeechModule?.ExpoSpeechRecognitionModule;
    if (!mod) {
      Alert.alert(
        'Voice input unavailable',
        'Speech-to-text needs a development build of the app (it does not run in Expo Go). You can still type your text below.',
      );
      return;
    }
    if (listening) {
      try {
        mod.stop();
      } catch {}
      setListening(false);
      return;
    }
    try {
      const perm = await mod.requestPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert('Permission needed', 'Microphone and speech recognition access are required for voice input.');
        return;
      }
      setText('');
      setListening(true);
      mod.start({ lang: source === 'en' ? 'en-US' : 'fil-PH', interimResults: true, continuous: false });
    } catch (e: any) {
      setListening(false);
      Alert.alert('Voice input error', e?.message ?? 'Could not start speech recognition.');
    }
  };

  const translate = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Nothing to translate', 'Type or speak some text first.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.translate({ text: trimmed, source });
      setResult(res);
    } catch (e: any) {
      Alert.alert('Translation failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (path: string | null) => {
    const url = assetUrl(path);
    if (!url) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      soundRef.current = sound;
    } catch {
      Alert.alert('Playback error', 'Could not play the pronunciation audio.');
    }
  };

  const copyTranslation = async () => {
    if (result?.translation) {
      await Clipboard.setStringAsync(result.translation);
      Alert.alert('Copied', 'Translation copied to clipboard.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.intro}>
        Translate English or Tagalog into Bagobo Tagabawa. Results use the platform's verified
        vocabulary, with native-speaker pronunciation where available.
      </Text>

      <View style={styles.toggleRow}>
        <LangButton label="English" active={source === 'en'} onPress={() => setSource('en')} />
        <LangButton label="Tagalog" active={source === 'tl'} onPress={() => setSource('tl')} />
        <View style={styles.arrowWrap}>
          <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
          <Text style={styles.arrowText}>Bagobo</Text>
        </View>
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={source === 'en' ? 'Type in English...' : 'Mag-type sa Tagalog...'}
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity
          onPress={toggleListening}
          style={[styles.micButton, listening && styles.micButtonActive]}
          accessibilityLabel="Voice input"
        >
          <Ionicons name={listening ? 'stop' : 'mic'} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      {listening ? <Text style={styles.listening}>Listening... tap stop when done.</Text> : null}

      <PrimaryButton title="Translate" onPress={translate} loading={loading} />

      {loading ? (
        <View style={{ marginTop: spacing(6) }}>
          <Loading label="Translating to Bagobo Tagabawa" />
        </View>
      ) : result ? (
        <View style={{ marginTop: spacing(4) }}>
          <Card>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Bagobo Tagabawa</Text>
              <TouchableOpacity onPress={copyTranslation} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="copy-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.translation}>{result.translation}</Text>
          </Card>

          {result.matches.length > 0 ? (
            <>
              <Text style={styles.matchesTitle}>Verified words &amp; pronunciation</Text>
              {result.matches.map((m) => (
                <MatchCard key={m.id} match={m} onPlay={() => playAudio(m.audio)} />
              ))}
            </>
          ) : null}
        </View>
      ) : (
        <View style={{ marginTop: spacing(6) }}>
          <EmptyState title="Ready to translate" subtitle="Enter text above to see the Bagobo Tagabawa translation." />
        </View>
      )}
    </ScrollView>
  );
}

function LangButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.lang, active && styles.langActive]}>
      <Text style={[styles.langText, active && styles.langTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MatchCard({ match, onPlay }: { match: TranslationMatch; onPlay: () => void }) {
  return (
    <Card>
      <View style={styles.matchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.matchWord}>{match.word}</Text>
          {match.pronunciation ? <Text style={styles.matchPron}>/{match.pronunciation}/</Text> : null}
          <Text style={styles.matchMeaning}>{match.meaning}</Text>
          {match.speaker ? <Text style={styles.matchSpeaker}>Native speaker: {match.speaker}</Text> : null}
        </View>
        {match.audio ? (
          <TouchableOpacity onPress={onPlay} style={styles.playButton} accessibilityLabel={`Play ${match.word}`}>
            <Ionicons name="volume-high" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  intro: { fontSize: font.sm, color: colors.textMuted, marginBottom: spacing(4), lineHeight: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginBottom: spacing(3) },
  lang: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { fontSize: font.sm, color: colors.text, fontWeight: '600' },
  langTextActive: { color: colors.white },
  arrowWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginLeft: 'auto' },
  arrowText: { fontSize: font.sm, color: colors.textMuted, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(2),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(3),
    marginBottom: spacing(3),
  },
  input: { flex: 1, minHeight: 72, fontSize: font.md, color: colors.text, textAlignVertical: 'top' },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: { backgroundColor: colors.danger },
  listening: { fontSize: font.xs, color: colors.danger, marginTop: -spacing(1), marginBottom: spacing(3) },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  translation: { fontSize: font.xl, color: colors.primary, fontWeight: '800', marginTop: spacing(2) },
  matchesTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: spacing(3), marginTop: spacing(2) },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  matchWord: { fontSize: font.lg, fontWeight: '800', color: colors.primary },
  matchPron: { fontSize: font.sm, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing(1) },
  matchMeaning: { fontSize: font.sm, color: colors.text, marginTop: spacing(1) },
  matchSpeaker: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(1) },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
