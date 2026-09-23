import { RangeApi } from '../..';
import type { Point, Range } from '../..';
import {
  readAuthoredView,
  readAuthoredViewFragments,
} from '../../core/authored-runtime';
import { readRootChildren } from '../root-key';
import {
  createPliteViewBoundarySelectionTarget,
  hasAmbiguousPliteViewBoundarySegments,
} from '../view-boundary-graph';
import type { PliteViewSelection } from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

export type ProjectedSelectionTarget = {
  ranges: Range[];
  retained?:
    | Readonly<{ kind: 'blocked' }>
    | Readonly<{
        acceptedChangeIds: readonly string[];
        kind: 'resolve';
      }>;
  start: Point;
};

export type ProjectedSelectionTargetResolution =
  | { kind: 'ambiguous' }
  | { kind: 'retained' }
  | { kind: 'stale' }
  | { kind: 'target'; target: ProjectedSelectionTarget };

type ProjectedAuthoredChange = Readonly<{
  id: string;
  ranges: readonly Range[];
}>;

const resolveDirectReplacementChangeIds = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection,
  liveRanges: readonly Range[]
): readonly string[] | null => {
  const fragmentIdsByChange = new Map<string, Set<string>>();

  for (const [index, segment] of viewSelection.segments.parts.entries()) {
    const isInterior =
      index > 0 && index < viewSelection.segments.parts.length - 1;

    if (
      !segment.fragment ||
      (!isInterior &&
        (segment.start.kind !== 'boundary' || segment.end.kind !== 'boundary'))
    ) {
      continue;
    }

    const ids = fragmentIdsByChange.get(segment.fragment.changeId) ?? new Set();

    ids.add(segment.fragment.id);
    fragmentIdsByChange.set(segment.fragment.changeId, ids);
  }

  const fullySelectedRetained = new Set(
    [...fragmentIdsByChange.entries()]
      .filter(([changeId, selectedIds]) => {
        const fragments = readAuthoredViewFragments(editor, changeId);

        return (
          fragments.length > 0 &&
          fragments.every(
            (fragment) =>
              fragment.kind === 'delete' && selectedIds.has(fragment.id)
          )
        );
      })
      .map(([changeId]) => changeId)
  );

  if (
    [...fragmentIdsByChange.keys()].some(
      (changeId) => !fullySelectedRetained.has(changeId)
    )
  ) {
    return null;
  }

  const selected = new Set(fullySelectedRetained);

  for (const range of liveRanges) {
    const changes = editor.read.authored.changesAt(
      range
    ) as readonly ProjectedAuthoredChange[];

    for (const change of changes) {
      if (
        change.ranges.length > 0 &&
        change.ranges.every((changeRange) =>
          liveRanges.some(
            (liveRange) =>
              (liveRange.anchor.root ?? 'main') ===
                (changeRange.anchor.root ?? 'main') &&
              RangeApi.surrounds(liveRange, changeRange)
          )
        )
      ) {
        selected.add(change.id);
      }
    }
  }

  return [...selected].sort();
};

export const resolveProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): ProjectedSelectionTargetResolution => {
  if (hasAmbiguousPliteViewBoundarySegments(viewSelection.segments)) {
    return { kind: 'ambiguous' };
  }

  const hasRetainedSegments = viewSelection.segments.parts.some(
    (segment) => segment.fragment
  );
  if (hasRetainedSegments && readAuthoredView(editor)?.intent !== 'edit') {
    return { kind: 'retained' };
  }

  const liveSegments = hasRetainedSegments
    ? viewSelection.segments.parts.filter((segment) => !segment.fragment)
    : viewSelection.segments.parts;

  if (liveSegments.length === 0) {
    return { kind: 'retained' };
  }

  const roots = editor.read((state) =>
    Object.fromEntries(
      [...new Set(liveSegments.map((part) => part.root))].map((root) => [
        root,
        readRootChildren(state, root),
      ])
    )
  );
  const target = createPliteViewBoundarySelectionTarget(roots, {
    ...viewSelection,
    segments: {
      ...viewSelection.segments,
      parts: liveSegments,
    },
  });

  if (!target) return { kind: 'stale' };
  if (!hasRetainedSegments) return { kind: 'target', target };

  const start = target.ranges[0]?.anchor;
  const acceptedChangeIds = resolveDirectReplacementChangeIds(
    editor,
    viewSelection,
    target.ranges
  );

  return start
    ? {
        kind: 'target',
        target: {
          ranges: target.ranges,
          retained: acceptedChangeIds
            ? { acceptedChangeIds, kind: 'resolve' }
            : { kind: 'blocked' },
          start,
        },
      }
    : { kind: 'stale' };
};

export const createProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): ProjectedSelectionTarget | null => {
  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  return resolution.kind === 'target' ? resolution.target : null;
};
