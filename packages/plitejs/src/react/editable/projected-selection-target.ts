import type { Point, Range } from '../..';
import { readAuthoredView } from '../../core/authored-runtime';
import { readRootChildren } from '../root-key';
import {
  createPliteViewBoundarySelectionTarget,
  hasAmbiguousPliteViewBoundarySegments,
} from '../view-boundary-graph';
import type { PliteViewSelection } from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

export type ProjectedSelectionTarget = {
  dependentRetainedSelection?: true;
  ranges: Range[];
  start: Point;
};

export type ProjectedSelectionTargetResolution =
  | { kind: 'ambiguous' }
  | { kind: 'retained' }
  | { kind: 'stale' }
  | { kind: 'target'; target: ProjectedSelectionTarget };

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

  return start
    ? {
        kind: 'target',
        target: {
          dependentRetainedSelection: true,
          ranges: target.ranges,
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
