'use client';

import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/components/ui/codeblock';
import releaseIndexData from '@/generated/release-index.json';
import {
  formatReleaseDate,
  getReleaseAnchor,
  NUMBER_OF_LATEST_RELEASES,
  type ReleaseIndexRelease,
} from '@/lib/releases';
import { cn } from '@/lib/utils';

export type ReleaseIndexMessage = ReleaseIndexRelease & {
  expandable: boolean;
};

const githubReleasesUrl = 'https://github.com/udecode/plate/releases';
const expandableLineThreshold = 15;
const languageClassNamePattern = /language-(\w+)/;
const trailingNewlinePattern = /\n$/;
const releaseHeadingLabels: Record<string, string> = {
  'Major Changes': 'Breaking Changes',
  'Minor Changes': 'Features',
  'Patch Changes': 'Bug Fixes',
};

export function ReleaseIndex({
  className,
  releases = releaseIndexData,
}: HTMLAttributes<HTMLDivElement> & {
  releases?: ReleaseIndexRelease[];
}) {
  const messages = releases.map((release) => ({
    ...release,
    date: formatReleaseDate(release.date),
    expandable: getContentLineCount(release.content) > expandableLineThreshold,
  }));
  const latestMessages = messages.slice(0, NUMBER_OF_LATEST_RELEASES);
  const olderMessages = messages.slice(NUMBER_OF_LATEST_RELEASES);

  if (messages.length === 0) {
    return (
      <section
        aria-label="Releases"
        className={cn(
          'not-prose my-8 border-muted border-t border-dashed py-12',
          className
        )}
      >
        <p className="m-0 text-muted-foreground text-sm">
          No generated release entries yet.
        </p>
        <a
          className="mt-4 inline-flex font-mono text-muted-foreground text-xs underline decoration-dashed underline-offset-4 transition-colors hover:text-foreground"
          href={githubReleasesUrl}
          rel="noreferrer"
          target="_blank"
        >
          View all releases on GitHub
        </a>
      </section>
    );
  }

  return (
    <section
      aria-label="Releases"
      className={cn('not-prose relative mt-6 flex flex-col', className)}
    >
      <ReleaseSeparator className="top-0" />

      {latestMessages.map((release) => (
        <ReleaseRow key={release.tag} release={release} />
      ))}

      {olderMessages.length > 0 ? (
        <MoreUpdates releases={olderMessages} />
      ) : null}
    </section>
  );
}

function getContentLineCount(content: string) {
  return content.split('\n').filter((line) => line.trim().length > 0).length;
}

function ReleaseRow({ release }: { release: ReleaseIndexMessage }) {
  return (
    <article
      className="group relative scroll-mt-24 pt-10 pb-8 first:pt-6"
      id={getReleaseAnchor(release)}
    >
      <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <a
          className="font-heading font-medium text-2xl text-foreground tracking-tight transition-colors hover:text-foreground/75"
          href={release.url}
          rel="noreferrer"
          target="_blank"
        >
          {release.title}
        </a>
        {release.title !== release.tag ? (
          <span className="rounded-sm border bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs">
            {release.tag}
          </span>
        ) : null}
        {release.date ? (
          <time className="font-mono text-muted-foreground text-xs">
            {release.date}
          </time>
        ) : null}
      </header>

      <ReleaseBody content={release.content} expandable={release.expandable} />

      <ReleaseSeparator className="bottom-0" />
    </article>
  );
}

