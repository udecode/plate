import { createHash } from 'node:crypto';

import type {
  PlateUiReleaseChange,
  PlateUiReleaseChangesByTag,
} from '@/components/release-index';
import {
  getRegistryChangelogEvent,
  getRegistryChangelogIndex,
  type RegistryChangelogEntry,
  type RegistryChangelogEvent,
  type RegistryChangelogTarget,
} from '@/lib/registry-changelog';
import { UNRELEASED_PLATE_UI_RELEASE_TAG } from './plate-ui-release-tags';

export function getPlateUiReleaseChangesByTag() {
  const events = getRegistryChangelogIndex()
    .events.map((event) => getRegistryChangelogEvent(event.id))
    .filter((event): event is RegistryChangelogEvent => Boolean(event));

  return groupPlateUiReleaseChangesByTag(events);
}

function groupPlateUiReleaseChangesByTag(events: RegistryChangelogEvent[]) {
  const changesByTag: PlateUiReleaseChangesByTag = {};

  for (const event of events) {
    const tag = event.release.tag ?? UNRELEASED_PLATE_UI_RELEASE_TAG;

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
