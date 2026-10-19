'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Link } from '@/components/link';
import * as Typography from '@/components/typography';
import { cn } from '@/lib/utils';

import { CodeBlock } from './ui/codeblock';

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

export function Markdown({
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
          a: ({ children: innerChildren, ...props }) => (
            <Link {...(props as any)} className="pl-0">
              {innerChildren}
            </Link>
          ),
          code({
            children: innerChildren2,
            className: innerClassName,
            node,
            ...props
          }) {
            const match = LANGUAGE_REGEX.exec(innerClassName || '');
            const value =
              typeof innerChildren2 === 'string'
                ? innerChildren2.replace(TRAILING_NEWLINE_REGEX, '')
                : '';

            return match ? (
              <CodeBlock
                key={`${match[1]}:${value}`}
                value={value}
                language={match?.[1] || ''}
                {...props}
              />
            ) : (
              <code className={innerClassName} {...props}>
                {innerChildren2}
              </code>
            );
          },
          li({ children: innerChildren3 }) {
            return (
              <Typography.LI className="pl-0">{innerChildren3}</Typography.LI>
            );
          },
          ol({ children: innerChildren4 }) {
            return (
              <Typography.OL className="ml-0 pl-6">
                {innerChildren4}
              </Typography.OL>
            );
          },
          p({ children: innerChildren5 }) {
            return (
              <Typography.P className="mt-6 mb-0">
                {innerChildren5}
              </Typography.P>
            );
          },
          ul({ children: innerChildren6 }) {
            return (
              <Typography.UL className="ml-0">{innerChildren6}</Typography.UL>
            );
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
