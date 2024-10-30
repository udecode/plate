'use client';

import { type FC, memo } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';

import { cn } from '@udecode/cn';
import remarkGfm from 'remark-gfm';

import { Link } from '@/components/link';
import * as Typography from '@/components/typography';

import { CodeBlock } from './ui/codeblock';

export const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <MemoizedReactMarkdown
      className={cn(
        'prose max-w-none break-words prose-p:leading-relaxed prose-pre:p-0',
        className
      )}
      components={{
        a: ({ children, ...props }) => (
          <Link {...(props as any)} className="pl-0">
            {children}
          </Link>
        ),
        code({ children, className, node, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          return match ? (
            <CodeBlock
              key={Math.random()}
              value={String(children).replace(/\n$/, '')}
              language={match?.[1] || ''}
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        li({ children }) {
          return <Typography.LI className="pl-0">{children}</Typography.LI>;
        },
        ol({ children }) {
          return (
            <Typography.OL className="ml-0 pl-6">{children}</Typography.OL>
          );
        },
        p({ children }) {
          return <Typography.P className="mb-0 mt-6">{children}</Typography.P>;
        },
        ul({ children }) {
          return (
            <Typography.UL className="ml-0 pl-6">{children}</Typography.UL>
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </MemoizedReactMarkdown>
  );
}
