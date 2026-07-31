import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUp, FileText, Loader2, MessageCircle, Paperclip, Plus, Sparkles, X } from 'lucide-react';
import { ChatMarkdown } from '@/components/chat-markdown';
import { cn } from '@/lib/utils';

type Attachment = {
    id: number;
    name: string;
    kind: 'image' | 'document';
    url: string;
    mime?: string | null;
    size?: number;
};

type Message = {
    role: 'user' | 'assistant';
    content: string;
    at?: number;
    attachments?: Attachment[];
};

type Pending = {
    tempKey: string;
    name: string;
    kind: 'image' | 'document';
    uploading: boolean;
    localUrl?: string;
    attachment?: Attachment;
};

const GREETING = 'Kumusta! I\u2019m Epanaw. Ask me about Bagobo Tagabawa language, culture, stories, or EPANAW BAGOBO learning features.';

const SUGGESTIONS = [
    'How can I start learning the dialect?',
    'Tell me about Bagobo Tagabawa culture.',
    'What can I find in the storytelling archive?',
];

const STORAGE_KEY = 'epanaw-floating-chat-history';
const MAX_STORED = 50;
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_MB = 10;
const ATTACHMENT_ACCEPT = 'image/*,.pdf,.txt,.md,.csv,.json,.log,.doc,.docx,.xls,.xlsx,.ppt,.pptx';

function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function loadHistory(): Message[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .map((m) => ({
                role: m.role,
                content: m.content,
                at: typeof m.at === 'number' ? m.at : undefined,
                attachments: Array.isArray(m.attachments) ? m.attachments : undefined,
            }))
            .slice(-MAX_STORED);
    } catch {
        return [];
    }
}

function formatTime(at?: number): string {
    if (!at) return '';
    try {
        return new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
        return '';
    }
}

