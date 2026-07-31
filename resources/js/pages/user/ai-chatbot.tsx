import { Head } from '@inertiajs/react';
import { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
    ArrowUp,
    FileText,
    Loader2,
    MessageSquarePlus,
    MessageSquareText,
    PanelLeft,
    Paperclip,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { ChatMarkdown } from '@/components/chat-markdown';
import UserShell from '@/layouts/user-shell';
import { cn } from '@/lib/utils';

interface Attachment {
    id: number;
    name: string;
    kind: 'image' | 'document';
    url: string;
    mime?: string | null;
    size?: number;
    readable?: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    attachments?: Attachment[];
}

interface ConversationSummary {
    id: number;
    title: string;
    updated_at: string | null;
}

interface Pending {
    tempKey: string;
    name: string;
    kind: 'image' | 'document';
    uploading: boolean;
    error?: string;
    localUrl?: string;
    attachment?: Attachment;
}

interface Props {
    configured: boolean;
    suggestions: string[];
    history: Message[];
    conversations: ConversationSummary[];
    activeConversationId: number | null;
    attachmentAccept: string;
    maxAttachmentMb: number;
    maxAttachments: number;
}

function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function imagesFromClipboard(data: DataTransfer | null): File[] {
    if (!data) return [];
    const images: File[] = [];
    for (const item of Array.from(data.items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file) continue;
            const ext = file.type.split('/')[1] || 'png';
            images.push(file.name ? file : new File([file], `pasted-${Date.now()}.${ext}`, { type: file.type }));
        }
    }
    return images;
}

function formatRelative(iso: string | null): string {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const min = Math.round((Date.now() - then) / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.round(hr / 24);
    if (day < 7) return `${day}d ago`;
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return '';
    }
}

function TypingBubble() {
    return (
        <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );
}

function AttachmentChips({ items, tone }: { items: Attachment[]; tone: 'user' | 'assistant' }) {
    if (items.length === 0) return null;
    return (
        <div className="mb-2 flex flex-wrap gap-2">
            {items.map((a) =>
                a.kind === 'image' ? (
                    <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="block">
                        <img
                            src={a.url}
                            alt={a.name}
                            className="h-24 w-24 rounded-lg border border-border object-cover"
                        />
                    </a>
                ) : (
                    <a
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            'flex max-w-[12rem] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs',
                            tone === 'user'
                                ? 'border-white/30 bg-white/10'
                                : 'border-border bg-background text-foreground',
                        )}
                    >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{a.name}</span>
                    </a>
                ),
            )}
        </div>
    );
}

