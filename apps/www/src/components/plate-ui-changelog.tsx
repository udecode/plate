import { createHash } from 'node:crypto';

import Link from 'next/link';
import {
  FileJsonIcon,
  GitPullRequestIcon,
  PackageIcon,
  TerminalIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getRegistryChangelogEvent,
  getRegistryChangelogIndex,
  type RegistryChangelogEvent,
  type RegistryChangelogIndex,
} from '@/lib/registry-changelog';
import { cn } from '@/lib/utils';

import { Step, Steps } from './typography';

const latestEventCount = 5;
const indexHref = '/registry/changelog/index.json';
const componentsHref = '/registry/changelog/components.json';
const newTabLinkProps = {
  rel: 'noopener noreferrer',
  target: '_blank',
} as const;
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

export function PlateUiChangelog() {
  const index = getRegistryChangelogIndex();
  const events = index.events
    .map((event) => getRegistryChangelogEvent(event.id))
    .filter((event): event is RegistryChangelogEvent => Boolean(event));

  return (
    <div className="not-prose mt-10 w-full flex-1 pb-16 sm:pb-0">
      <AgentSyncSection index={index} />
      <PlateUiReleaseUpdates events={events} index={index} />
    </div>
  );
}

export function PlateUiReleaseUpdates({
  className,
  events,
  index,
}: {
  className?: string;
  events?: RegistryChangelogEvent[];
  index?: RegistryChangelogIndex;
}) {
  const changelogIndex = index ?? getRegistryChangelogIndex();
  const changelogEvents =
    events ??
    changelogIndex.events
      .map((event) => getRegistryChangelogEvent(event.id))
      .filter((event): event is RegistryChangelogEvent => Boolean(event));
  const latestEvents = changelogEvents.slice(0, latestEventCount);
  const olderEvents = changelogEvents.slice(latestEventCount);

  return (
    <div className={cn('not-prose w-full flex-1 pb-16 sm:pb-0', className)}>
      <section className="space-y-6" id="latest-updates">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-heading font-semibold text-2xl tracking-tight">
              Plate UI updates
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
              Registry component changes for copied Plate UI files. Each entry
              links to the raw JSON agents can use for scoped syncs.
            </p>
          </div>
          <JsonActions latestEvent={changelogIndex.events[0]} showSyncGuide />
        </div>
        <div>
          {latestEvents.map((event) => (
            <ChangelogEventArticle key={event.id} event={event} />
          ))}
        </div>
      </section>
      {olderEvents.length > 0 ? (
        <section className="border-border border-t pt-8" id="older-updates">
          <h2 className="font-heading font-semibold text-2xl tracking-tight">
            More updates
          </h2>
          <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2">
            {olderEvents.map((event) => (
              <Link
                key={event.id}
                className="flex flex-col rounded-xl bg-surface px-4 py-3 text-surface-foreground no-underline transition-colors hover:bg-surface/80"
                href={`#${event.id}`}
              >
                <span className="text-muted-foreground text-xs">
                  {formatDate(event.change.date)}
                </span>
                <span className="mt-1 font-medium text-sm">
                  {event.summary}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function AgentSyncSection({ index }: { index: RegistryChangelogIndex }) {
  const latestEvent = index.events[0];
  const latestTarget = latestEvent?.targets[0] ?? 'code-block-node';
  const latestHref = latestEvent?.href ?? indexHref;
  const prompt = `Use sync-plate-ui to sync \`${latestTarget}\` from:\nhttps://platejs.org${latestHref}`;

  return (
    <section
      className="mb-12 scroll-mt-24 border-b pb-12"
      id="sync-with-an-agent"
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="size-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold text-xl tracking-tight">
              Sync with an agent
            </h2>
          </div>
          <JsonActions latestEvent={latestEvent} />
        </div>
        <p className="max-w-none text-muted-foreground text-sm">
          Use this when your app copied Plate UI registry files and you want an
          agent to merge only the affected components.
        </p>
      </div>
      <div className="mt-6">
        <Steps>
          <Step>Install the skill</Step>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/40 px-4 py-3 text-foreground">
            <code className="font-mono text-sm">
              npx skills add sync-plate-ui
            </code>
          </pre>

          <Step>Prompt your agent</Step>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border bg-muted/40 px-4 py-3 text-foreground">
            <code className="font-mono text-sm">{prompt}</code>
          </pre>
        </Steps>
      </div>
    </section>
  );
}

function JsonActions({
  latestEvent,
  showSyncGuide = false,
}: {
  latestEvent?: RegistryChangelogIndex['events'][number];
  showSyncGuide?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {showSyncGuide ? (
        <Button asChild size="sm" variant="secondary">
          <Link href="/docs/installation/plate-ui#sync-copied-files">
            <TerminalIcon />
            Sync guide
          </Link>
        </Button>
      ) : null}
      <Button asChild size="sm" variant="secondary">
        <a href={indexHref} {...newTabLinkProps}>
          <FileJsonIcon />
          Index JSON
        </a>
      </Button>
      <Button asChild size="sm" variant="secondary">
        <a href={componentsHref} {...newTabLinkProps}>
          <FileJsonIcon />
          Components JSON
        </a>
      </Button>
      {latestEvent ? (
        <Button asChild size="sm" variant="secondary">
          <a href={latestEvent.href} {...newTabLinkProps}>
            <FileJsonIcon />
            Latest JSON
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function ChangelogEventArticle({ event }: { event: RegistryChangelogEvent }) {
  const pullRequest = event.change.pullRequest;

  return (
    <article
      className="mb-12 scroll-mt-24 border-b pb-12 last:border-b-0"
      id={event.id}
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{event.kind}</Badge>
            <ReleaseBadge event={event} />
            <span className="font-mono text-muted-foreground text-xs">
              {formatDate(event.change.date)}
            </span>
          </div>
          <h3 className="mt-3 font-heading font-semibold text-xl tracking-tight">
            <a
              className="underline-offset-4 hover:underline"
              href={getEventTitleHref(event)}
              {...newTabLinkProps}
            >
              {event.summary}
            </a>
          </h3>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {pullRequest ? (
            <Button asChild size="sm" variant="secondary">
              <a href={pullRequest.url} {...newTabLinkProps}>
                <GitPullRequestIcon />
                PR {pullRequest.number}
              </a>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <a
              href={`/registry/changelog/${event.id}.json`}
              {...newTabLinkProps}
            >
              <FileJsonIcon />
              View JSON
            </a>
          </Button>
        </div>
      </header>

      <TargetList event={event} />
      <EntryList event={event} />
    </article>
  );
}

function ReleaseBadge({ event }: { event: RegistryChangelogEvent }) {
  const isReleased = event.release.status === 'released';
  const releaseHref =
    event.release.url ?? event.release.versionPackagePullRequest?.url ?? null;

  const badge = (
    <Badge
      asChild={Boolean(releaseHref)}
      className={cn(
        isReleased
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-dashed text-muted-foreground'
      )}
      variant={isReleased ? 'default' : 'outline'}
    >
      {releaseHref ? (
        <a href={releaseHref} {...newTabLinkProps}>
          <PackageIcon />
          {event.release.tag}
        </a>
      ) : (
        <>
          <PackageIcon />
          {event.release.tag ?? event.release.status}
        </>
      )}
    </Badge>
  );

  return badge;
}

function TargetList({ event }: { event: RegistryChangelogEvent }) {
  return (
    <div className="mt-6">
      <div className="mb-2 font-medium text-sm">Affected registry files</div>
      <div className="flex flex-wrap gap-2">
        {event.targets.map((target) => (
          <TargetChip event={event} key={target.name} target={target} />
        ))}
      </div>
    </div>
  );
}

function EntryList({ event }: { event: RegistryChangelogEvent }) {
  return (
    <div className="mt-6 space-y-5">
      {event.entries.map((entry) => {
        const migrationNotes = getVisibleMigrationNotes(entry);

        return (
          <div key={entry.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{entry.kind}</Badge>
              <span className="font-mono text-muted-foreground text-xs">
                {entry.targets.join(', ')}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{entry.summary}</p>
            {migrationNotes.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground text-sm">
                {migrationNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function TargetChip({
  event,
  target,
}: {
  event: RegistryChangelogEvent;
  target: RegistryChangelogEvent['targets'][number];
}) {
  const href = getTargetDiffHref(event, target);
  const className =
    'flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1 text-sm';
  const content = (
    <>
      <code className="font-mono text-xs">{target.name}</code>
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      className={cn(className, 'no-underline hover:bg-muted')}
      href={href}
      title={target.files[0]}
      {...newTabLinkProps}
    >
      {content}
    </a>
  );
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(date));
}

function getEventTitleHref(event: RegistryChangelogEvent) {
  return (
    event.change.pullRequest?.url ?? `/registry/changelog/${event.id}.json`
  );
}

function getTargetDiffHref(
  event: RegistryChangelogEvent,
  target: RegistryChangelogEvent['targets'][number]
) {
  const pullRequestUrl = event.change.pullRequest?.url;
  const file = target.files[0];

  if (!pullRequestUrl || !file) return null;

  return `${pullRequestUrl}/files#diff-${hashGitHubDiffPath(file)}`;
}

function getVisibleMigrationNotes(
  entry: RegistryChangelogEvent['entries'][number]
) {
  const summary = normalizeDuplicateText(entry.summary);

  return entry.migrationNotes.filter(
    (note) => !summary.includes(normalizeDuplicateText(note))
  );
}

function hashGitHubDiffPath(filePath: string) {
  return createHash('sha256').update(filePath).digest('hex');
}

function normalizeDuplicateText(value: string) {
  return value.replaceAll('`', '').replace(/\s+/g, ' ').trim().toLowerCase();
}
