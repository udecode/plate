import type { Metadata } from 'next';

import Link from 'next/link';

import releaseIndexData from '@/generated/release-index.json';
import {
  formatReleaseDate,
  getCurrentReleaseMajorGroups,
  getOlderReleaseMajorGroups,
  getReleaseAnchor,
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
      releases={currentReleases}
      sidebarLinks={[
        ...currentMajorGroups.map((group) => ({
          href: `#${getReleaseAnchor(group.releases[0])}`,
          label: `v${group.major}`,
        })),
        ...olderMajorGroups.map((group) => ({
          href: getReleaseMajorPath(group.major),
          label: `v${group.major}`,
        })),
      ]}
      title={title}
    />
  );
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
