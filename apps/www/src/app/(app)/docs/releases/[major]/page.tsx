import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import releaseIndexData from '@/generated/release-index.json';
import {
  getOlderReleaseMajorGroups,
  getReleaseAnchor,
  type ReleaseIndexRelease,
} from '@/lib/releases';
import { ReleasePageContent } from '../release-page-content';

type ReleaseMajorPageProps = {
  params: Promise<{
    major: string;
  }>;
};

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

const releases = releaseIndexData as ReleaseIndexRelease[];
const olderMajorGroups = getOlderReleaseMajorGroups(releases);

export function generateStaticParams() {
  return olderMajorGroups.map((group) => ({
    major: group.major,
  }));
}

export async function generateMetadata({
  params,
}: ReleaseMajorPageProps): Promise<Metadata> {
  const { major } = await params;
  const group = getOlderMajorGroup(major);

  if (!group) return {};

  const title = `v${group.major} Releases`;
  const description = `Release history for Plate v${group.major}.`;

  return {
    description,
    openGraph: {
      images: [
        {
          url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
        },
      ],
      title,
      type: 'article',
      url: `/docs/releases/${group.major}`,
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
}

export default async function ReleaseMajorPage({
  params,
}: ReleaseMajorPageProps) {
  const { major } = await params;
  const group = getOlderMajorGroup(major);

  if (!group) notFound();

  return (
    <ReleasePageContent
      releases={group.releases}
      sidebarLinks={group.releases.map((release) => ({
        href: `#${getReleaseAnchor(release)}`,
        label: release.title,
      }))}
      title={`v${group.major} Releases`}
    />
  );
}

function getOlderMajorGroup(major: string) {
  return olderMajorGroups.find((group) => group.major === major);
}
