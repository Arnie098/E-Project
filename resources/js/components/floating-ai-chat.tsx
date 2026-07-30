import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUp, MessageCircle, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const GREETING = 'Kumusta! I’m Epanaw. Ask me about Bagobo Tagabawa language, culture, stories, or EPANAW BAGOBO learning features.';

const SUGGESTIONS = [
    'How can I start learning the dialect?',
    'Tell me about Bagobo Tagabawa culture.',
    'What can I find in the storytelling archive?',
];

function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

export function FloatingAiChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open) {
            window.setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            toggleRef.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending, open]);

    async function send(text: string) {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setError(null);
        const next = [...messages, { role: 'user' as const, content: trimmed }].slice(-20);
        setMessages(next);
        setInput('');
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
                body: JSON.stringify({ messages: next }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }

            setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
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
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
                            aria-label="Close Epanaw chat"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
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

                        {sending && (
                            <div className="flex gap-2" aria-label="Epanaw is typing">
                                <div className="rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground">Epanaw is typing…</div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="mx-4 mb-2 flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {error}
                        </p>
                    )}

                    <form onSubmit={onSubmit} className="border-t border-border p-3">
                        <label htmlFor="epanaw-floating-input" className="sr-only">
                            Message Epanaw
                        </label>
                        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-primary/60">
                            <textarea
                                id="epanaw-floating-input"
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                rows={1}
                                placeholder="Ask Epanaw…"
                                className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={sending || input.trim() === ''}
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Send message to Epanaw"
                            >
                                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                            Epanaw only answers EPANAW BAGOBO and Bagobo Tagabawa-related questions.
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

    return (
        <div className={cn('flex gap-2', isUser && 'justify-end')}>
            <div
                className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                )}
            >
                {message.content}
            </div>
        </div>
    );
}
