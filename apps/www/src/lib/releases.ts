export type ReleaseIndexRelease = {
  content: string;
  date: string;
  packageTag?: string;
  tag: string;
  title: string;
  url: string;
  versionPackagePrUrl?: string;
};

export type ReleaseMajorGroup<
  TRelease extends Pick<ReleaseIndexRelease, 'tag'> = ReleaseIndexRelease,
> = {
  major: string;
  releases: TRelease[];
};

export const NUMBER_OF_CURRENT_RELEASE_MAJORS = 2;

export const releaseDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

const releaseMajorPattern = /^v?(\d+)(?:\.|$)/;

export function formatReleaseDate(date: string) {
  return releaseDateFormatter.format(new Date(date));
}

export function getCurrentReleaseMajorGroups(
  releases: ReleaseIndexRelease[],
  count = NUMBER_OF_CURRENT_RELEASE_MAJORS
) {
  return getReleaseMajorGroups(releases).slice(0, count);
}

export function getReleaseAnchor(release: Pick<ReleaseIndexRelease, 'tag'>) {
  const slug = release.tag
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');

  return `release-${slug || 'item'}`;
}

export function getReleaseMajor(
  release: Pick<ReleaseIndexRelease, 'tag'>
): string | undefined {
  return releaseMajorPattern.exec(release.tag)?.[1];
}

export function getReleaseMajorAnchor(major: string) {
  return `release-major-v${major}`;
}

export function getReleaseMajorGroups<
  TRelease extends Pick<ReleaseIndexRelease, 'tag'>,
>(releases: TRelease[]): ReleaseMajorGroup<TRelease>[] {
  const groupsByMajor = new Map<string, TRelease[]>();

  for (const release of releases) {
    const major = getReleaseMajor(release);

    if (!major) continue;

    groupsByMajor.set(major, [...(groupsByMajor.get(major) ?? []), release]);
  }

  return [...groupsByMajor.entries()].map(([major, majorReleases]) => ({
    major,
    releases: majorReleases,
  }));
}

export function getReleaseMajorPath(major: string) {
  return `/docs/releases/${major}`;
}

export function getOlderReleaseMajorGroups(
  releases: ReleaseIndexRelease[],
  currentMajorCount = NUMBER_OF_CURRENT_RELEASE_MAJORS
) {
  return getReleaseMajorGroups(releases).slice(currentMajorCount);
}
