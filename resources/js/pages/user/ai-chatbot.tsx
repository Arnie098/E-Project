import { Head } from '@inertiajs/react';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUp, Sparkles } from 'lucide-react';
import UserShell from '@/layouts/user-shell';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Props {
    configured: boolean;
    suggestions: string[];
    history: Message[];
}

const GREETING =
    'Kumusta! I’m Epanaw, your guide to the Bagobo Tagabawa language and heritage. Ask me anything — or start with one of these:';

function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

export default function AiChatbot({ configured, suggestions, history }: Props) {
    const [messages, setMessages] = useState<Message[]>(history);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending]);

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
            setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
        } catch {
            setError('Could not reach the assistant. Check your connection and try again.');
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

    const empty = messages.length === 0;

    return (
        <UserShell>
            <Head title="AI Chatbot — EPANAW BAGOBO" />

            <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-3xl flex-col">
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground">Epanaw — AI Guide</h1>
                        <p className="text-xs text-muted-foreground">Ask about the Bagobo Tagabawa language, culture, and stories.</p>
                    </div>
                </div>

                {!configured && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-tile-amber px-4 py-3 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            The assistant isn&rsquo;t connected yet. Add an <code className="font-mono">ANTHROPIC_API_KEY</code> to your{' '}
                            <code className="font-mono">.env</code> file to start chatting.
                        </p>
                    </div>
                )}

                {/* Conversation */}
                <div
                    ref={scrollRef}
                    className="flex-1 space-y-5 overflow-y-auto rounded-2xl border border-border bg-card p-5"
                >
                    {empty ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{GREETING}</p>
                            <div className="mt-5 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => void send(s)}
                                        disabled={!configured || sending}
                                        className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((m, i) => <Bubble key={i} message={m} />)
                    )}

                    {sending && <TypingBubble />}
                </div>

                {error && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {error}
                    </p>
                )}

                {/* Composer */}
                <form onSubmit={onSubmit} className="mt-3">
                    <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/50">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            rows={1}
                            disabled={!configured}
                            placeholder={configured ? 'Message Epanaw…' : 'Assistant not configured'}
                            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!configured || sending || input.trim() === ''}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Send message"
                        >
                            <ArrowUp className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                        Epanaw can be wrong about specific dialect details — confirm important facts with an elder or the Vocabulary Dictionary.
                    </p>
                </form>
            </div>
        </UserShell>
    );
}

function Bubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    return (
        <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
            {!isUser && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                </div>
            )}
            <div
                className={cn(
                    'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                )}
            >
                {message.content}
            </div>
        </div>
    );
}

function TypingBubble() {
    return (
        <div className="flex gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3">
                {[0, 150, 300].map((delay) => (
                    <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                        style={{ animationDelay: `${delay}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}