function MoreUpdates({ releases }: { releases: ReleaseIndexMessage[] }) {
  return (
    <div className="relative scroll-mt-24 pt-10 pb-20" id="more-updates">
      <h2 className="mb-6 font-heading font-semibold text-xl tracking-tight">
        More Updates
      </h2>
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
        {releases.map((release) => (
          <a
            key={release.tag}
            className="flex w-full flex-col rounded-xl bg-surface px-4 py-3 text-surface-foreground transition-colors hover:bg-surface/80"
            href={release.url}
            rel="noreferrer"
            target="_blank"
          >
            <span className="text-muted-foreground text-xs">
              {release.date}
            </span>
            <span className="font-medium text-sm">{release.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function ReleaseSeparator({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-border to-transparent',
        className
      )}
    />
  );
}

function ReleaseBody({
  content,
  expandable,
}: {
  content: string;
  expandable: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div ref={containerRef}>
      <div className="relative">
        <div
          className={cn(
            'max-w-3xl',
            expandable && !isExpanded && 'max-h-[340px] overflow-hidden'
          )}
        >
          <MarkdownContent content={content} />
        </div>
        {expandable && !isExpanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/90 to-transparent" />
        ) : null}
      </div>

      {expandable ? (
        <button
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
          onClick={() => {
            if (isExpanded) {
              setIsExpanded(false);
              containerRef.current
                ?.closest('article')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              setIsExpanded(true);
            }
          }}
          type="button"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'size-3.5 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
          {isExpanded ? 'Collapse release' : 'Expand release'}
        </button>
      ) : null}
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, className, ...props }) => (
          <a
            className={cn(
              'font-medium text-foreground underline decoration-dashed underline-offset-4 transition-colors hover:text-primary',
              className
            )}
            rel="noreferrer"
            target="_blank"
            {...props}
          >
            {children}
          </a>
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn(
              '[&>p:first-child>code]:!text-xs my-5 border-border border-l-2 py-0.5 pl-4 text-muted-foreground text-sm [&>p:first-child>code]:bg-muted/80 [&>p:first-child>code]:text-foreground [&>p:first-child]:mt-0',
              className
            )}
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => {
          if (className?.includes('language-')) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn(
                'rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs',
                className
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        h2: ({ className, ...props }) => (
          <h2
            className={cn(
              'mt-6 mb-3 font-semibold text-2xl text-foreground tracking-tight **:[code]:text-xl',
              className
            )}
            {...props}
          />
        ),
        h3: ({ children, className, ...props }) => (
          <h3
            className={cn(
              'mt-4 mb-2 font-semibold text-foreground/90 text-lg tracking-tight first:mt-0 **:[code]:text-sm',
              className
            )}
            {...props}
          >
            {formatReleaseHeading(children)}
          </h3>
        ),
        li: ({ className, ...props }) => (
          <li
            className={cn(
              'mt-2 text-muted-foreground text-sm leading-7',
              className
            )}
            {...props}
          />
        ),
        ol: ({ className, ...props }) => (
          <ol
            className={cn('my-3 ml-6 list-decimal space-y-1.5', className)}
            {...props}
          />
        ),
        p: ({ className, ...props }) => (
          <p
            className={cn(
              'my-3 text-muted-foreground text-sm leading-7',
              className
            )}
            {...props}
          />
        ),
        pre: ({ children }) => {
          const codeElement = children as ReactElement<{
            children?: string;
            className?: string;
          }>;
          const className = codeElement.props.className ?? '';
          const language =
            languageClassNamePattern.exec(className)?.[1] ?? 'text';
          const value =
            typeof codeElement.props.children === 'string'
              ? codeElement.props.children.replace(trailingNewlinePattern, '')
              : '';

          return (
            <div className="my-4">
              <CodeBlock language={language} value={value} />
            </div>
          );
        },
        strong: ({ className, ...props }) => (
          <strong
            className={cn('font-medium text-foreground/90', className)}
            {...props}
          />
        ),
        table: ({ className, ...props }) => (
          <div className="my-4 overflow-x-auto">
            <table
              className={cn('w-full border-collapse text-sm', className)}
              {...props}
            />
          </div>
        ),
        td: ({ className, ...props }) => (
          <td
            className={cn('border px-3 py-2 align-top', className)}
            {...props}
          />
        ),
        th: ({ className, ...props }) => (
          <th
            className={cn(
              'border px-3 py-2 text-left font-medium text-muted-foreground',
              className
            )}
            {...props}
          />
        ),
        ul: ({ className, ...props }) => (
          <ul
            className={cn('my-4 ml-6 list-disc space-y-1.5', className)}
            {...props}
          />
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}

function formatReleaseHeading(children: ReactNode) {
  const text = reactNodeToText(children);

  return text ? (releaseHeadingLabels[text] ?? text) : children;
}

function reactNodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(reactNodeToText).join('');
  }

  if (node && typeof node === 'object' && 'props' in node) {
    return reactNodeToText(
      (node as ReactElement<{ children?: ReactNode }>).props.children
    );
  }

  return '';
}
