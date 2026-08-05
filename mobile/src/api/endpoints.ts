import { apiFetch, apiUpload, UploadFile } from './client';
import type {
  Dashboard,
  VocabularyWord,
  TranslationResult,
  Story,
  MediaItem,
  EventItem,
  RepositoryItem,
  ModuleSummary,
  ModuleStats,
  ModuleDetail,
  QuizResult,
  ProgressRow,
  ProgressStats,
  Contribution,
  Feedback,
  ChatMessage,
  ChatAttachment,
  ChatResponse,
  Conversation,
  User,
} from './types';

export const api = {
  dashboard: () => apiFetch<Dashboard>('/dashboard'),

  vocabulary: () =>
    apiFetch<{ words: VocabularyWord[]; categories: string[] }>('/vocabulary'),

  translate: (body: { text: string; source: 'en' | 'tl' }) =>
    apiFetch<TranslationResult>('/translate', { method: 'POST', body }),

  stories: () => apiFetch<{ stories: Story[] }>('/stories'),

  media: () => apiFetch<{ media: MediaItem[] }>('/media'),

  events: () => apiFetch<{ upcoming: EventItem[]; past: EventItem[] }>('/events'),

  repository: () =>
    apiFetch<{ items: RepositoryItem[]; categories: string[]; types: string[] }>(
      '/repository',
    ),

  modules: () =>
    apiFetch<{ modules: ModuleSummary[]; stats: ModuleStats }>('/learning-modules'),

  module: (id: number) => apiFetch<ModuleDetail>(`/learning-modules/${id}`),

  submitQuiz: (id: number, answers: Record<number, number>) =>
    apiFetch<QuizResult>(`/learning-modules/${id}/quiz`, {
      method: 'POST',
      body: { answers },
    }),

  progress: () =>
    apiFetch<{ rows: ProgressRow[]; stats: ProgressStats }>('/progress'),

  contributions: () =>
    apiFetch<{
      contributions: Contribution[];
      types: string[];
      stats: { total: number; pending: number; approved: number };
    }>('/contributions'),

  createContribution: (body: { item: string; type: string; description?: string }) =>
    apiFetch<{ contribution: Contribution }>('/contributions', {
      method: 'POST',
      body,
    }),

  feedback: () =>
    apiFetch<{
      feedback: Feedback[];
      stats: { total: number; averageRating: number | null };
    }>('/feedback'),

  createFeedback: (body: { subject: string; body: string; rating: number }) =>
    apiFetch<{ feedback: Feedback }>('/feedback', { method: 'POST', body }),

  chat: (messages: ChatMessage[], conversationId?: number | null, attachmentIds?: number[]) =>
    apiFetch<ChatResponse>('/chatbot', {
      method: 'POST',
      body: {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        conversation_id: conversationId ?? null,
        attachment_ids: attachmentIds ?? [],
      },
    }),

  uploadAttachment: (file: UploadFile) =>
    apiUpload<ChatAttachment>('/chatbot/attachments', file),

  conversations: () =>
    apiFetch<{ conversations: Conversation[] }>('/chatbot/conversations'),

  conversation: (id: number) =>
    apiFetch<{ id: number; title: string; messages: ChatMessage[] }>(
      `/chatbot/conversations/${id}`,
    ),

  deleteConversation: (id: number) =>
    apiFetch<{ message: string }>(`/chatbot/conversations/${id}`, {
      method: 'DELETE',
    }),

  updateProfile: (body: {
    name: string;
    email: string;
    bio?: string | null;
    location?: string | null;
  }) => apiFetch<{ user: User }>('/user', { method: 'PUT', body }),

  updatePassword: (body: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => apiFetch<{ message: string }>('/user/password', { method: 'POST', body }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>('/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email },
    }),
};
