import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Card, ErrorState, Loading, Pill, PrimaryButton, ProgressBar } from '../components/ui';
import type { AppStackParamList } from '../navigation/types';
import type { QuizResult } from '../api/types';
import { colors, font, radius, spacing } from '../theme';

type R = RouteProp<AppStackParamList, 'ModuleDetail'>;

export function ModuleDetailScreen() {
  const route = useRoute<R>();
  const { id } = route.params;
  const { data, loading, error, reload } = useAsync(() => api.module(id), [id]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading && !data) return <Loading label="Loading module" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  const allAnswered = d.questions.length > 0 && d.questions.every((q) => answers[q.id] !== undefined);

  async function submit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(id, answers);
      setResult(res);
      reload();
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not submit your answers.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.metaRow}>
        <Pill label={d.module.module} />
        <Pill label={d.module.difficulty} tone="muted" />
        <Pill label={d.module.status} tone={d.module.status === 'Completed' ? 'success' : 'accent'} />
      </View>

      <View style={styles.progressRow}>
        <View style={{ flex: 1 }}><ProgressBar value={d.module.progress} /></View>
        <Text style={styles.pct}>{d.module.progress}%</Text>
      </View>

      {d.module.content ? (
        <Card>
          <Text style={styles.contentText}>{d.module.content}</Text>
        </Card>
      ) : null}

      {d.result ? (
        <Card style={styles.priorResult}>
          <Text style={styles.priorTitle}>Previous attempt</Text>
          <Text style={styles.priorScore}>{d.result.score}/{d.result.total} · {d.result.remarks}</Text>
          <Text style={styles.muted}>Taken {d.result.takenAt}</Text>
        </Card>
      ) : null}

      {d.questions.length > 0 ? (
        <>
          <Text style={styles.quizHeading}>Quiz</Text>
          {d.questions.map((q, qi) => (
            <Card key={q.id}>
              <Text style={styles.question}>{qi + 1}. {q.question}</Text>
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <TouchableOpacity
                    key={oi}
                    style={[styles.option, selected && styles.optionSelected]}
                    activeOpacity={0.8}
                    disabled={!!result}
                    onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                  >
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </Card>
          ))}

          {result ? (
            <Card style={result.passed ? styles.passCard : styles.failCard}>
              <Text style={styles.resultTitle}>{result.passed ? 'Passed!' : 'Keep practicing'}</Text>
              <Text style={styles.resultScore}>{result.score}/{result.total}</Text>
              <Text style={styles.muted}>{result.remarks}</Text>
              {!result.passed ? (
                <View style={{ marginTop: spacing(3) }}>
                  <PrimaryButton title="Try again" variant="outline" onPress={() => { setResult(null); setAnswers({}); }} />
                </View>
              ) : null}
            </Card>
          ) : (
            <>
              {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
              <PrimaryButton title="Submit quiz" onPress={submit} loading={submitting} disabled={!allAnswered} />
              {!allAnswered ? <Text style={styles.hint}>Answer all questions to submit.</Text> : null}
            </>
          )}
        </>
      ) : (
        <Card>
          <Text style={styles.muted}>This module has no quiz yet.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  metaRow: { flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(3) },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginBottom: spacing(4) },
  pct: { fontSize: font.sm, fontWeight: '700', color: colors.primary, width: 44, textAlign: 'right' },
  contentText: { fontSize: font.sm, color: colors.text, lineHeight: 22 },
  priorResult: { backgroundColor: '#f0fdfa', borderColor: colors.primaryLight },
  priorTitle: { fontSize: font.xs, fontWeight: '800', color: colors.primaryDark, letterSpacing: 0.5 },
  priorScore: { fontSize: font.md, fontWeight: '700', color: colors.text, marginTop: spacing(1) },
  quizHeading: { fontSize: font.lg, fontWeight: '800', color: colors.text, marginTop: spacing(2), marginBottom: spacing(3) },
  question: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: spacing(3) },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(2),
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionText: { flex: 1, fontSize: font.sm, color: colors.text },
  optionTextSelected: { fontWeight: '700', color: colors.primaryDark },
  passCard: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', alignItems: 'center' },
  failCard: { backgroundColor: colors.dangerBg, borderColor: '#fecaca', alignItems: 'center' },
  resultTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  resultScore: { fontSize: font.xxl, fontWeight: '800', color: colors.primary, marginVertical: spacing(1) },
  submitError: { color: colors.danger, fontSize: font.sm, marginBottom: spacing(2), textAlign: 'center' },
  hint: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing(2) },
  muted: { fontSize: font.sm, color: colors.textMuted },
});
