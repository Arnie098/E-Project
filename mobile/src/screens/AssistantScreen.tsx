import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import { api } from '../api/endpoints';
import { ApiError, UploadFile } from '../api/client';
import type { ChatAttachment, ChatMessage, Conversation } from '../api/types';
import { colors, font, radius, spacing } from '../theme';

type Bubble = ChatMessage & { pending?: boolean; failed?: boolean };

const MAX_ATTACHMENTS = 4;

export function AssistantScreen() {
  const nav = useNavigation();
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
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
    setAttachments([]);
  }

  async function openConversation(id: number) {
    setShowHistory(false);
    try {
      const res = await api.conversation(id);
      setMessages(res.messages as Bubble[]);
      setConversationId(res.id);
      setAttachments([]);
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

  function removeAttachment(id: number) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function uploadFile(file: UploadFile, localImageUri?: string) {
    if (attachments.length >= MAX_ATTACHMENTS) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }
    setUploading(true);
    try {
      const saved = await api.uploadAttachment(file);
      setAttachments((prev) => [...prev, { ...saved, localUri: localImageUri }]);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof ApiError ? e.message : 'Could not upload the file.');
    } finally {
      setUploading(false);
    }
  }

  async function pickImage() {
    setShowAttachMenu(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach images.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    const name = asset.fileName ?? `image-${Date.now()}.jpg`;
    const type = asset.mimeType ?? 'image/jpeg';
    await uploadFile({ uri: asset.uri, name, type }, asset.uri);
  }

  async function pickDocument() {
    setShowAttachMenu(false);
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    await uploadFile({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'application/octet-stream',
    });
  }

  async function pasteImage() {
    setShowAttachMenu(false);
    try {
      const hasImage = await Clipboard.hasImageAsync();
      if (!hasImage) {
        Alert.alert('No image', 'There is no image in your clipboard.');
        return;
      }
      const img = await Clipboard.getImageAsync({ format: 'png' });
      if (!img?.data) return;
      const base64 = img.data.includes(',') ? img.data.split(',')[1] : img.data;
      const uri = `${FileSystem.cacheDirectory}pasted-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await uploadFile({ uri, name: 'pasted-image.png', type: 'image/png' }, uri);
    } catch (e) {
      Alert.alert('Paste failed', 'Could not read an image from your clipboard.');
    }
  }

  async function send() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || sending || uploading) return;

    const contentToSend = text || 'Please take a look at the attached file(s).';
    const history: ChatMessage[] = messages
      .filter((m) => !m.failed)
      .map((m) => ({ role: m.role, content: m.content }));
    const sentAttachments = attachments;
    const attachmentIds = sentAttachments.map((a) => a.id);
    const outgoing: Bubble = { role: 'user', content: contentToSend, attachments: sentAttachments };
    const apiHistory: ChatMessage[] = [...history, { role: 'user', content: contentToSend }];

    setMessages((prev) => [...prev, outgoing, { role: 'assistant', content: '', pending: true }]);
    setInput('');
    setAttachments([]);
    setSending(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const res = await api.chat(apiHistory.slice(-20), conversationId, attachmentIds);
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

  const canSend = (!!input.trim() || attachments.length > 0) && !sending && !uploading;

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
            Your guide to Bagobo Tagabawa language, culture, and the EPANAW BAGOBO platform. Ask in English, Cebuano, or Tagalog — and attach a photo or document to ask about it.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <MessageBubble item={item} />}
        />
      )}

      {attachments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewBar}
          contentContainerStyle={styles.previewContent}
        >
          {attachments.map((a) => (
            <View key={a.id} style={styles.previewItem}>
              {a.kind === 'image' && a.localUri ? (
                <Image source={{ uri: a.localUri }} style={styles.previewImg} />
              ) : (
                <View style={styles.previewDoc}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primaryDark} />
                  <Text style={styles.previewDocName} numberOfLines={1}>{a.name}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.previewRemove} onPress={() => removeAttachment(a.id)}>
                <Ionicons name="close-circle" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ))}
          {uploading ? (
            <View style={styles.previewUploading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={() => setShowAttachMenu(true)}
          disabled={sending || uploading || attachments.length >= MAX_ATTACHMENTS}
        >
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={attachments.length >= MAX_ATTACHMENTS ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Bagobo Tagabawa..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !canSend && styles.sendDisabled]} onPress={send} disabled={!canSend}>
          {sending ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="send" size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <Modal visible={showAttachMenu} animationType="slide" transparent onRequestClose={() => setShowAttachMenu(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAttachMenu(false)}>
          <Pressable style={styles.attachSheet}>
            <Text style={styles.modalTitle}>Attach</Text>
            <AttachOption icon="image-outline" label="Photo from library" onPress={pickImage} />
            <AttachOption icon="document-outline" label="Document (PDF, Word, text)" onPress={pickDocument} />
            <AttachOption icon="clipboard-outline" label="Paste image from clipboard" onPress={pasteImage} />
            <Text style={styles.attachHint}>Up to {MAX_ATTACHMENTS} files. Off-topic images or documents will be politely declined.</Text>
          </Pressable>
        </Pressable>
      </Modal>

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

function AttachOption({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.attachOption} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.attachOptionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MessageBubble({ item }: { item: Bubble }) {
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
        {item.attachments?.map((a) => (
          a.kind === 'image' && (a.localUri || a.url) ? (
            <Image key={a.id} source={{ uri: a.localUri ?? a.url }} style={styles.bubbleImage} />
          ) : (
            <View key={a.id} style={styles.fileChip}>
              <Ionicons name="document-text-outline" size={16} color={isUser ? colors.white : colors.primaryDark} />
              <Text style={[styles.fileChipText, isUser && styles.userText]} numberOfLines={1}>{a.name}</Text>
            </View>
          )
        ))}
        {item.pending ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : item.content ? (
          <Text style={[styles.bubbleText, isUser && styles.userText, item.failed && styles.failedText]}>{item.content}</Text>
        ) : null}
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
  bubbleImage: { width: 180, height: 180, borderRadius: radius.md, marginBottom: spacing(2), resizeMode: 'cover' },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    marginBottom: spacing(2),
    maxWidth: 220,
  },
  fileChipText: { fontSize: font.xs, color: colors.text, flexShrink: 1 },
  previewBar: { maxHeight: 96, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  previewContent: { padding: spacing(3), gap: spacing(3), alignItems: 'center' },
  previewItem: { width: 68 },
  previewImg: { width: 68, height: 68, borderRadius: radius.md },
  previewDoc: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(1),
  },
  previewDocName: { fontSize: 9, color: colors.primaryDark, marginTop: 2, textAlign: 'center' },
  previewRemove: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.white, borderRadius: radius.full },
  previewUploading: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(2),
    padding: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  attachBtn: { paddingBottom: spacing(2) },
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
  attachSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing(5) },
  modalTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text, marginBottom: spacing(4) },
  attachOption: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(4), borderBottomWidth: 1, borderBottomColor: colors.border },
  attachOptionLabel: { fontSize: font.md, color: colors.text, fontWeight: '600' },
  attachHint: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(3), lineHeight: 18 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(3), borderBottomWidth: 1, borderBottomColor: colors.border },
  historyTitle: { fontSize: font.sm, color: colors.text, fontWeight: '600' },
  historyDelete: { paddingHorizontal: spacing(2) },
});
