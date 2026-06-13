'use client';

import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { useRef, useState } from 'react';
import { ChevronDown, FileJsonIcon, GitPullRequestIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import * as Typography from '@/components/typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import releaseIndexData from '@/generated/release-index.json';
import { UNRELEASED_PLATE_UI_RELEASE_TAG } from '@/lib/plate-ui-release-tags';
import {
  formatReleaseDate,
  getCurrentReleaseMajorGroups,
  getReleaseAnchor,
  getReleaseMajorAnchor,
  getReleaseMajorGroups,
  type ReleaseMajorGroup,
  type ReleaseIndexRelease,
} from '@/lib/releases';
import { cn } from '@/lib/utils';

export type PlateUiReleaseChange = {
  date: string;
  entries: {
    id: string;
    kind: string;
    migrationNotes: string[];
    summary: string;
    targets: string[];
  }[];
  href: string;
  id: string;
  kind: string;
  pullRequest?: {
    number: number;
    url: string;
  };
  summary: string;
  targets: {
    href?: string;
    name: string;
  }[];
};

export type PlateUiReleaseChangesByTag = Record<string, PlateUiReleaseChange[]>;

export type ReleaseIndexMessage = ReleaseIndexRelease & {
  expandable: boolean;
  plateUiChanges: PlateUiReleaseChange[];
};

const githubReleasesUrl = 'https://github.com/udecode/plate/releases';
const expandableLineThreshold = 15;
const plateUiChangeExpandableLineThreshold = 10;
const languageClassNamePattern = /language-(\w+)/;
const trailingNewlinePattern = /\n$/;
const releaseHeadingLabels: Record<string, string> = {
  'Major Changes': 'Breaking Changes',
  'Minor Changes': 'Features',
  'Patch Changes': 'Bug Fixes',
};

export function ReleaseIndex({
  className,
  plateUiChangesByTag,
  releases,
  showMajorHeadings = false,
  showPackageChanges = true,
  showPlateUiChanges = true,
  showUnreleasedPlateUiChanges = true,
}: HTMLAttributes<HTMLDivElement> & {
  plateUiChangesByTag?: PlateUiReleaseChangesByTag;
  releases?: ReleaseIndexRelease[];
  showMajorHeadings?: boolean;
  showPackageChanges?: boolean;
  showPlateUiChanges?: boolean;
  showUnreleasedPlateUiChanges?: boolean;
}) {
  const baseReleaseList =
    releases ??
    getCurrentReleaseMajorGroups(
      releaseIndexData as ReleaseIndexRelease[]
    ).flatMap((group) => group.releases);
  const unreleasedPlateUiChanges = showUnreleasedPlateUiChanges
    ? (plateUiChangesByTag?.[UNRELEASED_PLATE_UI_RELEASE_TAG] ?? [])
    : [];
  const messages = baseReleaseList.map((release, index) => {
    const plateUiChanges = [
      ...(index === 0 ? unreleasedPlateUiChanges : []),
      ...(plateUiChangesByTag?.[release.tag] ?? []),
    ];

    return {
      ...release,
      date: formatReleaseDate(release.date),
      expandable:
        getContentLineCount(release.content) > expandableLineThreshold,
      plateUiChanges,
    };
  });
  const latestPlateUiReleaseTag = messages.find(
    (release) => release.plateUiChanges.length > 0
  )?.tag;
  const messageGroups: ReleaseMajorGroup<ReleaseIndexMessage>[] =
    showMajorHeadings
      ? getReleaseMajorGroups(messages)
      : [{ major: '', releases: messages }];

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

      {messageGroups.map((group) => (
        <ReleaseMajorSection
          key={group.major || 'releases'}
          group={group}
          latestPlateUiReleaseTag={latestPlateUiReleaseTag}
          showHeading={showMajorHeadings}
          showPackageChanges={showPackageChanges}
          showPlateUiChanges={showPlateUiChanges}
        />
      ))}
    </section>
  );
}

