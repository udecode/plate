import type { Metadata } from 'next';

import { createHash } from 'node:crypto';
import Link from 'next/link';

import type {
  PlateUiReleaseChange,
  PlateUiReleaseChangesByTag,
} from '@/components/release-index';
import releaseIndexData from '@/generated/release-index.json';
import {
  getRegistryChangelogEvent,
  getRegistryChangelogIndex,
  type RegistryChangelogEntry,
  type RegistryChangelogEvent,
  type RegistryChangelogTarget,
} from '@/lib/registry-changelog';
import {
  formatReleaseDate,
  getCurrentReleaseMajorGroups,
  getOlderReleaseMajorGroups,
  getReleaseMajorPath,
  type ReleaseMajorGroup,
  type ReleaseIndexRelease,
} from '@/lib/releases';
import { ReleasePageContent } from './release-page-content';

export const dynamic = 'force-static';
export const revalidate = false;

const title = 'Releases';
const description = 'Latest updates and announcements.';
const releases = releaseIndexData as ReleaseIndexRelease[];
const currentMajorGroups = getCurrentReleaseMajorGroups(releases);
const olderMajorGroups = getOlderReleaseMajorGroups(releases);
const currentReleases = currentMajorGroups.flatMap((group) => group.releases);
const plateUiChangelogIndex = getRegistryChangelogIndex();
const plateUiChangelogEvents = plateUiChangelogIndex.events
  .map((event) => getRegistryChangelogEvent(event.id))
  .filter((event): event is RegistryChangelogEvent => Boolean(event));
const plateUiChangesByTag = getPlateUiChangesByReleaseTag(
  plateUiChangelogEvents
);

export const metadata: Metadata = {
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
    title,
    type: 'article',
    url: '/docs/releases',
  },
  title,
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export default function ReleasesPage() {
  return (
    <ReleasePageContent
      after={<OlderReleases groups={olderMajorGroups} />}
      description={description}
      plateUiChangesByTag={plateUiChangesByTag}
      releases={currentReleases}
      title={title}
    />
  );
}

function getPlateUiChangesByReleaseTag(events: RegistryChangelogEvent[]) {
  const changesByTag: PlateUiReleaseChangesByTag = {};

  for (const event of events) {
    const tag = event.release.tag;

    if (!tag) continue;

    changesByTag[tag] ??= [];
    changesByTag[tag].push(toPlateUiReleaseChange(event));
  }

  return changesByTag;
}

function toPlateUiReleaseChange(
  event: RegistryChangelogEvent
): PlateUiReleaseChange {
  return {
    date: event.change.date,
    href: `/registry/changelog/${event.id}.json`,
    id: event.id,
    kind: event.kind,
    pullRequest: event.change.pullRequest
      ? {
          number: event.change.pullRequest.number,
          url: event.change.pullRequest.url,
        }
      : undefined,
    summary: event.summary,
    targets: event.targets.map((target) => ({
      href: getTargetDiffHref(event, target),
      name: target.name,
    })),
    entries: event.entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      migrationNotes: getVisibleMigrationNotes(entry),
      summary: entry.summary,
      targets: entry.targets,
    })),
  };
}

function getTargetDiffHref(
  event: RegistryChangelogEvent,
  target: RegistryChangelogTarget
) {
  const pullRequestUrl = event.change.pullRequest?.url;
  const file = target.files[0];

  if (!pullRequestUrl || !file) return;

  return `${pullRequestUrl}/files#diff-${hashGitHubDiffPath(file)}`;
}

function getVisibleMigrationNotes(entry: RegistryChangelogEntry) {
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

function OlderReleases({
  groups,
}: {
  groups: ReleaseMajorGroup<ReleaseIndexRelease>[];
}) {
  return (
    <section className="not-prose mt-12 border-border border-t pt-8">
      <h2 className="font-heading font-semibold text-2xl tracking-tight">
        Older releases
      </h2>
      <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => (
          <Link
            key={group.major}
            className="flex flex-col rounded-md bg-surface px-4 py-3 text-surface-foreground no-underline transition-colors hover:bg-surface/80"
            href={getReleaseMajorPath(group.major)}
          >
            <span className="font-medium text-sm">v{group.major}</span>
            <span className="mt-1 text-muted-foreground text-xs">
              {formatReleaseDate(group.releases.at(-1)?.date ?? '')} -{' '}
              {formatReleaseDate(group.releases[0]?.date ?? '')}
            </span>
          </Link>
        ))}
        <Link
          className="flex flex-col rounded-md bg-surface px-4 py-3 text-surface-foreground no-underline transition-colors hover:bg-surface/80"
          href="/docs/migration/v48"
        >
          <span className="font-medium text-sm">v48 and earlier</span>
          <span className="mt-1 text-muted-foreground text-xs">
            Migration archive
          </span>
        </Link>
      </div>
    </section>
  );
}
