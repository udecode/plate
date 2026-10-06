import type { Point, Range } from '../..';
import { readRootChildren } from '../root-key';
import {
  createPliteViewBoundarySelectionTarget,
  hasAmbiguousPliteViewBoundarySegments,
} from '../view-boundary-graph';
import type { PliteViewSelection } from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

export type ProjectedSelectionTarget = {
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
  if (hasRetainedSegments) {
    return { kind: 'retained' };
  }

  const liveSegments = viewSelection.segments.parts;

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

  return target ? { kind: 'target', target } : { kind: 'stale' };
};

export const createProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): ProjectedSelectionTarget | null => {
  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  return resolution.kind === 'target' ? resolution.target : null;
};