function getContentLineCount(content: string) {
  return content.split('\n').filter((line) => line.trim().length > 0).length;
}

function getPlateUiChangeLineCount(change: PlateUiReleaseChange) {
  return change.entries.reduce(
    (count, entry) => count + 2 + entry.migrationNotes.length,
    2
  );
}

function ReleaseMajorSection({
  group,
  latestPlateUiReleaseTag,
  showHeading,
  showPackageChanges,
  showPlateUiChanges,
}: {
  group: ReleaseMajorGroup<ReleaseIndexMessage>;
  latestPlateUiReleaseTag?: string;
  showHeading: boolean;
  showPackageChanges: boolean;
  showPlateUiChanges: boolean;
}) {
  return (
    <div>
      {showHeading && group.major ? (
        <header
          className="scroll-mt-24 pt-10 pb-1"
          id={getReleaseMajorAnchor(group.major)}
        >
          <h2 className="font-heading font-semibold text-2xl tracking-tight">
            v{group.major}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {group.releases.length}{' '}
            {group.releases.length === 1 ? 'release' : 'releases'}
          </p>
        </header>
      ) : null}

      {group.releases.map((release, index) => (
        <ReleaseRow
          key={release.tag}
          release={release}
          isFirst={!showHeading && index === 0}
          showPackageChanges={showPackageChanges}
          showPlateUiSyncGuide={release.tag === latestPlateUiReleaseTag}
          showPlateUiChanges={showPlateUiChanges}
        />
      ))}
    </div>
  );
}

function ReleaseRow({
  isFirst = false,
  release,
  showPackageChanges,
  showPlateUiSyncGuide,
  showPlateUiChanges,
}: {
  isFirst?: boolean;
  release: ReleaseIndexMessage;
  showPackageChanges: boolean;
  showPlateUiSyncGuide: boolean;
  showPlateUiChanges: boolean;
}) {
  const hasPlateUiChanges = release.plateUiChanges.length > 0;
  const articleRef = useRef<HTMLElement>(null);
  const [isReleaseExpanded, setIsReleaseExpanded] = useState(false);

  return (
    <article
      className={cn(
        'group relative scroll-mt-24 pt-10 pb-8',
        isFirst && 'pt-6'
      )}
      id={getReleaseAnchor(release)}
      ref={articleRef}
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

      {showPackageChanges ? (
        <ReleaseBody
          content={release.content}
          expandable={release.expandable}
          isExpanded={isReleaseExpanded}
        />
      ) : null}

      {showPackageChanges && release.expandable ? (
        <ReleaseExpandButton
          isExpanded={isReleaseExpanded}
          label="release"
          onClick={() => {
            if (isReleaseExpanded) {
              setIsReleaseExpanded(false);
              articleRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            } else {
              setIsReleaseExpanded(true);
            }
          }}
        />
      ) : null}

      {showPlateUiChanges && hasPlateUiChanges ? (
        <PlateUiReleaseSection
          changes={release.plateUiChanges}
          showSyncGuide={showPlateUiSyncGuide}
        />
      ) : null}

      <ReleaseSeparator className="bottom-0" />
    </article>
  );
}

function ReleaseExpandButton({
  isExpanded,
  label,
  onClick,
}: {
  isExpanded: boolean;
  label?: string;
  onClick: () => void;
}) {
  const action = isExpanded ? 'Collapse' : 'Expand';

  return (
    <button
      className="mt-4 inline-flex items-center gap-1.5 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
      onClick={onClick}
      type="button"
    >
      <ChevronDown
        aria-hidden
        className={cn(
          'size-3.5 transition-transform duration-200',
          isExpanded && 'rotate-180'
        )}
      />
      {label ? `${action} ${label}` : action}
    </button>
  );
}

