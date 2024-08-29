'use client';

import { MemoizedReactMarkdown } from './markdown';
import { CodeBlock } from './ui/codeblock';

export function Markdown({ children }: { children: string }) {
  return (
    <MemoizedReactMarkdown
      className="prose max-w-none break-words rounded-sm border p-4 py-6 prose-p:leading-relaxed prose-pre:p-0"
      components={{
        code({ children, className, node, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          return match ? (
            <CodeBlock
              key={Math.random()}
              language={match?.[1] || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
      }}
      remarkPlugins={[]}
    >
      {children}
    </MemoizedReactMarkdown>
  );
}
