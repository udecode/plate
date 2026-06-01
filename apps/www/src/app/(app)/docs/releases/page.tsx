import type { Metadata } from 'next';

import { IconRss } from '@tabler/icons-react';
import Link from 'next/link';

import { ReleaseIndex } from '@/components/release-index';
import { Button } from '@/components/ui/button';
import releaseIndexData from '@/generated/release-index.json';
import {
  getReleaseAnchor,
  NUMBER_OF_LATEST_RELEASES,
  type ReleaseIndexRelease,
} from '@/lib/releases';

export const dynamic = 'force-static';
export const revalidate = false;

const title = 'Releases';
const description = 'Latest updates and announcements.';
const releases = releaseIndexData as ReleaseIndexRelease[];
const latestReleases = releases.slice(0, NUMBER_OF_LATEST_RELEASES);
const olderReleases = releases.slice(NUMBER_OF_LATEST_RELEASES);

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
    <div
      className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
      data-slot="docs"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full min-w-0 max-w-[56rem] flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="scroll-m-24 font-semibold text-3xl tracking-tight">
                {title}
              </h1>
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="shadow-none"
              >
                <a href="/rss.xml" rel="noopener noreferrer" target="_blank">
                  <IconRss />
                  RSS
                </a>
              </Button>
            </div>
            <p className="text-[1.05rem] text-muted-foreground sm:text-balance sm:text-base md:max-w-[80%]">
              {description}
            </p>
          </div>
          <div className="w-full flex-1 pb-16 sm:pb-0">
            <ReleaseIndex releases={releases} />
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">
          <div className="flex flex-col gap-2 p-4 pt-0 text-sm">
            <p className="sticky top-0 h-6 bg-background font-medium text-muted-foreground text-xs">
              On This Page
            </p>
            {latestReleases.map((release) => (
              <Link
                key={release.tag}
                className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground"
                href={`#${getReleaseAnchor(release)}`}
              >
                {release.title}
              </Link>
            ))}
            {olderReleases.length > 0 ? (
              <Link
                className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground"
                href="#more-updates"
              >
                More Updates
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
