import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Renders an assistant reply as safe, well-structured Markdown.
 *
 * react-markdown does NOT render raw HTML by default, so model output stays
 * safe from injection while still supporting headings, lists, tables, quotes,
 * links, and code. Element styling is mapped to Tailwind classes so the text
 * looks polished inside a chat bubble without the typography plugin.
 */
export function ChatMarkdown({ content, className }: { content: string; className?: string }) {
    return (
        <div className={cn('space-y-2 text-sm leading-relaxed break-words', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h1 className="mb-2 mt-1 text-base font-bold first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-2 mt-1 text-[0.95rem] font-bold first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-1 mt-1 text-sm font-semibold first:mt-0">{children}</h3>,
                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0 marker:text-current/60">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0 marker:text-current/60">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed [&>p]:mb-0">{children}</li>,
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline underline-offset-2 hover:opacity-80"
                        >
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    blockquote: ({ children }) => (
                        <blockquote className="my-2 border-l-2 border-current/30 pl-3 italic opacity-90">{children}</blockquote>
                    ),
                    hr: () => <hr className="my-3 border-current/20" />,
                    pre: ({ children }) => (
                        <pre className="my-2 overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs leading-relaxed text-neutral-100">
                            {children}
                        </pre>
                    ),
                    code: ({ className: codeClassName, children, ...rest }) => {
                        const text = String(children ?? '');
                        const isBlock = /language-/.test(codeClassName ?? '') || text.includes('\n');

                        if (isBlock) {
                            return (
                                <code className={cn('font-mono text-[0.85em]', codeClassName)} {...rest}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/15" {...rest}>
                                {children}
                            </code>
                        );
                    },
                    table: ({ children }) => (
                        <div className="my-2 overflow-x-auto">
                            <table className="w-full border-collapse text-xs">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-current/5">{children}</thead>,
                    th: ({ children }) => <th className="border border-current/20 px-2 py-1 text-left font-semibold">{children}</th>,
                    td: ({ children }) => <td className="border border-current/20 px-2 py-1 align-top">{children}</td>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