export default function AiChatbot({
    configured,
    suggestions,
    history,
    conversations: initialConversations,
    activeConversationId,
    attachmentAccept,
    maxAttachmentMb,
    maxAttachments,
}: Props) {
    const [messages, setMessages] = useState<Message[]>(history);
    const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
    const [activeId, setActiveId] = useState<number | null>(activeConversationId);
    const [input, setInput] = useState('');
    const [pending, setPending] = useState<Pending[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending, loadingId, pending]);

    const uploading = pending.some((p) => p.uploading);

    function newChat() {
        setMessages([]);
        setActiveId(null);
        setError(null);
        setInput('');
        setPending([]);
        setDrawerOpen(false);
        inputRef.current?.focus();
    }

    async function openConversation(id: number) {
        if (sending || id === activeId) {
            setDrawerOpen(false);
            return;
        }
        setError(null);
        setLoadingId(id);
        setDrawerOpen(false);
        try {
            const res = await fetch(`/user/ai-chatbot/conversations/${id}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok) {
                setError('Could not open that conversation.');
                return;
            }
            const data = await res.json();
            setMessages(data.messages ?? []);
            setActiveId(id);
            setPending([]);
        } catch {
            setError('Could not open that conversation.');
        } finally {
            setLoadingId(null);
        }
    }

    async function deleteConversation(id: number) {
        try {
            const res = await fetch(`/user/ai-chatbot/conversations/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': readCookie('XSRF-TOKEN') ?? '',
                },
                credentials: 'same-origin',
            });
            if (!res.ok) {
                setError('Could not delete that conversation.');
                return;
            }
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeId === id) newChat();
        } catch {
            setError('Could not delete that conversation.');
        }
    }

    function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files) void uploadFiles(files);
        if (fileRef.current) fileRef.current.value = '';
    }

    function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
        const images = imagesFromClipboard(e.clipboardData);
        if (images.length > 0) {
            e.preventDefault();
            void uploadFiles(images);
        }
    }

    async function uploadFiles(files: FileList | File[]) {
        setError(null);
        const list = Array.from(files);
        for (const file of list) {
            if (pending.length >= maxAttachments) {
                setError(`You can attach up to ${maxAttachments} files per message.`);
                break;
            }
            if (file.size > maxAttachmentMb * 1024 * 1024) {
                setError(`"${file.name}" is larger than ${maxAttachmentMb} MB.`);
                continue;
            }

            const tempKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const kind: 'image' | 'document' = file.type.startsWith('image/') ? 'image' : 'document';
            const localUrl = kind === 'image' ? URL.createObjectURL(file) : undefined;
            setPending((prev) => [...prev, { tempKey, name: file.name, kind, uploading: true, localUrl }]);

            try {
                const form = new FormData();
                form.append('file', file);
                const res = await fetch('/user/ai-chatbot/attachments', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': readCookie('XSRF-TOKEN') ?? '',
                    },
                    credentials: 'same-origin',
                    body: form,
                });
                const data = await res.json();
                if (!res.ok) {
                    const message = data?.errors?.file?.[0] ?? data?.message ?? 'Upload failed.';
                    setPending((prev) => prev.filter((p) => p.tempKey !== tempKey));
                    setError(`"${file.name}": ${message}`);
                    continue;
                }
                setPending((prev) =>
                    prev.map((p) => (p.tempKey === tempKey ? { ...p, uploading: false, attachment: data } : p)),
                );
            } catch {
                setPending((prev) => prev.filter((p) => p.tempKey !== tempKey));
                setError(`Could not upload "${file.name}".`);
            }
        }
    }

    function removePending(tempKey: string) {
        setPending((prev) => prev.filter((p) => p.tempKey !== tempKey));
    }

    async function send(text: string) {
        const trimmed = text.trim();
        const ready = pending.filter((p) => p.attachment).map((p) => p.attachment as Attachment);
        if ((!trimmed && ready.length === 0) || sending || uploading) return;

        setError(null);
        const userMessage: Message = {
            role: 'user',
            content: trimmed,
            attachments: ready.length > 0 ? ready : undefined,
        };
        const next = [...messages, userMessage].slice(-20);
        setMessages(next);
        setInput('');
        setPending([]);
        setSending(true);

        try {
            const res = await fetch('/user/ai-chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': readCookie('XSRF-TOKEN') ?? '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    messages: next.map(({ role, content }) => ({ role, content: content || '(sent an attachment)' })),
                    conversation_id: activeId,
                    attachment_ids: ready.map((a) => a.id),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }
            setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
            if (data.conversation_id) {
                const newId = data.conversation_id as number;
                setActiveId(newId);
                setConversations((prev) => {
                    const existing = prev.find((c) => c.id === newId);
                    const title = data.conversation_title ?? existing?.title ?? 'New chat';
                    const entry = { id: newId, title, updated_at: new Date().toISOString() };
                    return [entry, ...prev.filter((c) => c.id !== newId)];
                });
            }
        } catch {
            setError('Could not reach the assistant. Please try again.');
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        void send(input);
    }

    function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void send(input);
        }
    }

    const showEmptyState = messages.length === 0 && loadingId === null;
    const canSend = (input.trim() !== '' || pending.some((p) => p.attachment)) && !sending && !uploading;

    const sidebar = (
        <div className="flex h-full w-full flex-col">
            <button
                type="button"
                onClick={newChat}
                className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
                <MessageSquarePlus className="h-4 w-4" />
                New chat
            </button>
            <div className="mt-3 flex-1 overflow-y-auto pr-1">
                {conversations.length === 0 ? (
                    <p className="px-2 py-4 text-xs text-muted-foreground">No past chats yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {conversations.map((c) => (
                            <li key={c.id}>
                                <div
                                    className={cn(
                                        'group flex items-center gap-1 rounded-lg px-2 py-2 text-sm transition',
                                        activeId === c.id ? 'bg-secondary' : 'hover:bg-secondary/60',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => void openConversation(c.id)}
                                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                    >
                                        <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-foreground">{c.title}</span>
                                            <span className="block text-[10px] text-muted-foreground">
                                                {formatRelative(c.updated_at)}
                                            </span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void deleteConversation(c.id)}
                                        aria-label="Delete conversation"
                                        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    return (
        <UserShell>
            <Head title="AI Guide" />

            <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-5xl gap-4">
                {/* Desktop sidebar */}
                <aside className="hidden w-64 shrink-0 flex-col rounded-2xl border border-border bg-card p-3 md:flex">
                    {sidebar}
                </aside>

                {/* Mobile drawer */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
                        <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] border-r border-border bg-card p-3 shadow-xl">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-semibold">Chat history</span>
                                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close history">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {sidebar}
                        </div>
                    </div>
                )}

                {/* Main chat column */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="rounded-lg border border-border bg-card p-2 md:hidden"
                            aria-label="Open chat history"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </button>
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-lg font-semibold text-foreground">Epanaw — AI Guide</h1>
                            <p className="truncate text-sm text-muted-foreground">
                                Ask about Bagobo Tagabawa language, culture, and platform features.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={newChat}
                            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground transition hover:bg-secondary md:hidden"
                        >
                            <MessageSquarePlus className="h-4 w-4" />
                        </button>
                    </div>

                    {!configured && (
                        <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                            The AI assistant is not configured yet. Add an <code>AI_API_KEY</code> to your
                            <code> .env</code> file to enable replies.
                        </div>
                    )}

                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
                        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                            {loadingId !== null ? (
                                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                                    Opening conversation…
                                </div>
                            ) : showEmptyState ? (
                                <div className="grid h-full place-items-center">
                                    <div className="w-full max-w-md text-center">
                                        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Kumusta! I’m Epanaw. Ask me about Bagobo Tagabawa words, stories, culture,
                                            or how to use this platform. You can also attach or paste an image or document.
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => void send(s)}
                                                    className="rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition hover:bg-secondary"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <div
                                        key={i}
                                        className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                                                m.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-foreground',
                                            )}
                                        >
                                            {m.attachments && m.attachments.length > 0 && (
                                                <AttachmentChips items={m.attachments} tone={m.role} />
                                            )}
                                            {m.role === 'assistant' ? (
                                                <ChatMarkdown content={m.content} />
                                            ) : (
                                                m.content && <span className="whitespace-pre-wrap">{m.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {sending && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl bg-secondary px-3 py-2 text-foreground">
                                        <TypingBubble />
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="border-t border-border bg-red-50 px-4 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        {pending.length > 0 && (
                            <div className="flex flex-wrap gap-2 border-t border-border px-3 pt-3">
                                {pending.map((p) => (
                                    <div
                                        key={p.tempKey}
                                        className="flex items-center gap-2 rounded-lg border border-border bg-background py-1 pl-1 pr-2 text-xs"
                                    >
                                        {p.kind === 'image' && p.localUrl ? (
                                            <img src={p.localUrl} alt={p.name} className="h-8 w-8 rounded object-cover" />
                                        ) : (
                                            <span className="grid h-8 w-8 place-items-center rounded bg-secondary">
                                                <FileText className="h-4 w-4" />
                                            </span>
                                        )}
                                        <span className="max-w-[8rem] truncate">{p.name}</span>
                                        {p.uploading ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => removePending(p.tempKey)}
                                                aria-label={`Remove ${p.name}`}
                                                className="rounded p-0.5 text-muted-foreground hover:text-red-600"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="border-t border-border p-3">
                            <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-2 py-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    multiple
                                    accept={attachmentAccept}
                                    onChange={onPickFiles}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={pending.length >= maxAttachments}
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
                                    aria-label="Attach a file"
                                    title="Attach an image or document"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </button>
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    onPaste={onPaste}
                                    rows={1}
                                    placeholder="Ask about Bagobo Tagabawa language or this platform…"
                                    className="max-h-32 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                />
                                <button
                                    type="submit"
                                    disabled={!canSend}
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
                                    aria-label="Send message"
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                                Attach or paste images, PDFs, or documents (up to {maxAttachmentMb} MB each). Epanaw only
                                analyzes attachments related to Bagobo Tagabawa or this platform.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </UserShell>
    );
}