export function FloatingAiChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [pending, setPending] = useState<Pending[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Restore any prior conversation so history survives reloads and navigation.
    useEffect(() => {
        setMessages(loadHistory());
    }, []);

    // Persist the running conversation as chat history.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (messages.length === 0) {
                window.localStorage.removeItem(STORAGE_KEY);
            } else {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
            }
        } catch {
            // Ignore storage failures (private mode, quota, etc.).
        }
    }, [messages]);

    useEffect(() => {
        if (open) {
            window.setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            toggleRef.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending, open, pending]);

    const uploading = pending.some((p) => p.uploading);

    function newChat() {
        setMessages([]);
        setError(null);
        setInput('');
        setPending([]);
        inputRef.current?.focus();
    }

    function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files) void uploadFiles(files);
        if (fileRef.current) fileRef.current.value = '';
    }

    async function uploadFiles(files: FileList) {
        setError(null);
        for (const file of Array.from(files)) {
            if (pending.length >= MAX_ATTACHMENTS) {
                setError(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
                break;
            }
            if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
                setError(`\u201c${file.name}\u201d is larger than ${MAX_ATTACHMENT_MB} MB.`);
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
                    setError(`\u201c${file.name}\u201d: ${message}`);
                    continue;
                }
                setPending((prev) =>
                    prev.map((p) => (p.tempKey === tempKey ? { ...p, uploading: false, attachment: data } : p)),
                );
            } catch {
                setPending((prev) => prev.filter((p) => p.tempKey !== tempKey));
                setError(`Could not upload \u201c${file.name}\u201d.`);
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
        const next = [
            ...messages,
            { role: 'user' as const, content: trimmed, at: Date.now(), attachments: ready.length > 0 ? ready : undefined },
        ].slice(-MAX_STORED);
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
                    attachment_ids: ready.map((a) => a.id),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }

            setMessages((current) => [...current, { role: 'assistant', content: data.reply, at: Date.now() }]);
        } catch {
            setError('Could not reach Epanaw. Check your connection and try again.');
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

        if (e.key === 'Escape') {
            setOpen(false);
        }
    }

    const canSend = (input.trim() !== '' || pending.some((p) => p.attachment)) && !sending && !uploading;

    return (
        <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6 print:hidden">
            {open && (
                <section
                    id="epanaw-floating-chat"
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="epanaw-floating-chat-title"
                    className="mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:w-96"
                >
                    <header className="flex items-center justify-between gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <h2 id="epanaw-floating-chat-title" className="truncate text-sm font-bold">
                                    Epanaw AI Guide
                                </h2>
                                <p className="text-xs text-primary-foreground/80">Language, culture, and platform help</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={newChat}
                                disabled={sending || messages.length === 0}
                                className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Start a new chat"
                                title="New chat"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
                                aria-label="Close Epanaw chat"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </header>

                    <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
                        {messages.length === 0 ? (
                            <div className="rounded-2xl bg-secondary p-4 text-sm leading-relaxed text-foreground">
                                <p>{GREETING}</p>
                                <div className="mt-3 space-y-2">
                                    {SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => void send(suggestion)}
                                            disabled={sending}
                                            className="block w-full rounded-xl border border-border bg-card px-3 py-2 text-left text-xs font-medium hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => <ChatBubble key={index} message={message} />)
                        )}

                        {sending && <TypingIndicator />}
                    </div>

                    {error && (
                        <p className="mx-4 mb-2 flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {error}
                        </p>
                    )}

                    {pending.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-3 pt-1">
                            {pending.map((p) => (
                                <div
                                    key={p.tempKey}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-background py-1 pl-1 pr-2 text-xs"
                                >
                                    {p.kind === 'image' && p.localUrl ? (
                                        <img src={p.localUrl} alt={p.name} className="h-7 w-7 rounded object-cover" />
                                    ) : (
                                        <span className="grid h-7 w-7 place-items-center rounded bg-secondary">
                                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    )}
                                    <span className="max-w-[7rem] truncate">{p.name}</span>
                                    {p.uploading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => removePending(p.tempKey)}
                                            aria-label={`Remove ${p.name}`}
                                            className="rounded p-0.5 text-muted-foreground hover:text-red-600"
                                        >
                                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="border-t border-border p-3">
                        <label htmlFor="epanaw-floating-input" className="sr-only">
                            Message Epanaw
                        </label>
                        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-primary/60">
                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                accept={ATTACHMENT_ACCEPT}
                                onChange={onPickFiles}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={pending.length >= MAX_ATTACHMENTS}
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Attach a file"
                                title="Attach an image or document"
                            >
                                <Paperclip className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <textarea
                                id="epanaw-floating-input"
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                rows={1}
                                placeholder="Ask Epanaw\u2026"
                                className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Send message to Epanaw"
                            >
                                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                            Attach images or documents (up to {MAX_ATTACHMENT_MB} MB). Epanaw only answers EPANAW
                            BAGOBO and Bagobo Tagabawa-related questions.
                        </p>
                    </form>
                </section>
            )}

            <button
                ref={toggleRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    'ml-auto flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30',
                    open && 'rounded-2xl',
                )}
                aria-expanded={open}
                aria-controls="epanaw-floating-chat"
                aria-label={open ? 'Close Epanaw chat' : 'Open Epanaw chat'}
            >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Ask Epanaw</span>
            </button>
        </div>
    );
}

function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    const time = formatTime(message.at);

    return (
        <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    isUser ? 'whitespace-pre-wrap bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                )}
            >
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {message.attachments.map((a) =>
                            a.kind === 'image' ? (
                                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="block">
                                    <img
                                        src={a.url}
                                        alt={a.name}
                                        className="h-20 w-20 rounded-lg border border-white/30 object-cover"
                                    />
                                </a>
                            ) : (
                                <a
                                    key={a.id}
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        'flex max-w-[10rem] items-center gap-1.5 rounded-lg border px-2 py-1 text-xs',
                                        isUser ? 'border-white/30 bg-white/10' : 'border-border bg-background text-foreground',
                                    )}
                                >
                                    <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    <span className="truncate">{a.name}</span>
                                </a>
                            ),
                        )}
                    </div>
                )}
                {isUser ? message.content : <ChatMarkdown content={message.content} />}
            </div>
            {time && <span className="px-1 text-[10px] text-muted-foreground">{time}</span>}
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-2" aria-label="Epanaw is thinking">
            <div className="relative grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="absolute inset-0 animate-ping rounded-lg bg-primary/40" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-secondary px-3 py-2.5">
                {[0, 150, 300].map((delay) => (
                    <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70"
                        style={{ animationDelay: `${delay}ms` }}
                        aria-hidden="true"
                    />
                ))}
                <span className="sr-only">Epanaw is thinking</span>
            </div>
        </div>
    );
}