function PlateUiReleaseSection({
  changes,
  showSyncGuide,
}: {
  changes: PlateUiReleaseChange[];
  showSyncGuide: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="space-y-4">
        {changes.map((change, index) => (
          <PlateUiReleaseChangeItem
            change={change}
            key={change.id}
            showSyncGuide={showSyncGuide && index === 0}
          />
        ))}
      </div>
    </section>
  );
}

function PlateUiReleaseChangeItem({
  change,
  showSyncGuide,
}: {
  change: PlateUiReleaseChange;
  showSyncGuide: boolean;
}) {
  const titleHref = change.pullRequest?.url ?? change.href;
  const articleRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandable =
    getPlateUiChangeLineCount(change) > plateUiChangeExpandableLineThreshold;

  return (
    <article className="rounded-md border bg-surface/40 p-4" ref={articleRef}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-semibold text-base tracking-tight">
            Plate UI
          </h3>
          <Button
            asChild
            className="mt-2 h-auto max-w-full justify-start whitespace-normal px-2.5 py-1.5 text-left text-sm leading-5"
            size="sm"
            variant="secondary"
          >
            <a href={titleHref} rel="noreferrer" target="_blank">
              {change.pullRequest ? <GitPullRequestIcon /> : <FileJsonIcon />}
              <span>
                {change.pullRequest ? (
                  <>
                    <span className="font-mono text-xs">
                      PR {change.pullRequest.number}
                    </span>
                    <span className="text-muted-foreground"> · </span>
                  </>
                ) : null}
                {change.summary}
              </span>
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showSyncGuide ? (
            <Button asChild size="sm" variant="secondary">
              <a href="/docs/installation/plate-ui#sync-copied-files">
                Sync guide
              </a>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="ghost">
            <a href={change.href} rel="noreferrer" target="_blank">
              <FileJsonIcon />
              JSON
            </a>
          </Button>
        </div>
      </div>

      <div className="relative mt-4">
        <div
          className={cn(
            'space-y-3',
            expandable && !isExpanded && 'max-h-[220px] overflow-hidden'
          )}
        >
          {change.entries.map((entry) => (
            <div key={entry.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{entry.kind}</Badge>
                <div className="flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-muted-foreground text-xs">
                  {entry.targets.map((target) => (
                    <PlateUiEntryTarget
                      change={change}
                      key={target}
                      name={target}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-muted-foreground text-sm leading-6">
                {entry.summary}
              </p>
              {entry.migrationNotes.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground text-xs leading-5">
                  {entry.migrationNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        {expandable && !isExpanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/90 to-transparent" />
        ) : null}
      </div>

      {expandable ? (
        <ReleaseExpandButton
          isExpanded={isExpanded}
          onClick={() => {
            if (isExpanded) {
              setIsExpanded(false);
              articleRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            } else {
              setIsExpanded(true);
            }
          }}
        />
      ) : null}
    </article>
  );
}

function PlateUiEntryTarget({
  change,
  name,
}: {
  change: PlateUiReleaseChange;
  name: string;
}) {
  const target = change.targets.find((item) => item.name === name);

  if (!target?.href) {
    return <span>{name}</span>;
  }

  return (
    <a
      className="underline decoration-dashed underline-offset-4 transition-colors hover:text-foreground"
      href={target.href}
      rel="noreferrer"
      target="_blank"
    >
      {name}
    </a>
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
  isExpanded,
}: {
  content: string;
  expandable: boolean;
  isExpanded: boolean;
}) {
  return (
    <div>
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
          const showLineNumbers = value.includes('\n');
          const lines = value.split('\n');

          return (
            <Typography.Pre
              __rawString__={value}
              __showLineNumbers__={showLineNumbers}
              className="my-4"
              data-language={language}
            >
              <code
                className={`language-${language}`}
                {...(showLineNumbers ? { 'data-line-numbers': '' } : {})}
              >
                {lines.map((line, index) => (
                  <span data-line="" key={`${index}:${line}`}>
                    {line || ' '}
                    {index < lines.length - 1 ? '\n' : null}
                  </span>
                ))}
              </code>
            </Typography.Pre>
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
