'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

import { Link } from '@/components/link';
import * as Typography from '@/components/typography';
import { cn } from '@/lib/utils';

import { CodeBlock } from './ui/codeblock';

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

export const Markdown = memo(
  PureMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

function PureMarkdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose max-w-none break-words prose-pre:p-0 prose-p:leading-relaxed',
        className
      )}
    >
      <ReactMarkdown
        components={{
          a: ({ children, ...props }) => (
            <Link {...(props as any)} className="pl-0">
              {children}
            </Link>
          ),
          code({ children, className, node, ...props }) {
            const match = LANGUAGE_REGEX.exec(className || '');

            return match ? (
              <CodeBlock
                key={Math.random()}
                value={String(children).replace(TRAILING_NEWLINE_REGEX, '')}
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
            return (
              <Typography.P className="mt-6 mb-0">{children}</Typography.P>
            );
          },
          ul({ children }) {
            return <Typography.UL className="ml-0">{children}</Typography.UL>;
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
