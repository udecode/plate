export type ReleaseIndexRelease = {
  content: string;
  date: string;
  packageTag?: string;
  tag: string;
  title: string;
  url: string;
  versionPackagePrUrl?: string;
};

export const NUMBER_OF_LATEST_RELEASES = 5;

export const releaseDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

export function formatReleaseDate(date: string) {
  return releaseDateFormatter.format(new Date(date));
}

export function getReleaseAnchor(release: Pick<ReleaseIndexRelease, 'tag'>) {
  const slug = release.tag
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');

  return `release-${slug || 'item'}`;
}
