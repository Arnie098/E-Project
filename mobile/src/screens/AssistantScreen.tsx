import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { ChatMessage, Conversation } from '../api/types';
import { colors, font, radius, spacing } from '../theme';

type Bubble = ChatMessage & { pending?: boolean; failed?: boolean };

export function AssistantScreen() {
  const nav = useNavigation();
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const listRef = useRef<FlatList<Bubble>>(null);

  const loadConversations = async () => {
    try {
      const res = await api.conversations();
      setConversations(res.conversations);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.headerBtn}>
            <Ionicons name="time-outline" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={newChat} style={styles.headerBtn}>
            <Ionicons name="create-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  function newChat() {
    setMessages([]);
    setConversationId(null);
    setInput('');
  }

  async function openConversation(id: number) {
    setShowHistory(false);
    try {
      const res = await api.conversation(id);
      setMessages(res.messages as Bubble[]);
      setConversationId(res.id);
    } catch (e) {
      // ignore
    }
  }

  async function removeConversation(id: number) {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === conversationId) newChat();
    } catch {
      // ignore
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const history: ChatMessage[] = messages
      .filter((m) => !m.failed)
      .map((m) => ({ role: m.role, content: m.content }));
    const outgoing: ChatMessage = { role: 'user', content: text };
    const next = [...history, outgoing];

    setMessages((prev) => [...prev, outgoing, { role: 'assistant', content: '', pending: true }]);
    setInput('');
    setSending(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const res = await api.chat(next.slice(-20), conversationId);
      setConversationId(res.conversation_id);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: res.reply };
        return copy;
      });
      loadConversations();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not reach the assistant.';
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: msg, failed: true };
        return copy;
      });
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.primary} />
          <Text style={styles.emptyTitle}>Ask Epanaw</Text>
          <Text style={styles.emptySub}>
            Your guide to Bagobo Tagabawa language, culture, and the EPANAW BAGOBO platform. Ask in English, Cebuano, or Tagalog.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <Bubble item={item} />}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Bagobo Tagabawa..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || sending) && styles.sendDisabled]} onPress={send} disabled={!input.trim() || sending}>
          {sending ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="send" size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <Modal visible={showHistory} animationType="slide" transparent onRequestClose={() => setShowHistory(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowHistory(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Chat history</Text>
            {conversations.length === 0 ? (
              <Text style={styles.emptySub}>No previous chats yet.</Text>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(c) => String(c.id)}
                renderItem={({ item }) => (
                  <View style={styles.historyRow}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => openConversation(item.id)}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeConversation(item.id)} style={styles.historyDelete}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Bubble({ item }: { item: Bubble }) {
  const isUser = item.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          item.failed && styles.failedBubble,
        ]}
      >
        {item.pending ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={[styles.bubbleText, isUser && styles.userText, item.failed && styles.failedText]}>{item.content}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  headerActions: { flexDirection: 'row' },
  headerBtn: { paddingHorizontal: spacing(2) },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(8) },
  emptyTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text, marginTop: spacing(3) },
  emptySub: { fontSize: font.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing(2), lineHeight: 20 },
  list: { padding: spacing(4), gap: spacing(3) },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing(1) },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', borderRadius: radius.lg, paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  failedBubble: { backgroundColor: colors.dangerBg, borderColor: '#fecaca' },
  bubbleText: { fontSize: font.sm, color: colors.text, lineHeight: 21 },
  userText: { color: colors.white },
  failedText: { color: colors.danger },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(2),
    padding: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: font.sm,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing(5), maxHeight: '70%' },
  modalTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text, marginBottom: spacing(4) },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(3), borderBottomWidth: 1, borderBottomColor: colors.border },
  historyTitle: { fontSize: font.sm, color: colors.text, fontWeight: '600' },
  historyDelete: { paddingHorizontal: spacing(2) },
});
